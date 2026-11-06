"""
Verified Career Passport 2.0 Router (Module 6)
Endpoints for:
- Generating and viewing candidate's 12-section Career Passport
- Candidate-controlled privacy settings and career-break visibility ('full', 'dates_only', 'hidden')
- Employer view preview (showing exactly what authorized employers will see)
- Time-limited, revocable employer access grants
- Access logs for sensitive views
- Submitting and reviewing verification evidence with rigorous provenance levels
- Downloading minimal editorial print-friendly PDF
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile
from backend.app.models.ai import CareerPassport, PassportAccessGrant, PassportAccessLog, VerificationRecord
from backend.app.models.application import Application
from backend.app.models.job import Job
from backend.app.models.company import Company
from backend.app.middleware.auth_middleware import get_current_user
from backend.app.services.ai.career_passport_v2 import (
    build_verified_career_passport_data,
    create_employer_access_grant,
    revoke_employer_access_grant,
    record_passport_access,
    submit_verification_evidence,
    review_verification_evidence,
    generate_passport_pdf,
    DEFAULT_VISIBILITY
)

router = APIRouter(prefix="/api/passport", tags=["Verified Career Passport 2.0"])


class VisibilitySettingsRequest(BaseModel):
    career_break_mode: str = Field(default="dates_only", description="'full', 'dates_only', or 'hidden'")
    show_contact_email: bool = True
    show_salary_expectation: bool = False
    show_previous_employment: bool = True
    show_education: bool = True
    show_portfolio_projects: bool = True
    show_completed_learning: bool = True
    show_practical_assessments: bool = True
    show_mentor_feedback: bool = True
    show_career_preferences: bool = True
    is_discoverable_by_employers: Optional[bool] = None
    anonymous_in_discovery: Optional[bool] = None


class CreateGrantRequest(BaseModel):
    grantee_email: str
    grantee_organization: Optional[str] = "Prospective Employer"
    permissions: Optional[Dict[str, Any]] = None
    expires_days: int = Field(default=30, ge=1, le=180)


class SubmitVerificationRequest(BaseModel):
    item_type: str = Field(..., description="employment, certificate, project, assessment, skill")
    title: str
    issuer_or_employer: str
    verification_source: str = Field(..., description="e.g. Official HR Relieving Letter, Credential URL, In-Platform Assessment")
    document_url: Optional[str] = Field(default=None, description="Private document URL. NEVER exposed publicly.")
    notes: Optional[str] = None


class ReviewVerificationRequest(BaseModel):
    outcome: str = Field(..., description="approved, rejected, revoked")
    notes: Optional[str] = None


@router.get("/me")
async def get_my_career_passport(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves candidate's full 12-section Career Passport 2.0 with current sharing controls.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    passport_data = build_verified_career_passport_data(cand=cand, db=db, is_employer_view=False)
    return passport_data


@router.put("/visibility")
async def update_passport_visibility(
    req: VisibilitySettingsRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates candidate privacy settings (e.g. whether career break dates/reasons or salary are visible).
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    if req.is_discoverable_by_employers is not None:
        cand.is_discoverable_by_employers = req.is_discoverable_by_employers
    if req.anonymous_in_discovery is not None:
        cand.anonymous_in_discovery = req.anonymous_in_discovery
    db.commit()
    db.refresh(cand)

    new_settings = req.model_dump(exclude_unset=True)
    passport_data = build_verified_career_passport_data(
        cand=cand,
        db=db,
        visibility_overrides=new_settings,
        is_employer_view=False
    )
    return {
        "message": "Career Passport privacy settings successfully updated.",
        "visibility_settings": new_settings,
        "passport": passport_data
    }


@router.get("/preview")
async def preview_employer_view(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns exactly what an employer will see based on candidate's current privacy settings.
    Private verification documents and hidden sections are completely omitted.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    employer_view = build_verified_career_passport_data(cand=cand, db=db, is_employer_view=True)
    return {
        "preview_note": "This is an exact preview of what prospective employers will see.",
        "employer_view": employer_view
    }


@router.post("/grants")
async def create_access_grant(
    req: CreateGrantRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a time-limited, revocable employer access grant.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    permissions = req.permissions or DEFAULT_VISIBILITY
    grant = create_employer_access_grant(
        cand=cand,
        grantee_email=req.grantee_email,
        grantee_organization=req.grantee_organization,
        permissions=permissions,
        expires_days=req.expires_days,
        db=db
    )

    return {
        "message": f"Time-limited access grant created for {req.grantee_email}.",
        "grant_id": grant.id,
        "access_token": grant.access_token,
        "share_url": f"/passport/view/{grant.access_token}",
        "expires_at": grant.expires_at.isoformat() if grant.expires_at else None
    }


@router.delete("/grants/{grant_id}")
async def revoke_access_grant(
    grant_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Instantly revokes previously granted employer access.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    revoked = revoke_employer_access_grant(cand=cand, grant_id=grant_id, db=db)
    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access grant not found or already revoked."
        )

    return {
        "message": "Employer access successfully revoked.",
        "grant_id": grant_id
    }


@router.get("/logs")
async def get_access_logs(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns audit logs of who viewed the candidate's Career Passport.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    logs = db.query(PassportAccessLog).filter(
        PassportAccessLog.candidate_id == cand.id
    ).order_by(PassportAccessLog.viewed_at.desc()).limit(50).all()

    return [
        {
            "id": l.id,
            "viewer_identity": l.viewer_identity,
            "viewer_role": l.viewer_role,
            "viewed_at": l.viewed_at.isoformat() if l.viewed_at else None,
            "sections_viewed": l.sections_viewed or []
        }
        for l in logs
    ]


@router.get("/download-pdf")
async def download_passport_pdf(
    candidate_id: Optional[str] = Query(None, description="Optional target candidate ID for authorized employers or admins"),
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates and returns an editorial print-friendly Career Passport PDF.
    Enforces authentication and record-level authorization:
    - Candidates can only download their own passport.
    - Admins can audit/download any candidate passport.
    - Employers can only download passports for candidates who have consented or applied.
    - Unauthenticated requests receive 401; unauthorized access receives 403.
    """
    if not candidate_id:
        cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
        if not cand:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "PROFILE_NOT_FOUND", "message": "Candidate profile record not found."}
            )
        is_employer_view = False
    else:
        cand = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
        if not cand:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "PROFILE_NOT_FOUND", "message": "Candidate profile record not found."}
            )

        if cand.user_id == current_user.id:
            is_employer_view = False
        elif current_user.role == "admin":
            is_employer_view = False
        elif current_user.role == "employer":
            # Check consent or active application
            has_application = db.query(Application).join(Job).join(Company).filter(
                Application.candidate_id == cand.id,
                Company.owner_user_id == current_user.id
            ).first()
            is_consented = cand.career_break_visibility in ["employers", "public"]
            if not (has_application or is_consented):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={"code": "FORBIDDEN", "message": "Access denied. Candidate has not consented to share career passport with your organization."}
                )
            is_employer_view = True
            record_passport_access(
                candidate_id=cand.id,
                viewer_identity=current_user.full_name or current_user.email,
                viewer_role="employer",
                sections_viewed=["pdf_export", "employer_view"],
                db=db
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "You do not have permission to access another user's career passport."}
            )

    passport_data = build_verified_career_passport_data(cand=cand, db=db, is_employer_view=is_employer_view)
    pdf_bytes = generate_passport_pdf(passport_data)

    cand_name = cand.user.full_name.replace(' ', '_') if (cand.user and cand.user.full_name) else 'Candidate'
    filename = f"Career_Passport_{cand_name}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.post("/verification/submit")
async def submit_evidence(
    req: SubmitVerificationRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits evidence for employment, certifications, projects, or skills.
    Starts as 'pending_review' until an authorized reviewer validates it.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile record not found."
        )

    record = submit_verification_evidence(
        cand=cand,
        item_type=req.item_type,
        title=req.title,
        issuer_or_employer=req.issuer_or_employer,
        verification_source=req.verification_source,
        document_url=req.document_url,
        notes=req.notes,
        db=db
    )

    return {
        "message": f"Evidence submitted for '{req.title}'. Status: Pending Review.",
        "record_id": record.id,
        "verification_level": record.verification_level,
        "outcome": record.outcome
    }


@router.post("/verification/{record_id}/review")
async def review_evidence(
    record_id: str,
    req: ReviewVerificationRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Authorized reviewer (admin/mentor) audits and approves or rejects evidence.
    """
    if current_user.role not in ["admin", "mentor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authorized platform reviewers may approve verification evidence."
        )

    reviewed = review_verification_evidence(
        record_id=record_id,
        reviewer=current_user,
        outcome=req.outcome,
        notes=req.notes,
        db=db
    )
    if not reviewed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification record not found."
        )

    return {
        "message": f"Verification evidence has been {req.outcome}.",
        "record_id": reviewed.id,
        "verification_level": reviewed.verification_level,
        "outcome": reviewed.outcome,
        "reviewer": reviewed.reviewer_name
    }


@router.get("/shared/{access_token}")
async def view_shared_passport(
    access_token: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Public/Employer endpoint to view a candidate's Career Passport using a valid access token.
    Enforces expiration and revocation checks. Audits access in logs.
    """
    grant = db.query(PassportAccessGrant).filter(
        PassportAccessGrant.access_token == access_token
    ).first()

    if not grant or grant.status != "active":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This Career Passport link is invalid or access has been revoked by the candidate. Note: files previously downloaded to local devices cannot be remotely deleted."
        )

    # Check expiration
    if grant.expires_at and grant.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        grant.status = "expired"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This Career Passport link has expired."
        )

    cand = db.query(CandidateProfile).filter(CandidateProfile.id == grant.candidate_id).first()
    if not cand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found.")

    # Record audit log
    record_passport_access(
        candidate_id=cand.id,
        grant_id=grant.id,
        viewer_identity=grant.grantee_organization or grant.grantee_email,
        sections_viewed=["introduction", "skills", "timeline", "projects", "certifications"],
        db=db,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    employer_view = build_verified_career_passport_data(
        cand=cand,
        db=db,
        visibility_overrides=grant.permissions,
        is_employer_view=True
    )

    return {
        "grant_info": {
            "organization": grant.grantee_organization,
            "expires_at": grant.expires_at.isoformat() if grant.expires_at else None,
        },
        "passport": employer_view
    }
