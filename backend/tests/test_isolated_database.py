import os
import hashlib
import uuid
import pytest
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, CandidateProject
from backend.app.utils.security import hash_password
from backend.tests.conftest import MASTER_DB_PATH


def calculate_file_hash(filepath: str) -> str:
    """Calculate MD5 hash of a file if it exists."""
    if not os.path.exists(filepath):
        return ""
    hasher = hashlib.md5()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def test_crud_operations_on_isolated_database(db_session):
    """Verify that records can be created, read, updated, and deleted in the isolated DB."""
    unique_email = f"isolation_test_{uuid.uuid4().hex[:8]}@example.com"
    new_user = Profile(
        id=str(uuid.uuid4()),
        full_name="Isolation Test User",
        email=unique_email,
        password_hash=hash_password("Password@123"),
        role="candidate",
        approval_status="active"
    )
    db_session.add(new_user)
    db_session.commit()

    # Read
    fetched = db_session.query(Profile).filter(Profile.email == unique_email).first()
    assert fetched is not None
    assert fetched.full_name == "Isolation Test User"

    # Update
    fetched.full_name = "Updated Isolation User"
    db_session.commit()

    updated = db_session.query(Profile).filter(Profile.email == unique_email).first()
    assert updated.full_name == "Updated Isolation User"

    # Delete
    db_session.delete(updated)
    db_session.commit()

    deleted = db_session.query(Profile).filter(Profile.email == unique_email).first()
    assert deleted is None


def test_transaction_rollback_preserves_clean_state(db_session):
    """Verify that an aborted transaction rolls back without leaving corrupted state."""
    unique_email = f"rollback_{uuid.uuid4().hex[:8]}@example.com"
    
    try:
        user = Profile(
            id=str(uuid.uuid4()),
            full_name="Rollback Candidate",
            email=unique_email,
            password_hash="plain",
            role="candidate"
        )
        db_session.add(user)
        db_session.flush()
        # Deliberately raise exception
        raise ValueError("Simulated unexpected failure")
    except ValueError:
        db_session.rollback()

    queried = db_session.query(Profile).filter(Profile.email == unique_email).first()
    assert queried is None, "Rollback failed: record was unexpectedly committed."


def test_master_database_is_never_mutated_by_test_writes(db_session, client):
    """
    CRITICAL CHECK: Writing records or issuing API requests through the test client
    must NEVER alter or mutate gfg_local.db on disk.
    """
    if not os.path.exists(MASTER_DB_PATH):
        pytest.skip("Master gfg_local.db does not exist locally.")

    hash_before = calculate_file_hash(MASTER_DB_PATH)
    mtime_before = os.path.getmtime(MASTER_DB_PATH)

    # Perform a sequence of heavy test operations: register user, create project
    reg_email = f"verify_isolation_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post("/api/auth/register", json={
        "full_name": "Tamper Test User",
        "email": reg_email,
        "password": "Password@123",
        "role": "candidate"
    })
    assert res.status_code in (200, 201)

    hash_after = calculate_file_hash(MASTER_DB_PATH)
    mtime_after = os.path.getmtime(MASTER_DB_PATH)

    assert hash_before == hash_after, "gfg_local.db hash changed! Tests are leaking writes into master database."
    assert mtime_before == mtime_after, "gfg_local.db timestamp changed! Tests are touching master database."


def test_fixture_users_authenticated_correctly(candidate_user, employer_user, admin_user, client):
    """Verify that the conftest fixtures provide valid tokens and isolated user contexts."""
    # Candidate profile access
    res = client.get("/api/candidates/profile", headers={"Authorization": f"Bearer {candidate_user['token']}"})
    assert res.status_code in (200, 404)  # Profile may or may not be created, but auth succeeded

    # Employer dashboard access
    res_emp = client.get("/api/employer/dashboard", headers={"Authorization": f"Bearer {employer_user['token']}"})
    assert res_emp.status_code == 200

    # Cross-role rejection: Candidate cannot access employer dashboard
    res_cross = client.get("/api/employer/dashboard", headers={"Authorization": f"Bearer {candidate_user['token']}"})
    assert res_cross.status_code == 403

