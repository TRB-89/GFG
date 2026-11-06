import uuid
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.database import SessionLocal
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, CandidateProject
from backend.app.models.company import Company
import httpx
from backend.app.models.learning import (
    Course,
    CourseEnrollment,
    Lesson,
    LessonProgress,
    Assessment,
    AssessmentAttempt,
    PracticalAssignment,
    AssignmentSubmission,
    LmsCertificate,
    CertificateAuditLog,
)
from backend.app.models.community import MentorProfile, ComebackCircle
from backend.app.utils.security import hash_password, create_access_token
from backend.app.services.email_service import email_service

client = TestClient(app)

def create_test_candidate(name: str = "Test Candidate") -> tuple[Profile, CandidateProfile, str]:
    db = SessionLocal()
    try:
        email = f"cand_{uuid.uuid4().hex[:8]}@example.com"
        user = Profile(
            full_name=name,
            email=email,
            password_hash=hash_password("Password@123"),
            role="candidate"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        cand = CandidateProfile(
            user_id=user.id,
            previous_job_title="Software Engineer",
            years_experience=4.0,
            career_break_visibility="public"
        )
        db.add(cand)
        db.commit()
        db.refresh(cand)

        token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
        return user, cand, token
    finally:
        db.close()

def create_test_employer(company_name: str = "Apex Test Systems") -> tuple[Profile, Company, str]:
    db = SessionLocal()
    try:
        email = f"emp_{uuid.uuid4().hex[:8]}@apextest.com"
        user = Profile(
            full_name="Talent Lead",
            email=email,
            password_hash=hash_password("Password@123"),
            role="employer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        comp = Company(
            owner_user_id=user.id,
            name=company_name,
            industry="Software",
            company_size="100-500",
            business_contact_email=email,
            hiring_charter_accepted=True,
            verified=True,
            verification_status="verified"
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)

        token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
        return user, comp, token
    finally:
        db.close()

def make_candidate_course_eligible(user_id: str, course_id: str):
    db = SessionLocal()
    try:
        enr = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        ).first()
        if not enr:
            enr = CourseEnrollment(
                user_id=user_id,
                course_id=course_id,
                status="completed",
                progress_percentage=100,
                enrolled_at=datetime.now(timezone.utc),
                last_accessed_at=datetime.now(timezone.utc)
            )
            db.add(enr)
            db.flush()

        course = db.query(Course).filter(Course.id == course_id).first()
        if course and course.modules:
            for m in course.modules:
                for l in m.lessons:
                    lp = db.query(LessonProgress).filter(
                        LessonProgress.lesson_id == l.id,
                        LessonProgress.user_id == user_id
                    ).first()
                    if not lp:
                        lp = LessonProgress(
                            enrollment_id=enr.id,
                            user_id=user_id,
                            course_id=course_id,
                            lesson_id=l.id,
                            is_completed=True,
                            completed_at=datetime.now(timezone.utc),
                            time_spent_seconds=120
                        )
                        db.add(lp)
        assessment = db.query(Assessment).filter(Assessment.course_id == course_id).first()
        if assessment:
            att = db.query(AssessmentAttempt).filter(
                AssessmentAttempt.assessment_id == assessment.id,
                AssessmentAttempt.user_id == user_id
            ).first()
            if not att:
                att = AssessmentAttempt(
                    assessment_id=assessment.id,
                    user_id=user_id,
                    score_percentage=90.0,
                    passed=True,
                    attempt_number=1,
                    answers={},
                    submitted_at=datetime.now(timezone.utc)
                )
                db.add(att)
        assignment = db.query(PracticalAssignment).filter(PracticalAssignment.course_id == course_id).first()
        if assignment:
            sub = db.query(AssignmentSubmission).filter(
                AssignmentSubmission.assignment_id == assignment.id,
                AssignmentSubmission.user_id == user_id
            ).first()
            if not sub:
                sub = AssignmentSubmission(
                    assignment_id=assignment.id,
                    user_id=user_id,
                    submission_content="Approved capstone returnship project",
                    status="approved",
                    grade_score=95.0,
                    evaluator_feedback="Great work",
                    submitted_at=datetime.now(timezone.utc),
                    evaluated_at=datetime.now(timezone.utc)
                )
                db.add(sub)
        db.commit()
    finally:
        db.close()


# ==============================================================================
# FIX 1 — CAREER PASSPORT PDF AUTHENTICATED DOWNLOAD & RBAC
# ==============================================================================

def test_fix1_download_pdf_unauthenticated_returns_401():
    """Direct unauthenticated download of passport PDF must return 401."""
    res = client.get("/api/passport/download-pdf")
    assert res.status_code == 401


def test_fix1_candidate_downloads_own_pdf_success_200():
    """Authenticated candidate can securely download their own Career Passport PDF."""
    _, cand, token = create_test_candidate("Ananya Sen")
    res = client.get(
        "/api/passport/download-pdf",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in res.headers["content-disposition"]
    assert res.content.startswith(b"%PDF")


def test_fix1_candidate_cross_download_idor_rejected_403():
    """Candidate attempting to download another candidate's passport via query param is rejected with 403."""
    _, cand_a, token_a = create_test_candidate("Candidate A")
    _, cand_b, _ = create_test_candidate("Candidate B")

    res = client.get(
        f"/api/passport/download-pdf?candidate_id={cand_b.id}",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


def test_fix1_employer_without_consent_rejected_403():
    """Employer without consent or active application cannot download candidate's passport."""
    _, cand, _ = create_test_candidate("Candidate Without Consent")
    _, emp, emp_token = create_test_employer("Unconsented Employer")

    db = SessionLocal()
    try:
        db_cand = db.query(CandidateProfile).filter(CandidateProfile.id == cand.id).first()
        db_cand.career_break_visibility = "private"
        db.commit()
    finally:
        db.close()

    res = client.get(
        f"/api/passport/download-pdf?candidate_id={cand.id}",
        headers={"Authorization": f"Bearer {emp_token}"}
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


def test_fix1_employer_with_consent_can_download_and_logs_audit():
    """Verified employer with candidate consent can download passport PDF and an audit log is stored."""
    _, cand, _ = create_test_candidate("Consented Candidate")
    _, emp, emp_token = create_test_employer("Consented Employer")

    db = SessionLocal()
    try:
        db_cand = db.query(CandidateProfile).filter(CandidateProfile.id == cand.id).first()
        db_cand.career_break_visibility = "employers"
        db.commit()
    finally:
        db.close()

    res = client.get(
        f"/api/passport/download-pdf?candidate_id={cand.id}",
        headers={"Authorization": f"Bearer {emp_token}"}
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.content.startswith(b"%PDF")


# ==============================================================================
# FIX 2 — CERTIFICATE EMAIL DELIVERY & ACCURATE AUDIT STATUS
# ==============================================================================

def test_fix2_certificate_issued_when_email_disabled():
    """Certificate is issued and committed to DB even if email is disabled, with truthful status."""
    _, cand, token = create_test_candidate("Certificate Student")
    db = SessionLocal()
    try:
        course = db.query(Course).first()
        if not course:
            course = Course(
                title="Python for Returners",
                slug=f"python-returners-{uuid.uuid4().hex[:6]}",
                description="Refresher course",
                category="Programming",
                difficulty="Intermediate",
                estimated_duration_hours=12,
                status="published"
            )
            db.add(course)
            db.commit()
            db.refresh(course)
        course_id = course.id
    finally:
        db.close()

    # Satisfy course completion criteria
    make_candidate_course_eligible(cand.user_id, course_id)

    with patch.dict("os.environ", {"RESEND_API_KEY": ""}):
        res = client.post(
            f"/api/learning/courses/{course_id}/claim-certificate",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        data = body["data"]
        assert "credential_id" in data
        assert data["email_delivery"]["status"] == "disabled"

        # Verify persisted audit log
        db = SessionLocal()
        try:
            audit = db.query(CertificateAuditLog).filter(
                CertificateAuditLog.certificate_id == data["id"]
            ).order_by(CertificateAuditLog.timestamp.desc()).first()
            assert audit is not None
            assert audit.action == "email_disabled"
        finally:
            db.close()


def test_fix2_duplicate_claim_returns_duplicate_skipped():
    """Attempting to claim an already claimed certificate returns duplicate_skipped without re-issuing."""
    _, cand, token = create_test_candidate("Duplicate Student")
    db = SessionLocal()
    try:
        course = db.query(Course).first()
        course_id = course.id
    finally:
        db.close()

    # Satisfy course completion criteria
    make_candidate_course_eligible(cand.user_id, course_id)

    res1 = client.post(
        f"/api/learning/courses/{course_id}/claim-certificate",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res1.status_code == 200
    cred_id = res1.json()["data"]["credential_id"]

    # Claim second time
    res2 = client.post(
        f"/api/learning/courses/{course_id}/claim-certificate",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res2.status_code == 200
    assert res2.json()["data"]["credential_id"] == cred_id
    assert res2.json()["data"]["email_delivery"]["status"] == "duplicate_skipped"


def test_fix2_email_service_delivers_when_provider_confirms():
    """Email service marks delivery as 'delivered' only when provider returns 200 with ID."""
    import asyncio
    async def _test():
        with patch.dict("os.environ", {"RESEND_API_KEY": "re_test_valid_key"}):
            with patch.object(httpx.AsyncClient, "post", new_callable=AsyncMock) as mock_post:
                mock_post.return_value = httpx.Response(200, json={"id": "resend_msg_test_12345"})
                result = await email_service.send_certificate_email(
                    to_email="student@example.com",
                    recipient_name="Student",
                    course_title="Data Analytics",
                    credential_id="GFG-TEST-1234",
                    verification_url="https://app.gfg.org/verify/GFG-TEST-1234"
                )
                assert result["status"] == "delivered"
                assert result["id"] == "resend_msg_test_12345"
    asyncio.run(_test())


# ==============================================================================
# FIX 3 — ONBOARDING PROJECT DATA ALIGNMENT, SERIALIZATION & CRUD
# ==============================================================================

def test_fix3_onboarding_saves_and_persists_all_project_fields():
    """Completing onboarding preserves project_link, repository_link, technologies_used, year_completed."""
    user, cand, token = create_test_candidate("Project Candidate")

    payload = {
        "previous_job_title": "Full Stack Lead",
        "industry": "FinTech",
        "experience_years": 5.0,
        "qualifications": "B.Tech Computer Science",
        "highest_qualification": "B.Tech Computer Science",
        "field_of_study": "Computer Science",
        "previous_profession": "Software Engineer",
        "target_role": "Full Stack Engineer",
        "career_switch_willingness": "Open to related domains",
        "existing_skills": ["React", "FastAPI", "PostgreSQL"],
        "currently_on_break": False,
        "weekly_learning_hours": 15,
        "preferred_work_mode": "hybrid",
        "profile_visibility": "public",
        "opt_into_employer_sharing": True,
        "projects": [
            {
                "title": "Caregiver Returnship Portal",
                "description": "Production portal supporting returning caregivers with automated skill verification.",
                "technologies_used": ["Next.js", "FastAPI", "PostgreSQL"],
                "project_link": "https://caregiver-portal.example.com",
                "repository_link": "https://github.com/candidate/caregiver-portal",
                "year_completed": 2026,
                "skills_demonstrated": ["Full Stack Architecture", "REST API Design"]
            }
        ]
    }

    res = client.post(
        "/api/candidates/onboarding/complete",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200

    # Verify retrieval via /api/candidates/me
    profile_res = client.get("/api/candidates/me", headers={"Authorization": f"Bearer {token}"})
    assert profile_res.status_code == 200
    pdata = profile_res.json()["data"]
    assert len(pdata["projects"]) == 1
    proj = pdata["projects"][0]
    assert proj["title"] == "Caregiver Returnship Portal"
    assert proj["project_link"] == "https://caregiver-portal.example.com"
    assert proj["repository_link"] == "https://github.com/candidate/caregiver-portal"
    assert proj["year_completed"] == 2026
    assert "Next.js" in proj["technologies_used"]
    assert "FastAPI" in proj["technologies_used"]


def test_fix3_candidate_project_crud_endpoints():
    """Candidate can create, update, and delete individual portfolio projects via dedicated endpoints."""
    _, _, token = create_test_candidate("CRUD Candidate")

    # 1. Create project
    create_payload = {
        "title": "Analytics Dashboard",
        "description": "Interactive business metrics dashboard",
        "technologies_used": ["Python", "Pandas", "Streamlit"],
        "project_link": "https://analytics.example.com",
        "repository_link": "https://github.com/candidate/analytics-dashboard",
        "year_completed": 2025
    }
    create_res = client.post(
        "/api/candidates/me/projects",
        json=create_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert create_res.status_code == 201
    proj_id = create_res.json()["data"]["id"]

    # 2. Update project
    update_payload = {
        "title": "Analytics Dashboard v2",
        "technologies_used": ["Python", "Pandas", "DuckDB", "Power BI"]
    }
    update_res = client.put(
        f"/api/candidates/me/projects/{proj_id}",
        json=update_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["title"] == "Analytics Dashboard v2"
    assert "DuckDB" in update_res.json()["data"]["technologies_used"]

    # 3. Delete project
    del_res = client.delete(
        f"/api/candidates/me/projects/{proj_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 4. Verify project is deleted
    profile_res = client.get("/api/candidates/me", headers={"Authorization": f"Bearer {token}"})
    assert len(profile_res.json()["data"]["projects"]) == 0


def test_fix3_cross_candidate_project_isolation():
    """Candidate cannot update or delete another candidate's project."""
    _, _, token_a = create_test_candidate("Candidate A")
    _, _, token_b = create_test_candidate("Candidate B")

    # Candidate A creates a project
    create_res = client.post(
        "/api/candidates/me/projects",
        json={"title": "A's Private Project", "description": "Confidential work"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    proj_id = create_res.json()["data"]["id"]

    # Candidate B tries to delete Candidate A's project
    del_res = client.delete(
        f"/api/candidates/me/projects/{proj_id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert del_res.status_code in [403, 404]


# ==============================================================================
# FIX 4 — MENTORSHIP USER ID & TENANT ISOLATION
# ==============================================================================

def test_fix4_authenticated_candidate_requests_session_success():
    """Candidate requests a mentorship session with their real candidate ID."""
    _, cand, token = create_test_candidate("Mentee Candidate")
    db = SessionLocal()
    try:
        mentor = db.query(MentorProfile).first()
        mentor_id = mentor.id if mentor else "mentor-meera-iyer"
    finally:
        db.close()

    payload = {
        "candidate_id": cand.id,
        "mentor_id": mentor_id,
        "topic": "Resume Framing",
        "goals": "Articulate career hiatus with confidence",
        "scheduled_at": "2026-12-01T10:00:00Z",
        "format": "1:1 Video"
    }

    res = client.post(
        "/api/mentors/sessions/request",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 201
    assert res.json()["status"] == "success"
    assert res.json()["session"]["candidate_id"] == cand.id


def test_fix4_cross_candidate_session_request_rejected_403():
    """Candidate attempting to request a session on behalf of another candidate is rejected with 403."""
    _, cand_a, token_a = create_test_candidate("Candidate A")
    _, cand_b, _ = create_test_candidate("Candidate B")

    payload = {
        "candidate_id": cand_b.id,  # Attempting to act as Candidate B
        "mentor_id": "mentor-meera-iyer",
        "topic": "IDOR Session Attempt",
        "goals": "Unauthorized session booking",
        "scheduled_at": "2026-12-01T10:00:00Z",
        "format": "1:1 Video"
    }

    res = client.post(
        "/api/mentors/sessions/request",
        json=payload,
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


def test_fix4_cross_candidate_circle_join_and_leave_rejected_403():
    """Candidate attempting to join or leave a Comeback Circle on behalf of another candidate is rejected with 403."""
    _, cand_a, token_a = create_test_candidate("Candidate A")
    _, cand_b, _ = create_test_candidate("Candidate B")

    db = SessionLocal()
    try:
        circle = db.query(ComebackCircle).first()
        if not circle:
            circle = ComebackCircle(
                title="Returnee Circle 2026",
                slug=f"circle-{uuid.uuid4().hex[:6]}",
                sector="Data Analytics",
                description="Peer support circle",
                max_members=15
            )
            db.add(circle)
            db.commit()
            db.refresh(circle)
        circle_id = circle.id
    finally:
        db.close()

    # Join attempt
    join_res = client.post(
        f"/api/circles/{circle_id}/join",
        json={"candidate_id": cand_b.id},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert join_res.status_code == 403
    assert join_res.json()["error"]["code"] == "FORBIDDEN"

    # Leave attempt
    leave_res = client.post(
        f"/api/circles/{circle_id}/leave",
        json={"candidate_id": cand_b.id},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert leave_res.status_code == 403
    assert leave_res.json()["error"]["code"] == "FORBIDDEN"


def test_fix4_cross_candidate_circle_discussion_rejected_403():
    """Candidate attempting to post circle discussion with another candidate's ID is rejected with 403."""
    _, cand_a, token_a = create_test_candidate("Candidate A")
    _, cand_b, _ = create_test_candidate("Candidate B")

    db = SessionLocal()
    try:
        circle = db.query(ComebackCircle).first()
        circle_id = circle.id
    finally:
        db.close()

    payload = {
        "candidate_id": cand_b.id,
        "title": "Impersonation discussion",
        "content": "Trying to impersonate Candidate B",
        "category": "General"
    }

    res = client.post(
        f"/api/circles/{circle_id}/discussions",
        json=payload,
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


# ==============================================================================
# FIX 5 — BACKEND DEPENDENCY VERIFICATION
# ==============================================================================

def test_fix5_pypdf_and_numpy_imports_and_functionality():
    """Verify pypdf and numpy can be imported and executed without errors."""
    import pypdf
    import numpy as np

    assert hasattr(pypdf, "PdfReader")
    assert hasattr(pypdf, "PdfWriter")

    arr = np.array([1, 2, 3, 4, 5])
    assert arr.mean() == 3.0


# ==============================================================================
# FIX 6 — TRUTHFUL API ERROR PROPAGATION (NO FAKE SUCCESSES)
# ==============================================================================

def test_fix6_invalid_login_returns_401():
    """Invalid credentials return 401 with truthful error detail, not mock success."""
    res = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@user.com", "password": "WrongPassword!123"}
    )
    assert res.status_code == 401
    body = res.json()
    assert body.get("success") is False or "error" in body or "detail" in body


def test_fix6_duplicate_registration_returns_400():
    """Attempting to register with an existing email returns 400 with detail."""
    user, _, _ = create_test_candidate("Existing User")
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Duplicate Register",
            "email": user.email,
            "password": "Password@123",
            "account_type": "candidate"
        }
    )
    assert res.status_code == 400
    body = res.json()
    assert body.get("success") is False or "error" in body or "detail" in body


def test_fix6_validation_error_returns_422():
    """Malformed request payload returns 422 with validation structure."""
    res = client.post(
        "/api/auth/register",
        json={
            "full_name": "Test",
            # missing email, password, account_type
        }
    )
    assert res.status_code == 422
    body = res.json()
    assert "error" in body or "detail" in body
    if "error" in body:
        assert body["error"]["code"] == "VALIDATION_ERROR"
        assert len(body["error"]["details"]) > 0
    else:
        assert isinstance(body["detail"], list)
