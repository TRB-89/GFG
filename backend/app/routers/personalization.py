from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.middleware.auth_middleware import get_current_user
from backend.app.schemas.common import success_response, error_response
from backend.app.schemas.personalization import (
    PersonalizationSaveRequest,
    PersonalizationResponse,
    PersonalizedDashboardResponse,
    ConfidenceGoalCreate,
    ConfidenceGoalUpdate,
    ConfidenceGoalResponse,
    ConfidenceCheckInCreate,
    ConfidenceCheckInResponse,
    RoadmapGenerateRequest,
    RoadmapTaskUpdate,
    AdaptiveRoadmapResponse,
)
from backend.app.services.personalization_service import (
    get_or_create_personalization,
    save_user_personalization,
    generate_personalized_dashboard_data,
    get_user_confidence_goals,
    create_confidence_goal,
    update_confidence_goal,
    submit_confidence_check_in,
    get_confidence_check_ins,
    generate_8_week_structured_roadmap,
    update_roadmap_task_state,
)

router = APIRouter(prefix="/api/personalization", tags=["Personalization & Career Rebuilding"])

# ==============================================================================
# CHECKPOINT 1: USER PERSONALIZATION PREFERENCES
# ==============================================================================

@router.get("/me")
def get_my_personalization(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the user's current personalized career preferences across the 7 core questions.
    If the user previously completed onboarding without this record, safe preferences are derived
    automatically without modifying existing profile data or requiring re-onboarding.
    """
    pers = get_or_create_personalization(db, current_user)
    explanation = f"Calibrated for '{pers.primary_goal}' with {pers.weekly_hours} hours/week availability."
    return success_response({
        "id": pers.id,
        "user_id": pers.user_id,
        "primary_goal": pers.primary_goal,
        "secondary_goals": pers.secondary_goals or [],
        "current_situation": pers.current_situation,
        "interests": pers.interests or [],
        "challenges": pers.challenges or [],
        "available_time": pers.available_time or "5_to_10",
        "weekly_hours": pers.weekly_hours or 10,
        "preferred_support": pers.preferred_support or [],
        "preferred_experience": pers.preferred_experience or "blended",
        "priority_order": pers.priority_order or [],
        "is_completed": pers.is_completed,
        "explanation": explanation,
        "updated_at": pers.updated_at.isoformat() if pers.updated_at else None,
    })


@router.post("/me")
def save_my_personalization(
    payload: PersonalizationSaveRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves or partially updates personalization preferences across the 7 questions.
    Enables progress saving, resuming, and editing preferences at any time.
    """
    data = payload.model_dump(exclude_unset=True)
    pers = save_user_personalization(db, current_user, data)
    return success_response({
        "message": "Personalization preferences successfully saved.",
        "personalization": {
            "id": pers.id,
            "primary_goal": pers.primary_goal,
            "secondary_goals": pers.secondary_goals,
            "current_situation": pers.current_situation,
            "interests": pers.interests,
            "challenges": pers.challenges,
            "weekly_hours": pers.weekly_hours,
            "available_time": pers.available_time,
            "preferred_support": pers.preferred_support,
            "preferred_experience": pers.preferred_experience,
            "priority_order": pers.priority_order,
            "is_completed": pers.is_completed,
            "updated_at": pers.updated_at.isoformat() if pers.updated_at else None,
        }
    })


# ==============================================================================
# CHECKPOINT 2: PERSONALIZED DASHBOARD RECOMMENDATIONS
# ==============================================================================

@router.get("/dashboard")
def get_personalized_dashboard(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a deterministic, explainable dashboard based on the user's explicit goals and time.
    Provides transparent reasoning for every priority module and recommendation.
    """
    pers = get_or_create_personalization(db, current_user)
    dashboard_data = generate_personalized_dashboard_data(db, current_user, pers)
    return success_response(dashboard_data)


# ==============================================================================
# CHECKPOINT 3: CONFIDENCE REBUILD JOURNEY
# ==============================================================================

@router.get("/confidence/goals")
def list_confidence_goals(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists all confidence rebuild goals and action milestones for the user."""
    goals = get_user_confidence_goals(db, current_user.id)
    items = []
    for g in goals:
        items.append({
            "id": g.id,
            "category": g.category,
            "title": g.title,
            "description": g.description,
            "action_type": g.action_type,
            "status": g.status,
            "evidence_url": g.evidence_url,
            "reflection_notes": g.reflection_notes,
            "actionable_feedback": g.actionable_feedback,
            "is_milestone": g.is_milestone,
            "verified_by": g.verified_by,
            "consent_share_passport": g.consent_share_passport,
            "completed_at": g.completed_at.isoformat() if g.completed_at else None,
            "created_at": g.created_at.isoformat() if g.created_at else None,
        })
    return success_response({"total": len(items), "goals": items})


@router.post("/confidence/goals", status_code=status.HTTP_201_CREATED)
def add_confidence_goal(
    payload: ConfidenceGoalCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new user-defined actionable micro-goal or milestone."""
    goal = create_confidence_goal(db, current_user.id, payload.model_dump())
    return success_response({
        "message": "Confidence action goal created.",
        "goal": {
            "id": goal.id,
            "title": goal.title,
            "category": goal.category,
            "status": goal.status,
            "is_milestone": goal.is_milestone,
        }
    })


@router.put("/confidence/goals/{goal_id}")
def update_goal(
    goal_id: str,
    payload: ConfidenceGoalUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates goal completion status, attaches evidence links, reflection notes, and feedback."""
    goal = update_confidence_goal(db, current_user.id, goal_id, payload.model_dump(exclude_unset=True))
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "GOAL_NOT_FOUND", "message": "Confidence goal not found or not owned by user."}
        )
    return success_response({
        "message": "Goal updated successfully.",
        "goal": {
            "id": goal.id,
            "status": goal.status,
            "evidence_url": goal.evidence_url,
            "reflection_notes": goal.reflection_notes,
            "actionable_feedback": goal.actionable_feedback,
            "completed_at": goal.completed_at.isoformat() if goal.completed_at else None,
        }
    })


@router.post("/confidence/check-in", status_code=status.HTTP_201_CREATED)
def create_check_in(
    payload: ConfidenceCheckInCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Records an optional, non-judgmental self-reported confidence check-in (scale 1 to 5)."""
    check_in = submit_confidence_check_in(db, current_user.id, payload.model_dump())
    return success_response({
        "message": "Confidence check-in recorded.",
        "check_in": {
            "id": check_in.id,
            "confidence_level": check_in.confidence_level,
            "primary_feeling": check_in.primary_feeling,
            "created_at": check_in.created_at.isoformat(),
        }
    })


@router.get("/confidence/check-ins")
def list_check_ins(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves self-reported check-in history."""
    records = get_confidence_check_ins(db, current_user.id)
    items = [
        {
            "id": r.id,
            "confidence_level": r.confidence_level,
            "primary_feeling": r.primary_feeling,
            "reflection_note": r.reflection_note,
            "strength_highlight": r.strength_highlight,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]
    return success_response({"total": len(items), "check_ins": items})


# ==============================================================================
# CHECKPOINT 4: ADAPTIVE EIGHT-WEEK ROADMAP
# ==============================================================================

@router.get("/roadmap")
def get_active_roadmap(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the user's active 8-week structured roadmap with completed task evidence.
    If none exists, generates one aligned with the user's personalization preferences.
    """
    pers = get_or_create_personalization(db, current_user)
    cand_id = current_user.candidate_profile.id if current_user.candidate_profile else current_user.id
    from backend.app.models.ai import LearningRoadmap
    existing = db.query(LearningRoadmap).filter(
        LearningRoadmap.candidate_id == cand_id,
        LearningRoadmap.status.in_(["active", "paused"])
    ).first()

    if existing and existing.weeks_data and len(existing.weeks_data) > 0:
        roadmap = existing
    else:
        variant_map = {
            "return_to_work": "employment",
            "learn_skills": "upskilling",
            "start_business": "entrepreneurship",
            "grow_business": "entrepreneurship",
            "find_mentorship": "freelancing",
            "explore_careers": "employment",
        }
        variant = variant_map.get(pers.primary_goal or "return_to_work", "employment")
        roadmap = generate_8_week_structured_roadmap(
            db,
            current_user,
            variant=variant,
            pace="steady",
            weekly_hours=pers.weekly_hours or 10
        )

    weeks = roadmap.weeks_data or []
    completed_ids = set(roadmap.completed_task_ids or [])
    total_tasks = sum(len(w.get("tasks", [])) for w in weeks)
    completed_count = len(completed_ids)
    progress_pct = int((completed_count / total_tasks * 100)) if total_tasks > 0 else 0

    return success_response({
        "id": roadmap.id,
        "variant": roadmap.variant or "employment",
        "pace": roadmap.pace or "steady",
        "target_role": roadmap.target_role,
        "status": roadmap.status,
        "is_paused": bool(roadmap.is_paused),
        "total_weeks": len(weeks),
        "total_tasks_count": total_tasks,
        "completed_tasks_count": completed_count,
        "progress_percentage": progress_pct,
        "explanation": f"8-Week {roadmap.variant.capitalize()} Roadmap calibrated for {pers.weekly_hours} hrs/week.",
        "weeks": weeks,
        "updated_at": roadmap.updated_at.isoformat() if roadmap.updated_at else None,
    })


@router.post("/roadmap/generate")
def regenerate_roadmap(
    payload: RoadmapGenerateRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates or recalibrates the 8-week roadmap for a specific variant (employment, upskilling,
    freelancing, entrepreneurship) and pace, preserving completed task history.
    """
    roadmap = generate_8_week_structured_roadmap(
        db,
        current_user,
        variant=payload.variant or "employment",
        pace=payload.pace or "steady",
        weekly_hours=payload.weekly_hours or 10,
        target_role=payload.target_role_or_venture
    )

    weeks = roadmap.weeks_data or []
    completed_ids = set(roadmap.completed_task_ids or [])
    total_tasks = sum(len(w.get("tasks", [])) for w in weeks)
    completed_count = len(completed_ids)
    progress_pct = int((completed_count / total_tasks * 100)) if total_tasks > 0 else 0

    return success_response({
        "message": f"8-Week roadmap recalibrated for '{payload.variant}' track.",
        "roadmap": {
            "id": roadmap.id,
            "variant": roadmap.variant,
            "pace": roadmap.pace,
            "status": roadmap.status,
            "is_paused": bool(roadmap.is_paused),
            "total_weeks": len(weeks),
            "completed_tasks_count": completed_count,
            "total_tasks_count": total_tasks,
            "progress_percentage": progress_pct,
            "weeks": weeks,
        }
    })


@router.post("/roadmap/{roadmap_id}/tasks/{task_id}")
def update_task_state(
    roadmap_id: str,
    task_id: str,
    payload: RoadmapTaskUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks a roadmap task completed/incomplete, attaching evidence links and personal reflection."""
    roadmap = update_roadmap_task_state(
        db,
        roadmap_id,
        task_id,
        payload.completed,
        payload.evidence_link,
        payload.reflection
    )
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "ROADMAP_NOT_FOUND", "message": "Roadmap not found or invalid task."}
        )

    completed_count = len(roadmap.completed_task_ids or [])
    total_tasks = sum(len(w.get("tasks", [])) for w in (roadmap.weeks_data or []))
    progress_pct = int((completed_count / total_tasks * 100)) if total_tasks > 0 else 0

    return success_response({
        "message": "Roadmap task progress recorded.",
        "task_id": task_id,
        "completed": payload.completed,
        "completed_tasks_count": completed_count,
        "progress_percentage": progress_pct,
    })


@router.post("/roadmap/{roadmap_id}/toggle-pause")
def toggle_roadmap_pause(
    roadmap_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows users to pause or resume their roadmap at any time without penalty or guilt."""
    from backend.app.models.ai import LearningRoadmap
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "ROADMAP_NOT_FOUND", "message": "Roadmap not found."}
        )
    roadmap.is_paused = not bool(roadmap.is_paused)
    roadmap.status = "paused" if roadmap.is_paused else "active"
    db.commit()
    db.refresh(roadmap)
    return success_response({
        "id": roadmap.id,
        "is_paused": roadmap.is_paused,
        "status": roadmap.status,
        "message": f"Roadmap {'paused. Take your time, your progress is safely preserved.' if roadmap.is_paused else 'resumed. Welcome back!'}"
    })

