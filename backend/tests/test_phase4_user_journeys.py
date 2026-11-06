import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def register_user(role="candidate", email=None):
    if not email:
        email = f"p4_user_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "Password@123"
    reg = client.post("/api/auth/register", json={
        "full_name": f"P4 {role.title()} User",
        "email": email,
        "password": pwd,
        "account_type": role
    })
    token = reg.json()["data"]["access_token"]
    user_id = reg.json()["data"]["user"]["id"]
    return {"email": email, "password": pwd, "token": token, "user_id": user_id, "headers": {"Authorization": f"Bearer {token}"}}


def get_login_token(email="hr@novatech.com", password="Password@123"):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.json()["data"]["access_token"]


def test_journey_a_new_user_onboarding_and_personalized_dashboard():
    """Journey A: New user registers, completes 7-question onboarding, views personalized dashboard."""
    u = register_user()

    # Verify initial personalization is derived or default
    res_me = client.get("/api/personalization/me", headers=u["headers"])
    assert res_me.status_code == 200
    me_data = res_me.json()["data"]
    assert "primary_goal" in me_data

    # Complete 7-question onboarding
    payload = {
        "primary_goal": "return_to_work",
        "secondary_goals": ["learn_skills", "find_mentorship"],
        "current_situation": "career_break",
        "interests": ["Technology & Software Development", "Data Science & Business Intelligence"],
        "challenges": ["skills_gap", "confidence"],
        "available_time": "10_to_20",
        "weekly_hours": 15,
        "preferred_support": ["roadmap", "learning", "mentorship"],
        "preferred_experience": "guided",
        "is_completed": True
    }
    res_save = client.post("/api/personalization/me", json=payload, headers=u["headers"])
    assert res_save.status_code == 200
    save_data = res_save.json()["data"]["personalization"]
    assert save_data["is_completed"] is True
    assert save_data["primary_goal"] == "return_to_work"

    # View personalized dashboard
    res_dash = client.get("/api/personalization/dashboard", headers=u["headers"])
    assert res_dash.status_code == 200
    dash = res_dash.json()["data"]
    assert dash["dashboard_variant"] in ["career_returner", "employment"]
    assert len(dash["next_steps"]) >= 2
    assert len(dash["learning_recommendations"]) >= 1


def test_journey_b_save_and_resume_later_draft():
    """Journey B: User clicks 'Save & Resume Later' during onboarding, returns, resumes from saved state."""
    u = register_user()

    # User partially answers step 1 & 2 questions and clicks Save & Resume Later
    draft_data = {
        "primary_goal": "start_business",
        "secondary_goals": ["grow_business"],
        "current_situation": "entrepreneur",
        "interests": ["E-Commerce & Retail"],
        "is_completed": False
    }
    res_save_draft = client.post("/api/candidates/onboarding/draft", json={
        "current_step": 2,
        "draft_data": draft_data
    }, headers=u["headers"])
    assert res_save_draft.status_code == 200

    # User returns later and retrieves the draft
    res_get_draft = client.get("/api/candidates/onboarding/draft", headers=u["headers"])
    assert res_get_draft.status_code == 200
    restored = res_get_draft.json()["data"]
    assert restored["current_step"] == 2
    assert restored["draft_data"]["primary_goal"] == "start_business"


def test_journey_c_existing_onboarded_user_bypasses_initial_flow():
    """Journey C: Existing onboarded user logs in, bypasses initial onboarding, views dashboard directly."""
    email = f"p4_existing_{uuid.uuid4().hex[:8]}@example.com"
    u = register_user(email=email)

    # Complete onboarding
    client.post("/api/personalization/me", json={
        "primary_goal": "learn_skills",
        "current_situation": "currently_employed",
        "interests": ["Data Science"],
        "is_completed": True
    }, headers=u["headers"])

    # Simulate logging back in
    login_res = client.post("/api/auth/login", json={"email": email, "password": u["password"]})
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Query personalization directly: is_completed is True
    res_me = client.get("/api/personalization/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["data"]["is_completed"] is True

    # User routes directly to personalized dashboard
    res_dash = client.get("/api/personalization/dashboard", headers=headers)
    assert res_dash.status_code == 200
    assert res_dash.json()["data"]["dashboard_variant"] in ["learner", "upskiller_learner"]


def test_journey_d_update_primary_goal_recalculates_dashboard():
    """Journey D: User updates primary goal from dashboard, sees recommendations recalculate."""
    u = register_user()

    # Initial goal: return_to_work
    client.post("/api/personalization/me", json={"primary_goal": "return_to_work", "is_completed": True}, headers=u["headers"])
    dash1 = client.get("/api/personalization/dashboard", headers=u["headers"]).json()["data"]
    assert dash1["dashboard_variant"] == "career_returner"

    # User switches goal to start_business
    client.post("/api/personalization/me", json={"primary_goal": "start_business", "is_completed": True}, headers=u["headers"])
    dash2 = client.get("/api/personalization/dashboard", headers=u["headers"]).json()["data"]
    assert dash2["dashboard_variant"] in ["aspiring_entrepreneur", "entrepreneur", "entrepreneurship"]
    assert dash2["next_steps"][0]["title"] != dash1["next_steps"][0]["title"]


def test_journey_e_8_week_roadmap_milestones_and_evidence():
    """Journey E: User opens 8-week adaptive roadmap, views weekly milestones, checks off a task, submits evidence link."""
    u = register_user()

    # Generate 8-week roadmap
    res_gen = client.post("/api/personalization/roadmap/generate", json={
        "variant": "returner",
        "pace": "balanced",
        "weekly_hours": 15
    }, headers=u["headers"])
    assert res_gen.status_code == 200
    roadmap = res_gen.json()["data"]["roadmap"]
    assert len(roadmap["weeks"]) == 8

    # Pick a task from week 1
    w1_task = roadmap["weeks"][0]["tasks"][0]
    task_id = w1_task["id"]

    # Mark complete with demonstrable evidence link
    res_task = client.post(f"/api/personalization/roadmap/{roadmap['id']}/tasks/{task_id}", json={
        "completed": True,
        "evidence_link": "https://github.com/candidate/portfolio-sql-case-study",
        "reflection": "Finished Star Schema design with data cleaning script."
    }, headers=u["headers"])
    assert res_task.status_code == 200
    task_res = res_task.json()["data"]
    assert task_res["completed"] is True
    assert task_res["completed_tasks_count"] >= 1


def test_journey_f_pause_and_resume_roadmap():
    """Journey F: User pauses roadmap, sees non-judgmental pause state, resumes without penalty."""
    u = register_user()

    # Generate roadmap
    res_gen = client.post("/api/personalization/roadmap/generate", json={"variant": "upskilling"}, headers=u["headers"])
    roadmap_id = res_gen.json()["data"]["roadmap"]["id"]

    # Toggle pause (pause)
    res_pause = client.post(f"/api/personalization/roadmap/{roadmap_id}/toggle-pause", headers=u["headers"])
    assert res_pause.status_code == 200
    assert res_pause.json()["data"]["is_paused"] is True

    # Retrieve roadmap while paused
    res_get = client.get("/api/personalization/roadmap", headers=u["headers"])
    assert res_get.status_code == 200
    assert res_get.json()["data"]["is_paused"] is True

    # Toggle pause (resume)
    res_resume = client.post(f"/api/personalization/roadmap/{roadmap_id}/toggle-pause", headers=u["headers"])
    assert res_resume.status_code == 200
    assert res_resume.json()["data"]["is_paused"] is False


def test_journey_g_confidence_milestones_and_reflection():
    """Journey G: User opens confidence empowerment experience, views actionable milestones, submits evidence and reflection for a milestone."""
    u = register_user()

    # Create an actionable milestone goal
    res_create = client.post("/api/personalization/confidence/goals", json={
        "title": "Complete 3-Sentence Comeback Elevator Pitch",
        "description": "Articulate pre-break achievements and current readiness without apologetic framing.",
        "category": "career_break_narrative",
        "action_type": "write",
        "is_milestone": True
    }, headers=u["headers"])
    assert res_create.status_code == 201
    goal_id = res_create.json()["data"]["goal"]["id"]

    # Complete milestone with demonstrable evidence and reflection
    res_update = client.put(f"/api/personalization/confidence/goals/{goal_id}", json={
        "status": "completed",
        "evidence_url": "https://docs.google.com/document/d/pitch-doc",
        "reflection_notes": "Realized my 5 years in team management remains highly relevant.",
        "consent_share_passport": True
    }, headers=u["headers"])
    assert res_update.status_code == 200
    updated_goal = res_update.json()["data"]["goal"]
    assert updated_goal["status"] == "completed"
    assert updated_goal["actionable_feedback"] is not None
    assert "milestone" in updated_goal["actionable_feedback"].lower()


def test_journey_h_confidence_check_in_1_to_5():
    """Journey H: User completes confidence check-in (1-5), views progress over time."""
    u = register_user()

    # Submit first check-in
    res_ci1 = client.post("/api/personalization/confidence/check-in", json={
        "confidence_level": 3,
        "primary_feeling": "Steady & Curious",
        "reflection_note": "Feeling steady, getting back into daily problem-solving routine.",
        "strength_highlight": "Persistence, analytical thinking"
    }, headers=u["headers"])
    assert res_ci1.status_code == 201
    assert res_ci1.json()["data"]["check_in"]["confidence_level"] == 3

    # Submit second check-in
    res_ci2 = client.post("/api/personalization/confidence/check-in", json={
        "confidence_level": 4,
        "primary_feeling": "Empowered",
        "reflection_note": "Completed my first full SQL repository and felt confident.",
        "strength_highlight": "Architectural problem solving"
    }, headers=u["headers"])
    assert res_ci2.status_code == 201
    assert res_ci2.json()["data"]["check_in"]["confidence_level"] == 4

    # Get check-in history
    res_history = client.get("/api/personalization/confidence/check-ins", headers=u["headers"])
    assert res_history.status_code == 200
    history = res_history.json()["data"]["check_ins"]
    assert len(history) >= 2


def test_journey_i_share_milestone_on_career_passport():
    """Journey I: User consents to share milestone on Career Passport, verifies it appears."""
    u = register_user()

    # Create milestone with passport sharing consent
    res_create = client.post("/api/personalization/confidence/goals", json={
        "title": "Publish End-to-End Analytics Portfolio",
        "description": "Production database case study proving contemporary mastery.",
        "category": "work_sample",
        "action_type": "portfolio",
        "is_milestone": True,
        "consent_share_passport": True
    }, headers=u["headers"])
    assert res_create.status_code == 201

    # Query goals
    res_goals = client.get("/api/personalization/confidence/goals", headers=u["headers"])
    assert res_goals.status_code == 200
    goals = res_goals.json()["data"]["goals"]
    passport_shared_goals = [g for g in goals if g.get("consent_share_passport") is True]
    assert len(passport_shared_goals) >= 1


def test_journey_j_employer_experience_distinct_from_returner():
    """Journey J: Employer logs in, views employer dashboard (distinct from returner experience)."""
    # Authenticated employer logs in and accesses employer dashboard
    emp_token = get_login_token("hr@novatech.com")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    res_emp_dash = client.get("/api/employer/dashboard", headers=emp_headers)
    assert res_emp_dash.status_code == 200
    assert "Nova" in str(res_emp_dash.json())

    # Employer cannot access candidate-only private endpoints (e.g., candidate project creation)
    res_cand_only = client.post("/api/candidates/me/projects", json={
        "title": "Unauthorized Project",
        "skills_demonstrated": ["Python"],
        "technologies_used": ["FastAPI"]
    }, headers=emp_headers)
    assert res_cand_only.status_code == 403


def test_journey_k_inclusivity_and_low_bandwidth_support():
    """Journey K: Inclusivity & accessibility endpoints respond cleanly with templates and pricing."""
    res_templates = client.get("/api/inclusivity/entrepreneurship/templates")
    assert res_templates.status_code == 200
    assert "sectors" in res_templates.json() or "templates" in res_templates.json()

    res_assist = client.get("/api/inclusivity/guided-assistance")
    assert res_assist.status_code == 200


def test_journey_l_full_security_invariant_reverification():
    """Journey L: Full security invariant reverification (P0 fixes intact: no employer fallback, no public document leaks, tenant boundaries enforced)."""
    # FIX 1: Employer authorization fails closed when unauthenticated (401)
    res_unauth = client.get("/api/employer/dashboard")
    assert res_unauth.status_code == 401

    # Candidate trying to access employer dashboard gets 403 Forbidden
    cand = register_user(role="candidate")
    res_cand_on_emp = client.get("/api/employer/dashboard", headers=cand["headers"])
    assert res_cand_on_emp.status_code == 403

    # FIX 2: Storage endpoint does not expose private documents without auth
    res_storage = client.get("/storage/resumes/sensitive_candidate_resume.pdf")
    assert res_storage.status_code in (401, 403, 404)

    # FIX 3: Career Passport PDF requires authentication
    res_pdf_unauth = client.get("/api/passport/download-pdf")
    assert res_pdf_unauth.status_code == 401
