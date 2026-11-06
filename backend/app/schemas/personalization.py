from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field

# ==============================================================================
# CHECKPOINT 1 & 2: PERSONALIZATION & ONBOARDING SCHEMAS
# ==============================================================================

class PersonalizationSaveRequest(BaseModel):
    primary_goal: Optional[str] = Field(
        None,
        description="return_to_work | learn_skills | start_business | grow_business | find_mentorship | explore_careers"
    )
    secondary_goals: Optional[List[str]] = Field(default_factory=list)
    current_situation: Optional[str] = Field(
        None,
        description="career_break | currently_employed | entrepreneur | student_graduate | exploring"
    )
    interests: Optional[List[str]] = Field(default_factory=list)
    challenges: Optional[List[str]] = Field(default_factory=list)
    available_time: Optional[str] = Field(
        "5_to_10",
        description="under_5 | 5_to_10 | 10_to_20 | 20_plus"
    )
    weekly_hours: Optional[int] = Field(10, ge=1, le=80)
    preferred_support: Optional[List[str]] = Field(default_factory=list)
    preferred_experience: Optional[str] = Field(
        "blended",
        description="guided | independent | blended"
    )
    priority_order: Optional[List[str]] = Field(default_factory=list)
    is_completed: Optional[bool] = False

class PersonalizationResponse(BaseModel):
    id: str
    user_id: str
    primary_goal: Optional[str] = None
    secondary_goals: List[str] = Field(default_factory=list)
    current_situation: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    challenges: List[str] = Field(default_factory=list)
    available_time: Optional[str] = "5_to_10"
    weekly_hours: int = 10
    preferred_support: List[str] = Field(default_factory=list)
    preferred_experience: str = "blended"
    priority_order: List[str] = Field(default_factory=list)
    is_completed: bool = False
    explanation: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RecommendationItem(BaseModel):
    id: str
    category: str  # module, next_step, roadmap, mentorship, opportunity, confidence
    title: str
    description: str
    badge: Optional[str] = None
    action_label: str
    action_url: Optional[str] = None
    reason: str  # Transparent, non-opaque explanation
    priority: int = 1

class PersonalizedDashboardResponse(BaseModel):
    primary_goal: str
    current_situation: str
    dashboard_variant: str  # career_returner | learner | aspiring_entrepreneur | established_entrepreneur | explorer
    welcome_message: str
    weekly_time_commitment: str
    next_steps: List[RecommendationItem]
    learning_recommendations: List[RecommendationItem]
    roadmap_overview: Optional[Dict[str, Any]] = None
    community_recommendations: List[RecommendationItem]
    opportunities: List[RecommendationItem]
    confidence_milestone_summary: Optional[Dict[str, Any]] = None

# ==============================================================================
# CHECKPOINT 3: CONFIDENCE REBUILD JOURNEY SCHEMAS
# ==============================================================================

class ConfidenceGoalCreate(BaseModel):
    category: str = Field(..., description="skill_action | work_sample | interview_practice | mindset_reflection | micro_goal")
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    action_type: str = Field("action", description="exercise | upload | practice | reflection")
    evidence_url: Optional[str] = None
    reflection_notes: Optional[str] = None
    is_milestone: bool = False
    consent_share_passport: bool = False

class ConfidenceGoalUpdate(BaseModel):
    status: Optional[str] = Field(None, description="pending | in_progress | completed | archived")
    evidence_url: Optional[str] = None
    reflection_notes: Optional[str] = None
    actionable_feedback: Optional[str] = None
    consent_share_passport: Optional[bool] = None

class ConfidenceGoalResponse(BaseModel):
    id: str
    user_id: str
    category: str
    title: str
    description: Optional[str] = None
    action_type: str
    status: str
    evidence_url: Optional[str] = None
    reflection_notes: Optional[str] = None
    actionable_feedback: Optional[str] = None
    is_milestone: bool = False
    verified_by: Optional[str] = None
    consent_share_passport: bool = False
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConfidenceCheckInCreate(BaseModel):
    confidence_level: int = Field(..., ge=1, le=5, description="Self-reported scale 1 to 5")
    primary_feeling: Optional[str] = None
    reflection_note: Optional[str] = None
    strength_highlight: Optional[str] = None

class ConfidenceCheckInResponse(BaseModel):
    id: str
    user_id: str
    confidence_level: int
    primary_feeling: Optional[str] = None
    reflection_note: Optional[str] = None
    strength_highlight: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ==============================================================================
# CHECKPOINT 4: ADAPTIVE EIGHT-WEEK ROADMAP SCHEMAS
# ==============================================================================

class RoadmapGenerateRequest(BaseModel):
    variant: Optional[str] = Field("employment", description="employment | upskilling | freelancing | entrepreneurship | explorer")
    pace: Optional[str] = Field("steady", description="steady | accelerator | relaxed")
    weekly_hours: Optional[int] = Field(10, ge=2, le=60)
    target_role_or_venture: Optional[str] = None
    focus_skills: Optional[List[str]] = Field(default_factory=list)

class RoadmapTaskUpdate(BaseModel):
    completed: bool
    evidence_link: Optional[str] = None
    reflection: Optional[str] = None

class AdaptiveRoadmapResponse(BaseModel):
    id: str
    candidate_id: str
    target_role: str
    variant: str
    pace: str
    status: str
    is_paused: bool
    total_weeks: int = 8
    completed_tasks_count: int = 0
    total_tasks_count: int = 0
    progress_percentage: int = 0
    weeks: List[Dict[str, Any]]
    explanation: str
    generated_at: datetime
    updated_at: datetime

