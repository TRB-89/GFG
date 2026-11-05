import io
import os
import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.database import SessionLocal
from backend.app.models.user import Profile
from backend.app.utils.security import hash_password, create_access_token

client = TestClient(app)

def get_auth_token(email: str, password: str = "Password@123") -> str:
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["data"]["access_token"]

def get_error_code(res) -> str:
    body = res.json()
    if "error" in body and isinstance(body["error"], dict):
        return body["error"].get("code", "")
    if "detail" in body:
        if isinstance(body["detail"], dict):
            return body["detail"].get("code", "")
        return str(body["detail"])
    return ""


# ==============================================================================
# FIX 1 — EMPLOYER AUTHORIZATION & TENANT ISOLATION
# ==============================================================================

def test_fix1_unauthenticated_employer_dashboard_rejected_401():
    """Unauthenticated access to employer dashboard must fail closed with 401."""
    res = client.get("/api/employer/dashboard")
    assert res.status_code == 401


def test_fix1_candidate_accessing_employer_dashboard_rejected_403():
    """Candidates attempting to access employer dashboard must be rejected with 403."""
    candidate_token = get_auth_token("priya.sharma@example.com")
    res = client.get("/api/employer/dashboard", headers={"Authorization": f"Bearer {candidate_token}"})
    assert res.status_code == 403
    assert get_error_code(res) == "FORBIDDEN"


def test_fix1_unauthenticated_consented_candidates_rejected_401():
    """Unauthenticated access to consented candidate directory must return 401."""
    res = client.get("/api/employer/candidates/consented")
    assert res.status_code == 401


def test_fix1_candidate_accessing_consented_candidates_rejected_403():
    """Candidates attempting to inspect consented candidates list must return 403."""
    candidate_token = get_auth_token("priya.sharma@example.com")
    res = client.get("/api/employer/candidates/consented", headers={"Authorization": f"Bearer {candidate_token}"})
    assert res.status_code == 403
    assert get_error_code(res) == "FORBIDDEN"


def test_fix1_employer_without_linked_company_rejected_403():
    """Employers without an authorized linked company record must fail closed with 403."""
    db = SessionLocal()
    try:
        user = Profile(
            full_name="Orphan Employer",
            email=f"orphan_{uuid.uuid4().hex[:6]}@testcompany.org",
            password_hash=hash_password("Password@123"),
            role="employer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    finally:
        db.close()

    res = client.get("/api/employer/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403
    assert get_error_code(res) == "NO_LINKED_COMPANY"


def test_fix1_employer_cross_tenant_access_rejected_403():
    """An employer must NOT be allowed to access or manage another tenant organization."""
    employer_token = get_auth_token("hr@novatech.com")
    # Nova Tech employer attempts to query Apex Global Systems
    res = client.get(
        "/api/employer/dashboard?company_name=Apex Global Systems",
        headers={"Authorization": f"Bearer {employer_token}"}
    )
    assert res.status_code == 403
    assert get_error_code(res) == "TENANT_ACCESS_DENIED"


def test_fix1_authorized_employer_own_company_succeeds_200():
    """Authenticated employer accessing their own linked organization succeeds."""
    employer_token = get_auth_token("hr@novatech.com")
    res = client.get("/api/employer/dashboard", headers={"Authorization": f"Bearer {employer_token}"})
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") == "success"
    org_name = data.get("organization_name") or data.get("company", {}).get("organization_name", "")
    assert "Nova" in org_name


# ==============================================================================
# FIX 2 — PRIVATE DOCUMENT STORAGE & ISOLATION
# ==============================================================================

def test_fix2_direct_static_resumes_blocked_403():
    """Direct static file retrieval under /storage/resumes must return 403 Forbidden."""
    res = client.get("/storage/resumes/sensitive_candidate_resume.pdf")
    assert res.status_code == 403
    assert get_error_code(res) == "FORBIDDEN"


def test_fix2_direct_static_certificates_blocked_403():
    """Direct static file retrieval under /storage/certificates must return 403 Forbidden."""
    res = client.get("/storage/certificates/private_degree_certificate.pdf")
    assert res.status_code == 403
    assert get_error_code(res) == "FORBIDDEN"


def test_fix2_public_static_avatars_accessible_not_forbidden():
    """Public assets under /storage/avatars must NOT return 403 Forbidden."""
    res = client.get("/storage/avatars/non_existent_avatar.png")
    # Static mount returns 404 for missing file, not 403
    assert res.status_code == 404


def test_fix2_resume_upload_requires_candidate_role():
    """Only candidates (or admin) can upload personal resumes."""
    employer_token = get_auth_token("hr@novatech.com")
    dummy_pdf = io.BytesIO(b"%PDF-1.4 test resume content")
    res = client.post(
        "/api/upload/resume",
        headers={"Authorization": f"Bearer {employer_token}"},
        files={"file": ("test.pdf", dummy_pdf, "application/pdf")}
    )
    assert res.status_code == 403
    assert get_error_code(res) == "FORBIDDEN"


def test_fix2_resume_download_cross_candidate_isolation():
    """Candidate B cannot download Candidate A's private resume."""
    priya_token = get_auth_token("priya.sharma@example.com")
    ananya_token = get_auth_token("ananya.raman@example.com")

    # Priya uploads a resume
    dummy_pdf = io.BytesIO(b"%PDF-1.4 Priya Sharma Private Resume")
    upload_res = client.post(
        "/api/upload/resume",
        headers={"Authorization": f"Bearer {priya_token}"},
        files={"file": ("priya_resume.pdf", dummy_pdf, "application/pdf")}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()["data"]
    protected_url = upload_data["url"]
    file_id = protected_url.split("/")[-1]

    # Priya can download her own resume
    priya_access = client.get(
        f"/api/upload/resumes/{file_id}",
        headers={"Authorization": f"Bearer {priya_token}"}
    )
    assert priya_access.status_code == 200
    assert priya_access.content.startswith(b"%PDF-1.4")

    # Ananya attempting to access Priya's resume gets 403 Forbidden
    ananya_access = client.get(
        f"/api/upload/resumes/{file_id}",
        headers={"Authorization": f"Bearer {ananya_token}"}
    )
    assert ananya_access.status_code == 403
    assert get_error_code(ananya_access) == "FORBIDDEN"


def test_fix2_resume_download_path_traversal_rejected():
    """Path traversal sequences in resume document identifiers must be rejected with 400."""
    priya_token = get_auth_token("priya.sharma@example.com")
    res = client.get(
        "/api/upload/resumes/traversal..attempt.pdf",
        headers={"Authorization": f"Bearer {priya_token}"}
    )
    assert res.status_code == 400
    assert get_error_code(res) == "INVALID_PATH"


# ==============================================================================
# FIX 3 — GIT & DATABASE PROTECTION
# ==============================================================================

def test_fix3_gitignore_contains_db_and_private_storage():
    """Verify that sensitive databases and private storage paths are included in .gitignore."""
    gitignore_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".gitignore")
    assert os.path.exists(gitignore_path), ".gitignore file must exist"
    with open(gitignore_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "*.db" in content
    assert "*.sqlite" in content
    assert "backend/storage/resumes/" in content
    assert "backend/storage/certificates/" in content
    assert ".env" in content


# ==============================================================================
# FIX 4 — CORS STRICT ALLOWLIST
# ==============================================================================

def test_fix4_cors_allowed_origin_returns_headers():
    """Preflight OPTIONS request from allowed origin returns Access-Control-Allow-Origin & credentials."""
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        }
    )
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_fix4_cors_disallowed_origin_blocked():
    """Preflight OPTIONS request from disallowed origin does NOT return Access-Control-Allow-Origin."""
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "http://malicious-attacker.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        }
    )
    assert response.headers.get("access-control-allow-origin") is None
