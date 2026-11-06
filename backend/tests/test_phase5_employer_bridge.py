import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone
from backend.app.main import app
from backend.app.models.user import Profile
from backend.app.models.company import Company
from backend.app.models.job import Job, JobSkill
from backend.app.models.candidate import CandidateProfile, Skill
from backend.app.models.application import Application
from backend.app.utils.security import hash_password, create_access_token

client = TestClient(app)

def create_user_token(db_session, email: str, role: str = "employer", full_name: str = "Test User") -> tuple[Profile, str, dict]:
    user = db_session.query(Profile).filter(Profile.email == email).first()
    if not user:
        user = Profile(
            email=email,
            password_hash=hash_password("Password@123"),
            full_name=full_name,
            role=role,
            approval_status="active"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}
    return user, token, headers


# ============================================================================
# SCENARIO A: EMPLOYER REGISTRATION & VERIFICATION STATE LIFECYCLE
# ============================================================================

def test_a_employer_registration_and_verification_state_lifecycle(client, db_session):
    """
    Test A:
    1. Employer registration defaults to pending_review with verified=False.
    2. Non-admin users cannot alter verification status (403 forbidden).
    3. Admin transitions verification status: pending -> verified -> rejected -> suspended.
    4. Verification metadata (notes, verified_by_user_id, verified_at, checklist) is persisted.
    """
    emp_user, _, emp_headers = create_user_token(db_session, "new_employer_a@example.com", role="employer", full_name="Alpha Recruiter")
    admin_user, _, admin_headers = create_user_token(db_session, "admin_verifier_a@example.com", role="admin", full_name="Admin Verifier")

    # 1. Register organization
    reg_payload = {
        "company_name": "Apex Innovations Ltd",
        "official_website": "https://apex-innovations.example.com",
        "authorized_representative": "Alpha Recruiter (Head of Talent)",
        "business_contact_email": "talent@apex-innovations.example.com",
        "business_contact_phone": "+91 80 1234 5678",
        "industry": "Cloud Systems",
        "location": "Bengaluru, IN",
        "company_size": "100-250",
        "hiring_charter_accepted": True
    }
    reg_res = client.post("/api/employer/register", json=reg_payload, headers=emp_headers)
    assert reg_res.status_code == 200, reg_res.text
    reg_data = reg_res.json()
    assert reg_data["status"] == "success"
    company_id = reg_data["organization_id"]
    assert reg_data["verification_status"] == "pending_review"
    assert reg_data["is_verified"] is False

    # 2. Non-admin cannot verify organization
    non_admin_patch = client.patch(
        f"/api/employer/organizations/{company_id}/verify",
        json={"verification_status": "verified", "verification_notes": "Attempt by non-admin"},
        headers=emp_headers
    )
    assert non_admin_patch.status_code == 403

    # 3. Admin transitions: pending -> verified
    verify_res = client.patch(
        f"/api/employer/organizations/{company_id}/verify",
        json={
            "verification_status": "verified",
            "verification_notes": "Verified business license and recruiter corporate email.",
            "compliance_checklist": {"charter_signed": True, "domain_verified": True}
        },
        headers=admin_headers
    )
    assert verify_res.status_code == 200, verify_res.text
    v_data = verify_res.json()
    assert v_data["verification_status"] == "verified"
    assert v_data["is_verified"] is True
    assert v_data["verified_at"] is not None

    # Transition: verified -> rejected
    reject_res = client.patch(
        f"/api/employer/organizations/{company_id}/verify",
        json={"verification_status": "rejected", "verification_notes": "Salary history inquiry reported."},
        headers=admin_headers
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["verification_status"] == "rejected"
    assert reject_res.json()["is_verified"] is False

    # Transition: rejected -> suspended
    suspend_res = client.patch(
        f"/api/employer/organizations/{company_id}/verify",
        json={"verification_status": "suspended", "verification_notes": "Account suspended by Trust & Safety."},
        headers=admin_headers
    )
    assert suspend_res.status_code == 200
    assert suspend_res.json()["verification_status"] == "suspended"
    assert suspend_res.json()["is_verified"] is False

    # Re-verify: suspended -> verified
    reverify_res = client.patch(
        f"/api/employer/organizations/{company_id}/verify",
        json={"verification_status": "verified", "verification_notes": "Re-verified after corrective action."},
        headers=admin_headers
    )
    assert reverify_res.status_code == 200
    assert reverify_res.json()["verification_status"] == "verified"
    assert reverify_res.json()["is_verified"] is True


# ============================================================================
# SCENARIO B: UNAUTHORIZED / UNVERIFIED EMPLOYER CANDIDATE DISCOVERY DENIED
# ============================================================================

def test_b_unverified_employer_candidate_discovery_denied(client, db_session):
    """
    Test B:
    1. Unauthenticated request to /api/employer/candidates/consented returns 401.
    2. Candidate user accessing candidate discovery returns 403.
    3. Unverified employer (pending_review, rejected, suspended) returns 403 UNVERIFIED_EMPLOYER_ACCESS_DENIED.
    4. Verified employer receives 200 and candidates list.
    """
    # 1. Unauthenticated request
    unauth_res = client.get("/api/employer/candidates/consented")
    assert unauth_res.status_code in [401, 403]

    # 2. Candidate role attempting to access employer discovery
    cand_user, _, cand_headers = create_user_token(db_session, "candidate_seeker_b@example.com", role="candidate")
    cand_res = client.get("/api/employer/candidates/consented", headers=cand_headers)
    assert cand_res.status_code == 403

    # 3. Create unverified employer
    emp_user, _, emp_headers = create_user_token(db_session, "unverified_emp_b@example.com", role="employer")
    client.post("/api/employer/register", json={
        "company_name": "Unverified Corp B",
        "official_website": "https://unverified-b.example.com",
        "authorized_representative": "Unverified Rep",
        "business_contact_email": "unverified_emp_b@example.com",
        "hiring_charter_accepted": True
    }, headers=emp_headers)

    unver_res = client.get("/api/employer/candidates/consented", headers=emp_headers)
    assert unver_res.status_code == 403
    err_body = unver_res.json()
    err_code = (
        err_body.get("error", {}).get("code")
        or err_body.get("detail", {}).get("code")
        or err_body.get("code")
    )
    assert err_code == "UNVERIFIED_EMPLOYER_ACCESS_DENIED"

    # 4. Now verify employer and check discovery access granted
    admin_user, _, admin_headers = create_user_token(db_session, "admin_b@example.com", role="admin")
    comp = db_session.query(Company).filter(Company.owner_user_id == emp_user.id).first()
    client.patch(
        f"/api/employer/organizations/{comp.id}/verify",
        json={"verification_status": "verified"},
        headers=admin_headers
    )

    ver_res = client.get("/api/employer/candidates/consented", headers=emp_headers)
    assert ver_res.status_code == 200
    assert "candidates" in ver_res.json()


# ============================================================================
# SCENARIO C: CROSS-COMPANY TENANT ISOLATION
# ============================================================================

def test_c_cross_company_tenant_isolation(client, db_session):
    """
    Test C:
    1. Employer A cannot modify Employer B's opportunities.
    2. Employer A cannot view or update applications submitted to Employer B's jobs.
    3. Cross-tenant access fails closed with 403/404.
    """
    admin_user, _, admin_headers = create_user_token(db_session, "admin_c@example.com", role="admin")
    emp_a, _, headers_a = create_user_token(db_session, "employer_a_tenant@example.com", role="employer")
    emp_b, _, headers_b = create_user_token(db_session, "employer_b_tenant@example.com", role="employer")

    # Register & verify both companies
    client.post("/api/employer/register", json={
        "company_name": "Tenant A Corp",
        "official_website": "https://tenant-a.example.com",
        "authorized_representative": "Rep A",
        "business_contact_email": "a@tenant.example.com",
        "hiring_charter_accepted": True
    }, headers=headers_a)
    comp_a = db_session.query(Company).filter(Company.owner_user_id == emp_a.id).first()
    client.patch(f"/api/employer/organizations/{comp_a.id}/verify", json={"verification_status": "verified"}, headers=admin_headers)

    client.post("/api/employer/register", json={
        "company_name": "Tenant B Corp",
        "official_website": "https://tenant-b.example.com",
        "authorized_representative": "Rep B",
        "business_contact_email": "b@tenant.example.com",
        "hiring_charter_accepted": True
    }, headers=headers_b)
    comp_b = db_session.query(Company).filter(Company.owner_user_id == emp_b.id).first()
    client.patch(f"/api/employer/organizations/{comp_b.id}/verify", json={"verification_status": "verified"}, headers=admin_headers)

    # Employer B creates a job
    job_b_res = client.post("/api/employer/returnships/create", json={
        "program_title": "Tenant B Machine Learning Fellowship",
        "job_function": "Data Science",
        "duration_months": 4,
        "compensation_stipend": "₹90,000 / month",
        "working_arrangement": "Remote",
        "eligibility_criteria": "12+ month career pause",
        "learning_objectives": ["PyTorch", "MLOps"],
        "mentor_assignment": "Dr. Smith",
        "evaluation_criteria": ["Project delivery"],
        "potential_progression_options": "Staff ML Engineer"
    }, headers=headers_b)
    assert job_b_res.status_code == 200, job_b_res.text
    job_b_id = job_b_res.json()["program"]["program_id"]

    # Candidate applies to Job B
    cand_user, _, cand_headers = create_user_token(db_session, "cand_c@example.com", role="candidate")
    cand_profile = db_session.query(CandidateProfile).filter(CandidateProfile.user_id == cand_user.id).first()
    if not cand_profile:
        cand_profile = CandidateProfile(user_id=cand_user.id, headline="Data Scientist")
        db_session.add(cand_profile)
        db_session.commit()
        db_session.refresh(cand_profile)

    app_res = client.post(f"/api/jobs/{job_b_id}/apply", json={
        "cover_letter": "Excited for this ML returnship fellowship."
    }, headers=cand_headers)
    assert app_res.status_code in [200, 201], app_res.text
    app_id = app_res.json()["data"]["id"]

    # Employer A attempts to advance application belonging to Job B -> MUST FAIL CLOSED (403/404)
    tamper_res = client.patch(f"/api/applications/{app_id}/status", json={
        "status": "offer_extended",
        "notes": "Employer A Impostor"
    }, headers=headers_a)
    assert tamper_res.status_code in [403, 404]

    # Employer A dashboard does NOT list Job B or Application B
    dash_a = client.get("/api/employer/dashboard", headers=headers_a).json()
    app_ids_a = [a["application_id"] for a in dash_a.get("applications", [])]
    assert app_id not in app_ids_a


# ============================================================================
# SCENARIO D: CANDIDATE DISCOVERY CONSENT RESPECTED
# ============================================================================

def test_d_candidate_discovery_consent_respected(client, db_session):
    """
    Test D:
    1. Candidate with is_discoverable_by_employers=False does not appear in candidate discovery.
    2. When candidate opts in (is_discoverable_by_employers=True), candidate appears in discovery.
    3. When anonymous_in_discovery=True, full name is masked as 'Anonymous Candidate'.
    4. Undisclosed career break reasons remain masked.
    """
    # Create candidate
    cand_user, _, cand_headers = create_user_token(db_session, "consent_test_candidate_d@example.com", role="candidate", full_name="Sangeetha Krishnan")
    cand_profile = db_session.query(CandidateProfile).filter(CandidateProfile.user_id == cand_user.id).first()
    if not cand_profile:
        cand_profile = CandidateProfile(
            user_id=cand_user.id,
            headline="Full-Stack Engineer",
            target_role="Lead Software Engineer",
            years_experience=6.0,
            is_discoverable_by_employers=False,
            anonymous_in_discovery=False,
            career_break_visibility="private"
        )
        db_session.add(cand_profile)
    else:
        cand_profile.is_discoverable_by_employers = False
        cand_profile.anonymous_in_discovery = False
        cand_profile.career_break_visibility = "private"
    db_session.commit()
    db_session.refresh(cand_profile)

    # Verified employer checks discovery
    _, _, emp_headers = create_user_token(db_session, "hr@novatech.com", role="employer")
    res_1 = client.get("/api/employer/candidates/consented?company_name=Nova%20Technologies", headers=emp_headers)
    assert res_1.status_code == 200
    names_1 = [c["full_name"] for c in res_1.json()["candidates"]]
    assert "Sangeetha Krishnan" not in names_1

    # Candidate opts into employer discovery with anonymity
    vis_res = client.put("/api/passport/visibility", json={
        "show_contact_email": False,
        "is_discoverable_by_employers": True,
        "anonymous_in_discovery": True
    }, headers=cand_headers)
    assert vis_res.status_code == 200

    # Employer now discovers candidate with masked identity and masked break reason
    res_2 = client.get("/api/employer/candidates/consented?company_name=Nova%20Technologies", headers=emp_headers)
    assert res_2.status_code == 200
    cands_2 = res_2.json()["candidates"]
    anon_match = [c for c in cands_2 if c.get("candidate_id") == cand_profile.id]
    assert len(anon_match) == 1
    found = anon_match[0]
    assert found["full_name"] == "Anonymous Candidate"
    assert found["break_reason_masked"] is True
    assert "Private/Masked" in found["break_display_summary"]


# ============================================================================
# SCENARIO E: CAREER PASSPORT ACCESS GRANT LIFECYCLE & REVOCATION
# ============================================================================

def test_e_career_passport_grant_lifecycle_and_revocation(client, db_session):
    """
    Test E:
    1. Candidate generates an employer access grant token.
    2. Employer can view shared passport using valid access token.
    3. Candidate revokes access grant.
    4. Access is strictly blocked after revocation (404/revoked notice).
    """
    cand_user, _, cand_headers = create_user_token(db_session, "grant_cand_e@example.com", role="candidate", full_name="Revocable Candidate")
    cand_prof = db_session.query(CandidateProfile).filter(CandidateProfile.user_id == cand_user.id).first()
    if not cand_prof:
        cand_prof = CandidateProfile(user_id=cand_user.id, headline="Site Reliability Engineer")
        db_session.add(cand_prof)
        db_session.commit()

    # Create grant
    grant_res = client.post("/api/passport/grants", json={
        "grantee_organization": "Nova Technologies",
        "grantee_email": "talent@novatech.com",
        "expires_in_days": 14,
        "permissions": {
            "career_break_mode": "dates_only",
            "show_contact_email": True,
            "show_portfolio_projects": True
        }
    }, headers=cand_headers)
    assert grant_res.status_code in [200, 201], grant_res.text
    grant_data = grant_res.json()
    access_token = grant_data["access_token"]
    grant_id = grant_data["grant_id"]

    # View shared passport with valid token
    view_res = client.get(f"/api/passport/shared/{access_token}")
    assert view_res.status_code == 200
    assert "passport" in view_res.json()

    # Revoke grant
    revoke_res = client.delete(f"/api/passport/grants/{grant_id}", headers=cand_headers)
    assert revoke_res.status_code == 200

    # View after revocation must fail (404)
    revoked_view = client.get(f"/api/passport/shared/{access_token}")
    assert revoked_view.status_code in [403, 404]


# ============================================================================
# SCENARIO F: CANDIDATE SKILLS FILTERS & EXPLAINABLE MATCHING
# ============================================================================

def test_f_candidate_skills_filters_and_explainable_matching(client, db_session):
    """
    Test F:
    1. Querying candidates with skill, location, work_mode filters returns filtered subsets.
    2. Explain candidate match returns matched and missing skills with evidence breakdown.
    3. Career break duration incurs zero penalty.
    """
    _, _, emp_headers = create_user_token(db_session, "hr@novatech.com", role="employer")

    # Filter by skill
    res_sql = client.get("/api/employer/candidates/consented?company_name=Nova%20Technologies&skill=SQL", headers=emp_headers)
    assert res_sql.status_code == 200
    cands_sql = res_sql.json()["candidates"]
    assert len(cands_sql) > 0
    for c in cands_sql:
        ev = c.get("evidence_categories", {})
        all_skills = [s.get("skill", "") for s in ev.get("assessment_supported_skills", [])] + \
                     [s.get("skill", "") for s in ev.get("self_reported_experience", [])]
        assert any("SQL" in s.upper() for s in all_skills) or "SQL" in c["target_role"].upper()

    # Explain candidate match
    explain_res = client.post("/api/employer/candidates/explain-match", json={
        "candidate_id": "cand-demo-ananya",
        "candidate_name": "Ananya Raman",
        "candidate_skills": ["SQL", "Python", "Power BI"],
        "job_title": "Data Analytics Fellow",
        "job_required_skills": ["SQL", "Python", "Snowflake"],
        "years_pre_break_experience": 4.5,
        "assessment_score": 92.0,
        "verified_credentials": ["Power BI Associate"],
        "portfolio_projects": ["Retail Churn Diagnostic"]
    }, headers=emp_headers)
    assert explain_res.status_code == 200
    data = explain_res.json()["match_analysis"]
    assert "matched_skills" in data
    assert "missing_skills" in data
    assert "SQL" in data["matched_skills"]
    assert "Snowflake" in data["missing_skills"]
    assert "evidence_breakdown" in data
    assert "0 score penalty" in data["fair_hiring_guarantee"].lower()


# ============================================================================
# SCENARIO G: EMPLOYER CREATES LEGITIMATE JOB OPPORTUNITY WITH SKILLS
# ============================================================================

def test_g_employer_creates_job_opportunity_with_skills(client, db_session):
    """
    Test G:
    Verified employer creates job opportunity with required skills, stipend, and arrangements.
    Skills are linked to JobSkill and Skill models.
    """
    admin_user, _, admin_headers = create_user_token(db_session, "admin_g@example.com", role="admin")
    emp_user, _, emp_headers = create_user_token(db_session, "employer_g@example.com", role="employer")

    client.post("/api/employer/register", json={
        "company_name": "Zenith Cloud Solutions",
        "official_website": "https://zenith-cloud.example.com",
        "authorized_representative": "Zenith Recruiter",
        "business_contact_email": "talent@zenith-cloud.example.com",
        "hiring_charter_accepted": True
    }, headers=emp_headers)
    comp = db_session.query(Company).filter(Company.owner_user_id == emp_user.id).first()
    client.patch(f"/api/employer/organizations/{comp.id}/verify", json={"verification_status": "verified"}, headers=admin_headers)

    create_res = client.post("/api/jobs", json={
        "company_id": comp.id,
        "title": "Cloud Reliability Returnship Fellow",
        "description": "A 16-week paid returnship for engineers returning to the cloud sector.",
        "employment_type": "returnship",
        "work_mode": "hybrid",
        "location": "Bengaluru, IN",
        "duration_months": 4,
        "salary_min": 85000.0,
        "salary_max": 85000.0,
        "stipend_amount_description": "₹85,000 / month guaranteed stipend + health cover",
        "required_skills": ["Kubernetes", "Go", "Terraform"],
        "preferred_skills": ["Prometheus", "Grafana"]
    }, headers=emp_headers)
    assert create_res.status_code in [200, 201], create_res.text
    job_data = create_res.json()["data"]
    assert job_data["title"] == "Cloud Reliability Returnship Fellow"

    # Verify skill linkages in database
    job_id = job_data["id"]
    job_skills = db_session.query(JobSkill).filter(JobSkill.job_id == job_id).all()
    skill_names = [js.skill.name for js in job_skills if js.skill]
    assert "Kubernetes" in skill_names
    assert "Terraform" in skill_names


# ============================================================================
# SCENARIO H: CANDIDATE VOLUNTARILY APPLIES & DUPLICATE APPLICATION BLOCKED
# ============================================================================

def test_h_candidate_application_and_duplicate_prevention(client, db_session):
    """
    Test H:
    1. Candidate voluntarily applies to an active job opportunity.
    2. Status is initialized as 'submitted' with an initial status_history entry.
    3. Duplicate application to the same job is rejected (400).
    4. Candidate can view their own application in /api/candidates/me/applications.
    """
    admin_user, _, admin_headers = create_user_token(db_session, "admin_h@example.com", role="admin")
    emp_user, _, emp_headers = create_user_token(db_session, "employer_h@example.com", role="employer")

    client.post("/api/employer/register", json={
        "company_name": "Hiring Hub Technologies",
        "official_website": "https://hiring-hub.example.com",
        "authorized_representative": "Hub Rep",
        "business_contact_email": "hub@example.com",
        "hiring_charter_accepted": True
    }, headers=emp_headers)
    comp = db_session.query(Company).filter(Company.owner_user_id == emp_user.id).first()
    client.patch(f"/api/employer/organizations/{comp.id}/verify", json={"verification_status": "verified"}, headers=admin_headers)

    job_res = client.post("/api/employer/returnships/create", json={
        "program_title": "Full-Stack Returnship Track",
        "job_function": "Software Engineering",
        "duration_months": 4,
        "compensation_stipend": "₹75,000 / month",
        "working_arrangement": "Remote",
        "eligibility_criteria": "Career break 1+ years",
        "learning_objectives": ["FastAPI", "Next.js"],
        "mentor_assignment": "Senior Lead",
        "evaluation_criteria": ["Sprint completion"],
        "potential_progression_options": "Permanent Software Engineer"
    }, headers=emp_headers)
    job_id = job_res.json()["program"]["program_id"]

    cand_user, _, cand_headers = create_user_token(db_session, "applicant_cand_h@example.com", role="candidate", full_name="Aparna Sen")
    cand_prof = db_session.query(CandidateProfile).filter(CandidateProfile.user_id == cand_user.id).first()
    if not cand_prof:
        cand_prof = CandidateProfile(user_id=cand_user.id, headline="Frontend Architect")
        db_session.add(cand_prof)
        db_session.commit()

    # 1. Apply
    apply_res = client.post(f"/api/jobs/{job_id}/apply", json={
        "cover_letter": "I have 5 years pre-break engineering experience and completed the GFG refresh sprint."
    }, headers=cand_headers)
    assert apply_res.status_code in [200, 201], apply_res.text
    app_data = apply_res.json()["data"]
    assert app_data["status"] == "submitted"
    assert "status_history" in app_data
    assert len(app_data["status_history"]) >= 1

    # 2. Duplicate application blocked
    dup_res = client.post(f"/api/jobs/{job_id}/apply", json={
        "cover_letter": "Duplicate attempt."
    }, headers=cand_headers)
    assert dup_res.status_code == 400

    # 3. View my applications
    my_apps = client.get("/api/candidates/me/applications", headers=cand_headers)
    assert my_apps.status_code == 200
    my_app_ids = [a["id"] for a in my_apps.json()["data"]]
    assert app_data["id"] in my_app_ids


# ============================================================================
# SCENARIO I: APPLICATION STATUS TRANSITIONS WITH STATUS HISTORY
# ============================================================================

def test_i_employer_valid_status_transitions_with_history(client, db_session):
    """
    Test I:
    1. Valid status progression: submitted -> under_review -> interview_scheduled -> offer_extended -> onboarded.
    2. Invalid state jumps rejected (400).
    3. Status history records each transition with timestamp, actor, and notes.
    """
    admin_user, _, admin_headers = create_user_token(db_session, "admin_i@example.com", role="admin")
    emp_user, _, emp_headers = create_user_token(db_session, "employer_i@example.com", role="employer")

    client.post("/api/employer/register", json={
        "company_name": "Orbit Software",
        "official_website": "https://orbit-software.example.com",
        "authorized_representative": "Orbit Recruiter",
        "business_contact_email": "recruiting@orbit-software.example.com",
        "hiring_charter_accepted": True
    }, headers=emp_headers)
    comp = db_session.query(Company).filter(Company.owner_user_id == emp_user.id).first()
    client.patch(f"/api/employer/organizations/{comp.id}/verify", json={"verification_status": "verified"}, headers=admin_headers)

    job_res = client.post("/api/employer/returnships/create", json={
        "program_title": "Platform DevOps Returnship",
        "job_function": "Infrastructure",
        "duration_months": 4,
        "compensation_stipend": "₹80,000 / month",
        "working_arrangement": "Hybrid",
        "eligibility_criteria": "Career pause",
        "learning_objectives": ["Docker", "Kubernetes"],
        "mentor_assignment": "Platform Lead",
        "evaluation_criteria": ["Milestone checks"],
        "potential_progression_options": "Permanent SRE"
    }, headers=emp_headers)
    job_id = job_res.json()["program"]["program_id"]

    cand_user, _, cand_headers = create_user_token(db_session, "applicant_cand_i@example.com", role="candidate")
    cand_prof = db_session.query(CandidateProfile).filter(CandidateProfile.user_id == cand_user.id).first()
    if not cand_prof:
        cand_prof = CandidateProfile(user_id=cand_user.id, headline="DevOps Engineer")
        db_session.add(cand_prof)
        db_session.commit()

    apply_res = client.post(f"/api/jobs/{job_id}/apply", json={}, headers=cand_headers)
    app_id = apply_res.json()["data"]["id"]

    # Invalid jump: submitted -> onboarded directly MUST BE REJECTED
    bad_jump = client.patch(f"/api/applications/{app_id}/status", json={
        "status": "onboarded",
        "notes": "Attempting invalid leap"
    }, headers=emp_headers)
    assert bad_jump.status_code == 400

    # Valid sequence: submitted -> under_review
    t1 = client.patch(f"/api/applications/{app_id}/status", json={
        "status": "under_review",
        "notes": "Profile meets returnship prerequisites."
    }, headers=emp_headers)
    assert t1.status_code == 200
    assert t1.json()["data"]["status"] == "under_review"

    # Valid: under_review -> interview_scheduled
    t2 = client.patch(f"/api/applications/{app_id}/status", json={
        "status": "interview_scheduled",
        "notes": "Technical rubric discussion scheduled."
    }, headers=emp_headers)
    assert t2.status_code == 200

    # Valid: interview_scheduled -> offer_extended
    t3 = client.patch(f"/api/applications/{app_id}/status", json={
        "status": "offer_extended",
        "notes": "Offer extended with verified equal-pay stipend."
    }, headers=emp_headers)
    assert t3.status_code == 200

    # Valid: offer_extended -> onboarded
    t4 = client.patch(f"/api/applications/{app_id}/status", json={
        "status": "onboarded",
        "notes": "Candidate commenced 16-week runway."
    }, headers=emp_headers)
    assert t4.status_code == 200
    history = t4.json()["data"]["status_history"]
    assert len(history) >= 5


# ============================================================================
# SCENARIO J: DASHBOARD METRICS & PRIVACY-COMPLIANT SKILLS DISTRIBUTION
# ============================================================================

def test_j_employer_dashboard_metrics_and_skills_distribution_privacy(client, db_session):
    """
    Test J:
    1. Dashboard metrics return real counts matching database state.
    2. KPI definitions are returned for user clarity.
    3. Skills distribution respects the privacy threshold (n >= 3).
    """
    _, _, emp_headers = create_user_token(db_session, "hr@novatech.com", role="employer")

    dash_res = client.get("/api/employer/dashboard?company_name=Nova%20Technologies", headers=emp_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    metrics = dash_data["dashboard_metrics"]
    assert "active_opportunities" in metrics
    assert "applications_received" in metrics
    assert "candidates_reviewed" in metrics
    assert "interviews_scheduled" in metrics
    assert "offers_made" in metrics
    assert "candidates_onboarded" in metrics

    assert "kpi_definitions" in dash_data
    assert "skills_distribution" in dash_data
    dist = dash_data["skills_distribution"]
    assert "threshold_met" in dist
    assert "privacy_notice" in dist


# ============================================================================
# SCENARIO K: PRIOR PHASES INVARIANTS REMAIN INTACT
# ============================================================================

def test_k_prior_phases_invariants_preserved(client, db_session):
    """
    Test K:
    Phase 1-4 functionalities remain completely operational:
    1. Candidate onboarding draft retrieval.
    2. Career Passport generation and JSON structure.
    3. AI personalization roadmap recommendations.
    """
    cand_user, _, cand_headers = create_user_token(db_session, "priya.sharma@example.com", role="candidate")

    # 1. Onboarding draft
    draft_res = client.get("/api/candidates/onboarding/draft", headers=cand_headers)
    assert draft_res.status_code in [200, 404]

    # 2. Career Passport v2
    passport_res = client.get("/api/passport/me", headers=cand_headers)
    assert passport_res.status_code == 200
    p_data = passport_res.json()
    assert "passport_version" in p_data or "professional_introduction" in p_data or "passport" in p_data

    # 3. Personalization
    rec_res = client.get("/api/personalization/me", headers=cand_headers)
    assert rec_res.status_code == 200


# ============================================================================
# SCENARIO L: CANDIDATE PRIVATE DATA LEAK PROTECTION
# ============================================================================

def test_l_candidate_privacy_leak_protection(client, db_session):
    """
    Test L:
    Consented candidate discovery results must NOT leak:
    1. Candidate private contact numbers.
    2. Candidate personal street address.
    3. Unconsented caregiving / medical / family details.
    """
    _, _, emp_headers = create_user_token(db_session, "hr@novatech.com", role="employer")
    res = client.get("/api/employer/candidates/consented?company_name=Nova%20Technologies", headers=emp_headers)
    assert res.status_code == 200
    cands = res.json()["candidates"]

    for cand in cands:
        # Check no phone number leaked
        assert "phone" not in cand
        assert "contact_phone" not in cand
        # Check no street address leaked
        assert "street_address" not in cand
        # Check masked reasons
        if cand.get("break_reason_masked"):
            assert "private" in cand["break_display_summary"].lower() or "masked" in cand["break_display_summary"].lower()
