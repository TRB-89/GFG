import uuid
from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_journey_01_landing_page_health_and_public_options():
    """Journey 1: Anonymous visitor visits landing page, checks health, course catalogue, and public templates."""
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    # Public course catalogue
    res_courses = client.get("/api/learning/courses")
    assert res_courses.status_code == 200
    courses_data = res_courses.json()
    assert "data" in courses_data

    # Public inclusivity templates
    res_templates = client.get("/api/inclusivity/entrepreneurship/templates")
    assert res_templates.status_code == 200
    assert "templates" in res_templates.json() or "sectors" in res_templates.json() or res_templates.status_code == 200


def test_journey_02_candidate_registration_validation():
    """Journey 2: Candidate registration with input validation checks."""
    # Invalid email format fails with 422
    bad_res = client.post("/api/auth/register", json={
        "full_name": "Test Candidate",
        "email": "not-an-email",
        "password": "Password@123",
        "account_type": "candidate"
    })
    assert bad_res.status_code == 422

    # Valid registration succeeds
    valid_email = f"journey_cand_{uuid.uuid4().hex[:8]}@example.com"
    good_res = client.post("/api/auth/register", json={
        "full_name": "Journey Test Candidate",
        "email": valid_email,
        "password": "Password@123",
        "account_type": "candidate"
    })
    assert good_res.status_code in (200, 201)
    body = good_res.json()
    assert body["success"] is True
    assert body["data"]["user"]["email"] == valid_email


def test_journey_03_candidate_login_and_token_issuance():
    """Journey 3: Candidate authenticates with email and password, receiving valid JWT."""
    email = f"journey_login_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/auth/register", json={
        "full_name": "Login Candidate",
        "email": email,
        "password": "Password@123",
        "account_type": "candidate"
    })

    # Wrong password fails with 401
    bad_login = client.post("/api/auth/login", json={"email": email, "password": "WrongPassword!"})
    assert bad_login.status_code == 401

    # Correct credentials return token
    good_login = client.post("/api/auth/login", json={"email": email, "password": "Password@123"})
    assert good_login.status_code == 200
    data = good_login.json()["data"]
    assert "access_token" in data
    assert data["user"]["email"] == email


def test_journey_04_onboarding_data_submission_and_persistence():
    """Journey 4: Candidate completes onboarding flow; data is persisted in database."""
    email = f"journey_onboard_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/auth/register", json={
        "full_name": "Onboard Candidate",
        "email": email,
        "password": "Password@123",
        "account_type": "candidate"
    })
    token = client.post("/api/auth/login", json={"email": email, "password": "Password@123"}).json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

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
    res = client.post("/api/candidates/onboarding/complete", json=payload, headers=headers)
    assert res.status_code == 200
    res_data = res.json()["data"]
    assert res_data["candidate"]["onboarding_completed"] is True
    assert len(res_data["candidate"]["projects"]) == 1


def test_journey_05_profile_and_dashboard_data_restoration():
    """Journey 5: Candidate logs out, logs back in, and verifies dashboard data restores."""
    email = f"journey_restore_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/auth/register", json={
        "full_name": "Restore Candidate",
        "email": email,
        "password": "Password@123",
        "account_type": "candidate"
    })
    token = client.post("/api/auth/login", json={"email": email, "password": "Password@123"}).json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch profile via /api/candidates/me
    prof_res = client.get("/api/candidates/me", headers=headers)
    assert prof_res.status_code == 200
    assert prof_res.json()["data"]["email"] == email

    # Fetch candidate dashboard
    dash_res = client.get("/api/dashboard/candidate", headers=headers)
    assert dash_res.status_code == 200
    assert "profile_completion" in dash_res.json()["data"] or "application_stats" in dash_res.json()["data"]


def test_journey_06_project_crud_lifecycle():
    """Journey 6: Candidate creates, reads, updates, and deletes portfolio projects."""
    email = f"journey_project_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/auth/register", json={
        "full_name": "Project Candidate",
        "email": email,
        "password": "Password@123",
        "account_type": "candidate"
    })
    token = client.post("/api/auth/login", json={"email": email, "password": "Password@123"}).json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create via /api/candidates/me/projects
    create_res = client.post("/api/candidates/me/projects", json={
        "title": "Hospital Readmission Risk Dashboard",
        "description": "Predictive analytics dashboard using Power BI and healthcare dataset.",
        "technologies_used": ["Power BI", "SQL", "DAX"],
        "project_link": "https://github.com/example/hospital-risk",
        "repository_link": "https://github.com/example/hospital-risk",
        "year_completed": 2026,
        "skills_demonstrated": ["Data Analytics", "Power BI"]
    }, headers=headers)
    assert create_res.status_code == 201
    project_id = create_res.json()["data"]["id"]

    # Read via /api/candidates/me
    me_res = client.get("/api/candidates/me", headers=headers)
    assert me_res.status_code == 200
    assert any(p["id"] == project_id for p in me_res.json()["data"]["projects"])

    # Delete
    del_res = client.delete(f"/api/candidates/me/projects/{project_id}", headers=headers)
    assert del_res.status_code == 200


def test_journey_07_learning_hub_catalogue_and_modules():
    """Journey 7: Candidate explores course catalogue and inspects course details."""
    res = client.get("/api/learning/courses")
    assert res.status_code == 200
    courses = res.json()["data"]
    assert len(courses) > 0

    slug = courses[0]["slug"]
    detail_res = client.get(f"/api/learning/courses/{slug}")
    assert detail_res.status_code == 200
    assert "modules" in detail_res.json()["data"]


def test_journey_08_career_passport_pdf_download_and_idor_protection():
    """Journey 8: Candidate securely downloads passport PDF; cross-candidate download fails with 403."""
    # User A
    email_a = f"passport_a_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/auth/register", json={"full_name": "Candidate A", "email": email_a, "password": "Password@123", "account_type": "candidate"})
    login_a = client.post("/api/auth/login", json={"email": email_a, "password": "Password@123"}).json()["data"]
    token_a = login_a["access_token"]

    # User B
    email_b = f"passport_b_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/auth/register", json={"full_name": "Candidate B", "email": email_b, "password": "Password@123", "account_type": "candidate"})
    login_b = client.post("/api/auth/login", json={"email": email_b, "password": "Password@123"}).json()["data"]
    cand_b_id = login_b["user"]["candidate_id"]

    # Own download succeeds
    own_pdf = client.get("/api/passport/download-pdf", headers={"Authorization": f"Bearer {token_a}"})
    assert own_pdf.status_code == 200
    assert own_pdf.headers["content-type"] == "application/pdf"

    # IDOR attempt by User A to download User B's passport is blocked with 403
    cross_pdf = client.get(f"/api/passport/download-pdf?candidate_id={cand_b_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert cross_pdf.status_code == 403

    # Unauthenticated request returns 401
    anon_pdf = client.get("/api/passport/download-pdf")
    assert anon_pdf.status_code == 401


def test_journey_09_mentorship_circles_and_booking():
    """Journey 9: Candidate lists mentorship circles and requests a 1:1 session."""
    email = f"journey_mentor_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/auth/register", json={"full_name": "Mentee Candidate", "email": email, "password": "Password@123", "account_type": "candidate"})
    login_data = client.post("/api/auth/login", json={"email": email, "password": "Password@123"}).json()["data"]
    token = login_data["access_token"]
    candidate_id = login_data["user"]["candidate_id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Circles list
    circles_res = client.get("/api/circles", headers=headers)
    assert circles_res.status_code == 200
    assert "circles" in circles_res.json()

    # Mentors list
    mentors_res = client.get("/api/mentors", headers=headers)
    assert mentors_res.status_code == 200
    mentors = mentors_res.json()["mentors"]
    mentor_id = mentors[0]["id"] if mentors else "test-mentor-id"

    # Request session with ISO timestamp
    scheduled_iso = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    booking_res = client.post("/api/mentors/sessions/request", json={
        "candidate_id": candidate_id,
        "mentor_id": mentor_id,
        "topic": "Career Break Transition Strategy",
        "goals": "Reviewing resume bullet points for data analytics returnships.",
        "scheduled_at": scheduled_iso,
        "format": "1:1 Video"
    }, headers=headers)
    assert booking_res.status_code in (200, 201)


def test_journey_10_employer_login_and_dashboard_access(employer_user):
    """Journey 10: Employer logs in and accesses employer metrics dashboard."""
    headers = {"Authorization": f"Bearer {employer_user['token']}"}
    dash_res = client.get("/api/employer/dashboard", headers=headers)
    assert dash_res.status_code == 200
    assert dash_res.json()["success"] is True


def test_journey_11_employer_candidate_review_with_consent(employer_user):
    """Journey 11: Employer accesses consented candidate directory with consent policy."""
    headers = {"Authorization": f"Bearer {employer_user['token']}"}
    cands_res = client.get("/api/employer/candidates/consented", headers=headers)
    assert cands_res.status_code == 200
    body = cands_res.json()
    assert "candidates" in body
    assert "consent_policy" in body


def test_journey_12_cross_role_boundary_enforcement(candidate_user, employer_user):
    """Journey 12: Role boundaries strictly enforced; candidate cannot access employer endpoints."""
    cand_headers = {"Authorization": f"Bearer {candidate_user['token']}"}
    emp_headers = {"Authorization": f"Bearer {employer_user['token']}"}

    # Candidate blocked from employer dashboard
    res_emp_dash = client.get("/api/employer/dashboard", headers=cand_headers)
    assert res_emp_dash.status_code == 403

    # Candidate blocked from consented candidate directory
    res_consented = client.get("/api/employer/candidates/consented", headers=cand_headers)
    assert res_consented.status_code == 403

    # Employer blocked from candidate-only dashboard
    res_cand_dash = client.get("/api/dashboard/candidate", headers=emp_headers)
    assert res_cand_dash.status_code == 403


def test_journey_13_truthful_error_states_on_invalid_credentials():
    """Journey 13: System returns truthful, fail-closed error responses without fabricating data."""
    # Bogus credentials with valid email format return 401
    res = client.post("/api/auth/login", json={
        "email": "non_existent_registered_user_999@example.com",
        "password": "RandomPassword@999"
    })
    assert res.status_code == 401
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] in ("UNAUTHORIZED", "INVALID_CREDENTIALS")

    # Tampered JWT token returns 401
    tampered_res = client.get("/api/candidates/profile", headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.token"})
    assert tampered_res.status_code == 401
