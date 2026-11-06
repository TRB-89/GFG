import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_request_id_generated_when_not_provided():
    """Verify that every response includes an auto-generated X-Request-ID header."""
    res = client.get("/health")
    assert res.status_code == 200
    req_id = res.headers.get("X-Request-ID")
    assert req_id is not None
    assert len(req_id) >= 16  # Valid UUID format


def test_request_id_propagated_when_provided_by_client():
    """Verify that an existing client-supplied X-Request-ID is honored and echoed back."""
    custom_id = f"client-trace-{uuid.uuid4().hex}"
    res = client.get("/health", headers={"X-Request-ID": custom_id})
    assert res.status_code == 200
    assert res.headers.get("X-Request-ID") == custom_id


def test_internal_server_error_returns_clean_json_without_stacktrace():
    """
    Verify that unhandled 500 exceptions return safe structured JSON
    with the request_id, without leaking python stack traces to the caller.
    """
    safe_client = TestClient(app, raise_server_exceptions=False)
    res = safe_client.get("/api/test-internal-error")
    assert res.status_code == 500
    assert res.headers.get("X-Request-ID") is not None

    body = res.json()
    assert body["success"] is False
    assert body["data"] is None
    assert body["error"]["code"] == "INTERNAL_SERVER_ERROR"
    assert "Traceback" not in str(body)
    assert "RuntimeError" not in str(body)
    assert body["error"]["request_id"] == res.headers.get("X-Request-ID")


def test_validation_error_includes_request_id_and_details():
    """Verify that 422 input validation errors return the structured format with request_id."""
    res = client.post("/api/auth/login", json={})
    assert res.status_code == 422
    assert res.headers.get("X-Request-ID") is not None

    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["error"]["request_id"] == res.headers.get("X-Request-ID")
    assert isinstance(body["error"]["details"], list)


def test_health_check_endpoint():
    """Verify health endpoint reports healthy database status and platform version."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["version"] == "2.0.0"
