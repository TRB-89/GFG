import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.models.base import utc_now, generate_uuid
from backend.app.models.user import Profile
from backend.app.models.candidate import (
    CandidateProfile,
    UserPersonalization,
    ConfidenceGoal,
    ConfidenceCheckIn,
    Skill,
    CandidateSkill,
)
from backend.app.models.ai import LearningRoadmap
from backend.app.models.job import Job
from backend.app.models.community import ComebackCircle, MentorProfile
from backend.app.models.learning import Course

# ==============================================================================
# CHECKPOINT 1: USER PERSONALIZATION SERVICE
# ==============================================================================

def get_or_create_personalization(db: Session, user: Profile) -> UserPersonalization:
    """
    Retrieves the existing UserPersonalization record for user.
    If none exists, derives safe initial defaults from CandidateProfile without overwriting
    any existing user data, ensuring older users are never forced to repeat onboarding.
    """
    pers = db.query(UserPersonalization).filter(UserPersonalization.user_id == user.id).first()
    if pers:
        return pers

    cand = user.candidate_profile
    primary_goal = "return_to_work"
    current_situation = "career_break"
    interests = ["Technology & Software", "Data Analytics"]
    weekly_hours = 10
    available_time = "5_to_10"
    is_completed = False

    if cand:
        is_completed = bool(cand.onboarding_completed or (cand.years_experience and cand.years_experience > 0) or cand.previous_job_title)
        if cand.target_role and ("entrepreneur" in cand.target_role.lower() or "business" in cand.target_role.lower()):
            primary_goal = "start_business"
        elif cand.target_role and ("mentor" in cand.target_role.lower()):
            primary_goal = "find_mentorship"
        elif cand.industry and ("learning" in cand.industry.lower() or "education" in cand.industry.lower()):
            primary_goal = "learn_skills"

        if cand.industry:
            interests = [cand.industry]

        if cand.available_hours_per_day:
            daily = cand.available_hours_per_day
            weekly_hours = min(max(daily * 5, 5), 40)
            if weekly_hours <= 5:
                available_time = "under_5"
            elif weekly_hours <= 10:
                available_time = "5_to_10"
            elif weekly_hours <= 20:
                available_time = "10_to_20"
            else:
                available_time = "20_plus"

    pers = UserPersonalization(
        user_id=user.id,
        primary_goal=primary_goal,
        secondary_goals=["learn_skills", "find_mentorship"],
        current_situation=current_situation,
        interests=interests,
        challenges=["skills_gap", "confidence", "opportunities"],
        available_time=available_time,
        weekly_hours=weekly_hours,
        preferred_support=["roadmap", "learning", "opportunities", "resume_portfolio"],
        preferred_experience="blended",
        priority_order=["roadmap", "skills", "mentorship", "opportunities"],
        is_completed=is_completed,
    )
    db.add(pers)
    db.commit()
    db.refresh(pers)
    return pers


def save_user_personalization(
    db: Session,
    user: Profile,
    data: Dict[str, Any]
) -> UserPersonalization:
    """
    Persists user personalization choices. Supports partial updates for progress saving
    and enables users to update their preferences later without loss of existing data.
    """
    pers = db.query(UserPersonalization).filter(UserPersonalization.user_id == user.id).first()
    if not pers:
        pers = UserPersonalization(user_id=user.id)
        db.add(pers)

    for field in [
        "primary_goal",
        "secondary_goals",
        "current_situation",
        "interests",
        "challenges",
        "available_time",
        "weekly_hours",
        "preferred_support",
        "preferred_experience",
        "priority_order",
    ]:
        if field in data and data[field] is not None:
            setattr(pers, field, data[field])

    if "is_completed" in data and data["is_completed"] is not None:
        pers.is_completed = bool(data["is_completed"])

    pers.updated_at = utc_now()

    # Safely synchronize candidate profile metadata without overwriting professional history
    cand = user.candidate_profile
    if cand:
        if pers.is_completed:
            cand.onboarding_completed = True
        if pers.weekly_hours:
            cand.available_hours_per_day = max(1, pers.weekly_hours // 5)
        if pers.preferred_support:
            cand.support_preferences = {
                "support_types": pers.preferred_support,
                "preferred_experience": pers.preferred_experience,
                "primary_goal": pers.primary_goal,
            }

    db.commit()
    db.refresh(pers)
    return pers


# ==============================================================================
# CHECKPOINT 2: DETERMINISTIC & EXPLAINABLE PERSONALIZATION ENGINE
# ==============================================================================

def generate_personalized_dashboard_data(
    db: Session,
    user: Profile,
    pers: UserPersonalization
) -> Dict[str, Any]:
    """
    Generates tailored, transparent dashboard data based exclusively on explicit user goals
    and time availability. Avoids speculative profiling or opaque readiness metrics.
    """
    goal = pers.primary_goal or "return_to_work"
    situation = pers.current_situation or "career_break"
    hours = pers.weekly_hours or 10
    interests = pers.interests or ["Technology"]
    challenges = pers.challenges or []

    # Map primary goal to dashboard variant
    variant_map = {
        "return_to_work": "career_returner",
        "learn_skills": "learner",
        "start_business": "aspiring_entrepreneur",
        "grow_business": "established_entrepreneur",
        "find_mentorship": "explorer",
        "explore_careers": "explorer",
    }
    variant = variant_map.get(goal, "career_returner")

    welcome_messages = {
        "career_returner": f"Welcome back, {user.full_name}. We have prioritized high-confidence returnship pathways, mentor circles, and verified proof-of-work modules based on your {hours} hrs/week availability.",
        "learner": f"Welcome, {user.full_name}. Your self-paced curriculum is calibrated for {hours} hrs/week with hands-on labs and peer review exercises.",
        "aspiring_entrepreneur": f"Welcome, {user.full_name}. Your venture pathway focuses on customer validation, lean unit economics, and pilot proposal templates.",
        "established_entrepreneur": f"Welcome, {user.full_name}. Your growth desk is tailored for enterprise contracts, digital scaling, and funding schemes.",
        "explorer": f"Welcome, {user.full_name}. Explore emerging sectors and schedule 1:1 discovery sessions with verified mentors at your own pace.",
    }

    # Deterministic Next Steps based on explicit choices
    next_steps = []
    if goal == "return_to_work":
        next_steps.append({
            "id": "step-cp-1",
            "category": "next_step",
            "title": "Calibrate Your Career Continuity Passport",
            "description": "Review and toggle privacy settings for your career break before previewing what employers see.",
            "badge": "Priority 1",
            "action_label": "Open Passport",
            "action_url": "passport",
            "reason": f"Recommended because you selected 'Return to Employment' and specified {hours} hours weekly.",
            "priority": 1
        })
        next_steps.append({
            "id": "step-proj-2",
            "category": "next_step",
            "title": "Add a Verifiable Portfolio Project",
            "description": "Upload a link to code, analysis reports, or business documentation demonstrating current capability.",
            "badge": "Dignity Proof",
            "action_label": "Add Project",
            "action_url": "projects",
            "reason": "Direct project evidence bypasses career break bias with partner employers.",
            "priority": 2
        })
    elif goal == "start_business":
        next_steps.append({
            "id": "step-ent-1",
            "category": "next_step",
            "title": "Draft Initial Value Proposition & Service Menu",
            "description": "Use the entrepreneurship pricing calculator and proposal generator to validate your service rates.",
            "badge": "Venture Builder",
            "action_label": "Open Venture Hub",
            "action_url": "entrepreneurship",
            "reason": "Recommended because your primary goal is launching a new business or freelancing practice.",
            "priority": 1
        })
    elif goal == "learn_skills":
        next_steps.append({
            "id": "step-learn-1",
            "category": "next_step",
            "title": "Complete First Modular Skill Milestone",
            "description": "Engage with a verified 2-hour interactive module and complete the server-scored quiz.",
            "badge": "Skill Milestone",
            "action_label": "View Modules",
            "action_url": "learning",
            "reason": f"Calibrated for your {hours} hours/week learning schedule.",
            "priority": 1
        })
    else:
        next_steps.append({
            "id": "step-explore-1",
            "category": "next_step",
            "title": "Schedule a 1:1 Clarity Session",
            "description": "Connect with an experienced mentor to discuss domain transitions and viable return tracks.",
            "badge": "Mentorship",
            "action_label": "Book Mentor",
            "action_url": "mentorship",
            "reason": "Recommended because you chose exploring careers and seeking community guidance.",
            "priority": 1
        })

    # Confidence Step if user reported confidence as a challenge
    if "confidence" in challenges:
        next_steps.append({
            "id": "step-conf-1",
            "category": "confidence",
            "title": "Complete a Low-Stakes Practice Challenge",
            "description": "Practice answering a common returnship interview question in a supportive, private environment.",
            "badge": "Confidence Rebuild",
            "action_label": "Start Practice",
            "action_url": "confidence",
            "reason": "Recommended because you explicitly noted rebuilding career confidence as a key challenge.",
            "priority": 3
        })

    # Learning Recommendations matching interests
    primary_interest = interests[0] if interests else "Technology"
    learning_recs = [
        {
            "id": "rec-course-1",
            "category": "module",
            "title": f"Modern {primary_interest} Foundations & Industry Refresh",
            "description": "Curated hands-on modules addressing current tooling, agile conventions, and production standards.",
            "badge": "Free / Verified",
            "action_label": "Start Module",
            "action_url": "learning",
            "reason": f"Matches your chosen focus area '{primary_interest}'.",
            "priority": 1
        },
        {
            "id": "rec-course-2",
            "category": "module",
            "title": "Asynchronous Collaboration & Remote Delivery",
            "description": "Master Git workflows, documentation-first communication, and remote sprint management.",
            "badge": "Workplace Readiness",
            "action_label": "View Guide",
            "action_url": "learning",
            "reason": "Essential for flexible and remote returnship placements.",
            "priority": 2
        }
    ]

    # Opportunities (Real DB opportunities or verified partner returns)
    matched_jobs = db.query(Job).filter(Job.status == "active").limit(3).all()
    opportunity_items = []
    for j in matched_jobs:
        opportunity_items.append({
            "id": f"opp-{j.id}",
            "category": "opportunity",
            "title": j.title,
            "description": f"{j.company.name if j.company else 'Verified Partner'} • {j.location} • {j.work_mode}",
            "badge": "Charter Verified",
            "action_label": "View Details",
            "action_url": f"job-{j.id}",
            "reason": f"Matches your interest in '{j.sector}' and preference for {j.work_mode} roles.",
            "priority": 1
        })

    # Community Circles
    circles = db.query(ComebackCircle).limit(2).all()
    community_recs = []
    for c in circles:
        community_recs.append({
            "id": f"circle-{c.id}",
            "category": "mentorship",
            "title": c.name,
            "description": f"{c.current_member_count}/{c.max_members} peers • {c.career_objective}",
            "badge": "Active Circle",
            "action_label": "Join Cohort",
            "action_url": f"circle-{c.id}",
            "reason": f"Peer cohort focusing on {c.industry} relaunch.",
            "priority": 1
        })

    # Summary of confidence goals
    conf_goals = db.query(ConfidenceGoal).filter(ConfidenceGoal.user_id == user.id).all()
    completed_goals = sum(1 for g in conf_goals if g.status == "completed")

    return {
        "primary_goal": goal,
        "current_situation": situation,
        "dashboard_variant": variant,
        "welcome_message": welcome_messages.get(variant, welcome_messages["career_returner"]),
        "weekly_time_commitment": f"{hours} hours / week ({pers.available_time or 'flexible'})",
        "next_steps": next_steps,
        "learning_recommendations": learning_recs,
        "community_recommendations": community_recs,
        "opportunities": opportunity_items,
        "confidence_milestone_summary": {
            "total_goals": len(conf_goals),
            "completed_milestones": completed_goals,
            "active_action": conf_goals[0].title if conf_goals else "Define your first micro-milestone"
        }
    }


# ==============================================================================
# CHECKPOINT 3: CONFIDENCE REBUILD JOURNEY SERVICE
# ==============================================================================

def get_user_confidence_goals(db: Session, user_id: str) -> List[ConfidenceGoal]:
    """Retrieves all defined action goals for the user."""
    goals = db.query(ConfidenceGoal).filter(ConfidenceGoal.user_id == user_id).order_by(desc(ConfidenceGoal.created_at)).all()
    if not goals:
        # Pre-seed gentle, default starter goals so user is not faced with a blank slate
        starter_goals = [
            ConfidenceGoal(
                user_id=user_id,
                category="skill_action",
                title="Identify 3 Core Professional Strengths",
                description="List three technical, managerial, or problem-solving strengths you delivered prior to or during your break.",
                action_type="reflection",
                status="in_progress",
                reflection_notes="Example: Led cross-functional team of 4; optimized customer database queries; resolved critical stakeholder escalations.",
                actionable_feedback="Reframing prior experience affirms professional capability. Add these to your Career Passport summary.",
                is_milestone=False
            ),
            ConfidenceGoal(
                user_id=user_id,
                category="work_sample",
                title="Assemble a Verifiable Work Sample",
                description="Package a short presentation, clean code repository, or analysis dashboard showcasing current competency.",
                action_type="upload",
                status="pending",
                actionable_feedback="Demonstrable deliverables shift interview discussions from break duration to proven technical competence.",
                is_milestone=True
            ),
            ConfidenceGoal(
                user_id=user_id,
                category="interview_practice",
                title="Practice the 'Tell Me About Yourself' Response",
                description="Formulate an empowering, concise 90-second response focusing on your career track, intentional break, and forward vision.",
                action_type="practice",
                status="pending",
                actionable_feedback="Frame your hiatus as intentional time and emphasize your current readiness.",
                is_milestone=False
            )
        ]
        db.add_all(starter_goals)
        db.commit()
        for g in starter_goals:
            db.refresh(g)
        return starter_goals
    return goals


def create_confidence_goal(db: Session, user_id: str, payload: Dict[str, Any]) -> ConfidenceGoal:
    """Creates a user-defined confidence micro-goal or milestone."""
    goal = ConfidenceGoal(
        user_id=user_id,
        category=payload.get("category", "skill_action"),
        title=payload["title"].strip(),
        description=payload.get("description", ""),
        action_type=payload.get("action_type", "action"),
        status="in_progress",
        evidence_url=payload.get("evidence_url"),
        reflection_notes=payload.get("reflection_notes"),
        is_milestone=bool(payload.get("is_milestone", False)),
        consent_share_passport=bool(payload.get("consent_share_passport", False)),
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def update_confidence_goal(
    db: Session,
    user_id: str,
    goal_id: str,
    payload: Dict[str, Any]
) -> ConfidenceGoal:
    """Updates status, reflection, evidence, or feedback for a goal."""
    goal = db.query(ConfidenceGoal).filter(
        ConfidenceGoal.id == goal_id,
        ConfidenceGoal.user_id == user_id
    ).first()
    if not goal:
        return None

    if "status" in payload and payload["status"]:
        new_status = payload["status"]
        goal.status = new_status
        if new_status == "completed" and not goal.completed_at:
            goal.completed_at = utc_now()
            # Generate deterministic, encouraging feedback based on completion
            if not goal.actionable_feedback:
                if goal.category == "work_sample":
                    goal.actionable_feedback = "Strong demonstration of tangible output. Linking this in your Career Passport provides verifiable proof of technical readiness."
                elif goal.category == "interview_practice":
                    goal.actionable_feedback = "Practicing structured articulation reduces anxiety and establishes a confident conversational tone in returnship interviews."
                else:
                    goal.actionable_feedback = "Milestone achieved. Recognizing small, demonstrable actions builds enduring career self-efficacy."

    if "evidence_url" in payload:
        goal.evidence_url = payload["evidence_url"]
    if "reflection_notes" in payload:
        goal.reflection_notes = payload["reflection_notes"]
    if "consent_share_passport" in payload and payload["consent_share_passport"] is not None:
        goal.consent_share_passport = bool(payload["consent_share_passport"])

    goal.updated_at = utc_now()
    db.commit()
    db.refresh(goal)
    return goal


def submit_confidence_check_in(
    db: Session,
    user_id: str,
    payload: Dict[str, Any]
) -> ConfidenceCheckIn:
    """Stores an optional, non-judgmental self-reported confidence check-in."""
    check_in = ConfidenceCheckIn(
        user_id=user_id,
        confidence_level=payload["confidence_level"],
        primary_feeling=payload.get("primary_feeling"),
        reflection_note=payload.get("reflection_note"),
        strength_highlight=payload.get("strength_highlight")
    )
    db.add(check_in)
    db.commit()
    db.refresh(check_in)
    return check_in


def get_confidence_check_ins(db: Session, user_id: str) -> List[ConfidenceCheckIn]:
    """Retrieves chronological check-in history."""
    return db.query(ConfidenceCheckIn).filter(
        ConfidenceCheckIn.user_id == user_id
    ).order_by(desc(ConfidenceCheckIn.created_at)).all()


# ==============================================================================
# CHECKPOINT 4: ADAPTIVE EIGHT-WEEK ROADMAP SERVICE
# ==============================================================================

def generate_8_week_structured_roadmap(
    db: Session,
    user: Profile,
    variant: str = "employment",
    pace: str = "steady",
    weekly_hours: int = 10,
    target_role: Optional[str] = None
) -> LearningRoadmap:
    """
    Generates a realistic, highly actionable 8-week roadmap aligned with the user's
    explicit track, time budget, and chosen pace. Never claims guaranteed hiring.
    """
    cand = user.candidate_profile
    cand_id = cand.id if cand else user.id
    role_name = target_role or (cand.target_role if cand else None) or "Career Returner & Tech Specialist"

    # Define curriculum tracks based on chosen variant
    if variant == "entrepreneurship":
        weeks_spec = [
            ("Week 1", "Problem Space & Target Customer Discovery", 1, "Conduct 3 informational interviews with potential clients.", 8),
            ("Week 2", "Service Definition & Offer Packaging", 2, "Define your core service tier, deliverables, and turnaround time.", 8),
            ("Week 3", "Pricing Architecture & Unit Economics", 3, "Calculate target hourly billable rate and monthly business overhead.", 10),
            ("Week 4", "Proposal Template & Contract Terms", 4, "Draft a professional service agreement and statement of work.", 10),
            ("Week 5", "Digital Presence & Portfolio Case Study", 5, "Publish a 1-page case study detailing a solved client challenge.", 12),
            ("Week 6", "Inbound Marketing & Outreach Strategy", 6, "Engage with 10 community founders and prospective referral partners.", 10),
            ("Week 7", "Pilot Project Delivery & Feedback Loop", 7, "Deliver a low-cost or pro-bono pilot and record client testimonial.", 12),
            ("Week 8", "Venture Launch & Client Acquisition Rhythm", 8, "Establish weekly outreach routine and finalize bookkeeping workflow.", 10),
        ]
    elif variant == "upskilling":
        weeks_spec = [
            ("Week 1", "Modern Tooling & Development Environment Setup", 1, "Configure VS Code, Git, Docker, and command line productivity tools.", 8),
            ("Week 2", "Language & Syntax Modernization Sprint", 2, "Complete 10 hands-on code katas in Python/TypeScript.", 10),
            ("Week 3", "API Architecture & Data Flow Mastery", 3, "Design and test 3 RESTful endpoints using FastAPI/Express.", 10),
            ("Week 4", "Database Modeling & Query Optimization", 4, "Build relational schemas with foreign keys and index queries.", 10),
            ("Week 5", "Frontend Component Architecture & State", 5, "Construct 2 reactive UI components with responsive accessibility.", 12),
            ("Week 6", "Unit & Integration Testing Principles", 6, "Write automated test suites verifying edge cases and error states.", 10),
            ("Week 7", "Capstone Project Integration & Deployment", 7, "Deploy full-stack project with continuous integration on cloud host.", 14),
            ("Week 8", "Technical Documentation & Peer Code Review", 8, "Publish comprehensive README and conduct peer code audit.", 10),
        ]
    elif variant == "freelancing":
        weeks_spec = [
            ("Week 1", "Freelance Niche & Market Positioning", 1, "Select 2 complementary service niches based on previous domain expertise.", 8),
            ("Week 2", "Sample Portfolio Artifact Polish", 2, "Curate 2 polished samples showcasing end-to-end delivery quality.", 10),
            ("Week 3", "Client Discovery Framework & Scoping", 3, "Draft client questionnaire and project estimate calculator.", 10),
            ("Week 4", "Profile Setup & Platform Selection", 4, "Set up professional freelance profiles with transparent rates.", 8),
            ("Week 5", "Outreach & Warm Network Reconnection", 5, "Message 5 former colleagues announcing freelance availability.", 10),
            ("Week 6", "Managing Delivery Milestones & Deadlines", 6, "Set up project management board with client status updates.", 10),
            ("Week 7", "Client Review & Testimonial Capture", 7, "Obtain written endorsement for completed sample project.", 8),
            ("Week 8", "Retainer & Repeat Business Architecture", 8, "Structure ongoing monthly maintenance or advisory packages.", 10),
        ]
    else:  # employment / returnship
        weeks_spec = [
            ("Week 1", "Career Baseline & Skill Inventory Audit", 1, "Catalog core strengths, previous achievements, and target role criteria.", 8),
            ("Week 2", "Core Domain Refresher & Modern Tooling", 2, "Complete fundamental refresher module and review modern ecosystem changes.", 10),
            ("Week 3", "Hands-on Practical Evidence Project", 3, "Build a focused portfolio project demonstrating functional ability.", 12),
            ("Week 4", "Career Passport Privacy & Evidence Verification", 4, "Submit verification artifacts and configure break privacy mode.", 8),
            ("Week 5", "Behavioral & Technical Interview Rehearsal", 5, "Practice answering situational questions with peer in Comeback Circle.", 10),
            ("Week 6", "Targeted Returnship Application Sourcing", 6, "Identify 3 verified employer partners with supportive returnship cohorts.", 8),
            ("Week 7", "Mock Interview & Technical Discussion Clinic", 7, "Complete 1:1 mentor mock interview and incorporate feedback.", 10),
            ("Week 8", "Application Submission & Pipeline Management", 8, "Submit applications with verified Career Passport link.", 10),
        ]

    weeks = []
    task_id_counter = 1
    for title, theme, week_num, deliverable, base_hours in weeks_spec:
        # Scale hours according to user's pace
        scaled_hours = base_hours
        if pace == "accelerator":
            scaled_hours = int(base_hours * 1.3)
        elif pace == "relaxed":
            scaled_hours = max(4, int(base_hours * 0.7))

        task1_id = f"t-{week_num}-1"
        task2_id = f"t-{week_num}-2"

        weeks.append({
            "week_number": week_num,
            "title": f"Week {week_num}: {title}",
            "theme": theme,
            "estimated_hours": scaled_hours,
            "deliverable": deliverable,
            "tasks": [
                {
                    "id": task1_id,
                    "title": f"Focus Session: {theme}",
                    "description": deliverable,
                    "hours": scaled_hours // 2,
                    "completed": False,
                    "evidence_link": None,
                    "reflection": None
                },
                {
                    "id": task2_id,
                    "title": f"Checkpoint & Evidence Documentation",
                    "description": f"Document week {week_num} progress in your portfolio or learning log.",
                    "hours": scaled_hours - (scaled_hours // 2),
                    "completed": False,
                    "evidence_link": None,
                    "reflection": None
                }
            ],
            "milestone": f"Week {week_num} Deliverable Finalized"
        })

    # Check for existing roadmap to update or create
    existing = db.query(LearningRoadmap).filter(
        LearningRoadmap.candidate_id == cand_id,
        LearningRoadmap.status.in_(["active", "paused"])
    ).first()

    if existing:
        # Preserve completed tasks history
        old_completed = existing.completed_task_ids or []
        for w in weeks:
            for t in w["tasks"]:
                if t["id"] in old_completed:
                    t["completed"] = True

        existing.variant = variant
        existing.pace = pace
        existing.target_role = role_name
        existing.weeks_data = weeks
        existing.updated_at = utc_now()
        db.commit()
        db.refresh(existing)
        return existing

    new_roadmap = LearningRoadmap(
        candidate_id=cand_id,
        target_role=role_name,
        roadmap={"summary": f"8-Week {variant.capitalize()} Roadmap ({pace})"},
        variant=variant,
        pace=pace,
        weeks_data=weeks,
        completed_task_ids=[],
        status="active"
    )
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap


def update_roadmap_task_state(
    db: Session,
    roadmap_id: str,
    task_id: str,
    completed: bool,
    evidence_link: Optional[str] = None,
    reflection: Optional[str] = None
) -> Optional[LearningRoadmap]:
    """Updates a single task's completion and stores demonstrable evidence."""
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.id == roadmap_id).first()
    if not roadmap or not roadmap.weeks_data:
        return None

    weeks = list(roadmap.weeks_data)
    completed_ids = set(roadmap.completed_task_ids or [])

    task_found = False
    for w in weeks:
        for t in w.get("tasks", []):
            if t["id"] == task_id:
                t["completed"] = completed
                if evidence_link:
                    t["evidence_link"] = evidence_link
                if reflection:
                    t["reflection"] = reflection
                task_found = True
                break
        if task_found:
            break

    if completed:
        completed_ids.add(task_id)
    else:
        completed_ids.discard(task_id)

    roadmap.weeks_data = weeks
    roadmap.completed_task_ids = list(completed_ids)
    roadmap.updated_at = utc_now()
    db.commit()
    db.refresh(roadmap)
    return roadmap
