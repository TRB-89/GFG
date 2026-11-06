import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_public_avatars_accessible():
    """Verify that /storage/avatars is mounted and served as a public static directory."""
    # A non-existent file in the mounted directory returns 404 (not 403 Forbidden)
    res = client.get("/storage/avatars/non_existent_avatar.png")
    assert res.status_code == 404


def test_public_company_logos_accessible():
    """Verify that /storage/company-logos is mounted and served as a public static directory."""
    res = client.get("/storage/company-logos/non_existent_logo.png")
    assert res.status_code == 404


def test_private_resumes_strictly_blocked_403():
    """
    CRITICAL SECURITY CHECK:
    Direct static access to /storage/resumes/{file} must be blocked with HTTP 403.
    """
    res = client.get("/storage/resumes/candidate_resume_123.pdf")
    assert res.status_code == 403
    body = res.json()
    assert body["error"]["code"] == "FORBIDDEN"
    assert "prohibited" in body["error"]["message"].lower()


def test_private_certificates_strictly_blocked_403():
    """
    CRITICAL SECURITY CHECK:
    Direct static access to /storage/certificates/{file} must be blocked with HTTP 403.
    """
    res = client.get("/storage/certificates/cert_confidential_999.pdf")
    assert res.status_code == 403
    body = res.json()
    assert body["error"]["code"] == "FORBIDDEN"
    assert "prohibited" in body["error"]["message"].lower()


def test_next_config_contains_safe_storage_rewrites():
    """Verify next.config.ts configures rewrites for public assets and excludes private storage."""
    next_config_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "my-website", "next.config.ts")
    )
    assert os.path.exists(next_config_path), "next.config.ts must exist"

    with open(next_config_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Public assets must be rewritten
    assert "/storage/avatars/:path*" in content
    assert "/storage/company-logos/:path*" in content

    # Private documents must NOT be rewritten
    assert "/storage/resumes" not in content
    assert "/storage/certificates" not in content

