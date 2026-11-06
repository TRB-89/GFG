import pytest
import uuid
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, UserPersonalization, ConfidenceGoal, ConfidenceCheckIn
from backend.app.models.ai import LearningRoadmap
from backend.app.services.personalization_service import (
    get_or_create_personalization,
    save_user_personalization,
    generate_personalized_dashboard_data,
    generate_8_week_structured_roadmap,
    update_roadmap_task_state,
)

def test_checkpoint1_get_or_create_personalization_derives_safe_defaults(db_session, candidate_user):
    """
    Checkpoint 1: For existing users who completed earlier onboarding,
    safe preferences are derived automatically from existing data without forcing re-onboarding.
    """
    user = candidate_user["user"]
    pers = get_or_create_personalization(db_session, user)

    assert pers is not None
    assert pers.user_id == user.id
    assert pers.primary_goal in ["return_to_work", "learn_skills", "start_business"]
    assert pers.weekly_hours >= 5
    assert len(pers.interests) > 0
    assert len(pers.challenges) > 0
    assert pers.is_completed is True  # candidate_user is already onboarded


def test_checkpoint1_save_personalization_partial_and_resuming(db_session, client, candidate_user):
    """
    Checkpoint 1: Users can save progress, resume interrupted onboarding,
    and edit preferences at any time.
    """
    token = candidate_user["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Partial save of questions 1 & 2
    res1 = client.post("/api/personalization/me", json={
        "primary_goal": "start_business",
        "current_situation": "entrepreneur",
        "is_completed": False
    }, headers=headers)
    assert res1.status_code == 200
    data1 = res1.json()["data"]["personalization"]
    assert data1["primary_goal"] == "start_business"
    assert data1["is_completed"] is False

    # 2. Later resume and complete all 7 questions
    res2 = client.post("/api/personalization/me", json={
        "primary_goal": "start_business",
        "secondary_goals": ["learn_skills"],
        "current_situation": "entrepreneur",
        "interests": ["Digital Marketing", "Business Strategy"],
        "challenges": ["financial_constraints", "guidance"],
        "available_time": "10_to_20",
        "weekly_hours": 15,
        "preferred_support": ["business_guidance", "roadmap"],
        "preferred_experience": "guided",
        "is_completed": True
    }, headers=headers)
    assert res2.status_code == 200
    data2 = res2.json()["data"]["personalization"]
    assert data2["primary_goal"] == "start_business"
    assert data2["weekly_hours"] == 15
    assert data2["is_completed"] is True

    # 3. Fetch via GET /api/personalization/me
    get_res = client.get("/api/personalization/me", headers=headers)
    assert get_res.status_code == 200
    get_data = get_res.json()["data"]
    assert get_data["primary_goal"] == "start_business"
    assert get_data["preferred_experience"] == "guided"
    assert "explanation" in get_data


def test_checkpoint2_personalized_dashboard_career_returner(client, candidate_user):
    """
    Checkpoint 2: For returners, dashboard prioritizes Career Passport,
    portfolio projects, and returnship opportunities with transparent explanations.
    """
    token = candidate_user["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Set goal to return_to_work
    client.post("/api/personalization/me", json={
        "primary_goal": "return_to_work",
        "current_situation": "career_break",
        "available_time": "10_to_20",
        "weekly_hours": 12,
        "challenges": ["confidence", "skills_gap"],
        "interests": ["Data Analytics"],
        "is_completed": True
    }, headers=headers)

    res = client.get("/api/personalization/dashboard", headers=headers)
    assert res.status_code == 200
    dash = res.json()["data"]

    assert dash["dashboard_variant"] == "career_returner"
    assert len(dash["next_steps"]) >= 2
    # Check that reasons are transparent and not psychological scoring
    assert any("Return to Employment" in step["reason"] or "confidence" in step["reason"].lower() for step in dash["next_steps"])
    assert len(dash["learning_recommendations"]) > 0
    assert len(dash["opportunities"]) > 0


def test_checkpoint2_personalized_dashboard_entrepreneur(client, candidate_user):
    """
    Checkpoint 2: For entrepreneurs, dashboard prioritizes venture builder,
    service pricing, and client proposals.
    """
    token = candidate_user["token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/personalization/me", json={
        "primary_goal": "start_business",
        "current_situation": "entrepreneur",
        "weekly_hours": 20,
        "interests": ["FinTech Consultancy"],
        "is_completed": True
    }, headers=headers)

    res = client.get("/api/personalization/dashboard", headers=headers)
    assert res.status_code == 200
    dash = res.json()["data"]

    assert dash["dashboard_variant"] == "aspiring_entrepreneur"
    assert any("Venture Builder" in step["badge"] or "business" in step["reason"].lower() for step in dash["next_steps"])


def test_checkpoint3_confidence_goals_lifecycle_and_actionable_feedback(client, candidate_user):
    """
    Checkpoint 3: Confidence journey is grounded in demonstrable action,
    storing tasks, evidence links, reflection notes, and returning actionable feedback.
    """
    token = candidate_user["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch starter goals
    list_res = client.get("/api/personalization/confidence/goals", headers=headers)
    assert list_res.status_code == 200
    assert list_res.json()["data"]["total"] >= 1

    # 2. Create custom action goal
    create_res = client.post("/api/personalization/confidence/goals", json={
        "category": "work_sample",
        "title": "Build Executive Returnship Portfolio Deck",
        "description": "5-slide summary of high-impact engineering accomplishments.",
        "action_type": "upload",
        "is_milestone": True,
        "consent_share_passport": True
    }, headers=headers)
    assert create_res.status_code == 201
    goal_id = create_res.json()["data"]["goal"]["id"]

    # 3. Complete goal with evidence URL and reflection
    update_res = client.put(f"/api/personalization/confidence/goals/{goal_id}", json={
        "status": "completed",
        "evidence_url": "https://drive.google.com/sample-deck",
        "reflection_notes": "Felt empowering to articulate project deliverables clearly.",
        "consent_share_passport": True
    }, headers=headers)
    assert update_res.status_code == 200
    updated_goal = update_res.json()["data"]["goal"]
    assert updated_goal["status"] == "completed"
    assert updated_goal["evidence_url"] == "https://drive.google.com/sample-deck"
    assert updated_goal["actionable_feedback"] is not None
    assert updated_goal["completed_at"] is not None


def test_checkpoint3_confidence_self_reported_check_in(client, candidate_user):
    """
    Checkpoint 3: Non-judgmental, optional self-reported confidence check-ins.
    Zero inferred confidence from cameras or manipulative shame-based streaks.
    """
    token = candidate_user["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit check-in
    post_res = client.post("/api/personalization/confidence/check-in", json={
        "confidence_level": 4,
        "primary_feeling": "Ready & Focused",
        "reflection_note": "Completed first modular milestone today.",
        "strength_highlight": "Problem-solving and persistence"
    }, headers=headers)
    assert post_res.status_code == 201
    assert post_res.json()["data"]["check_in"]["confidence_level"] == 4

    # List check-in history
    get_res = client.get("/api/personalization/confidence/check-ins", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["total"] >= 1
    assert get_res.json()["data"]["check_ins"][0]["confidence_level"] == 4


def test_checkpoint4_adaptive_8_week_roadmap_generation_and_task_progress(client, candidate_user):
    """
    Checkpoint 4: 8-week structured roadmap with measurable weekly tasks,
    editable progress, and persistent state.
    """
    token = candidate_user["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch or generate active roadmap
    res = client.get("/api/personalization/roadmap", headers=headers)
    assert res.status_code == 200
    roadmap = res.json()["data"]

    assert roadmap["total_weeks"] == 8
    assert len(roadmap["weeks"]) == 8
    first_week = roadmap["weeks"][0]
    assert len(first_week["tasks"]) >= 2
    task1 = first_week["tasks"][0]
    task1_id = task1["id"]

    # 2. Complete task 1 with evidence
    update_res = client.post(f"/api/personalization/roadmap/{roadmap['id']}/tasks/{task1_id}", json={
        "completed": True,
        "evidence_link": "https://github.com/candidate/portfolio-audit",
        "reflection": "Cataloged 4 technical proficiencies and 2 target certifications."
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["data"]["completed"] is True
    assert update_res.json()["data"]["completed_tasks_count"] >= 1


def test_checkpoint4_adaptive_roadmap_pause_and_resume(client, candidate_user):
    """
    Checkpoint 4: Users can pause or resume roadmaps at any time without penalty.
    """
    token = candidate_user["token"]
    headers = {"Authorization": f"Bearer {token}"}

    get_res = client.get("/api/personalization/roadmap", headers=headers)
    roadmap_id = get_res.json()["data"]["id"]

    # Toggle pause
    pause_res = client.post(f"/api/personalization/roadmap/{roadmap_id}/toggle-pause", headers=headers)
    assert pause_res.status_code == 200
    assert pause_res.json()["data"]["is_paused"] is True
    assert "paused" in pause_res.json()["data"]["message"].lower()

    # Toggle resume
    resume_res = client.post(f"/api/personalization/roadmap/{roadmap_id}/toggle-pause", headers=headers)
    assert resume_res.status_code == 200
    assert resume_res.json()["data"]["is_paused"] is False
    assert "resumed" in resume_res.json()["data"]["message"].lower()


def test_checkpoint4_roadmap_recalibration_preserves_completed_tasks(client, candidate_user):
    """
    Checkpoint 4: Recalibrating roadmap preserves completed tasks and demonstrable evidence.
    """
    token = candidate_user["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch roadmap and mark week 1 task 1 complete
    res = client.get("/api/personalization/roadmap", headers=headers)
    roadmap = res.json()["data"]
    task1_id = roadmap["weeks"][0]["tasks"][0]["id"]

    client.post(f"/api/personalization/roadmap/{roadmap['id']}/tasks/{task1_id}", json={
        "completed": True,
        "evidence_link": "https://github.com/preserved-evidence"
    }, headers=headers)

    # Regenerate for entrepreneurship track
    regen_res = client.post("/api/personalization/roadmap/generate", json={
        "variant": "entrepreneurship",
        "pace": "accelerator",
        "weekly_hours": 15
    }, headers=headers)
    assert regen_res.status_code == 200
    new_roadmap = regen_res.json()["data"]["roadmap"]
    assert new_roadmap["variant"] == "entrepreneurship"
    # Completed task count is preserved
    assert new_roadmap["completed_tasks_count"] >= 1

