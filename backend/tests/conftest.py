import os
import shutil
import tempfile
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database.database import get_db, Base
import backend.app.database.database as db_module
from backend.app.models.user import Profile
from backend.app.models.company import Company
from backend.app.utils.security import hash_password, create_access_token

# Master database path to protect
MASTER_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "gfg_local.db"))

_test_temp_dir = None
_test_db_path = None
_test_engine = None
_TestSessionLocal = None


def pytest_configure(config):
    """
    Runs before any test module is collected or imported.
    Creates an isolated copy of the database and redirects
    backend.app.database.database.engine, SessionLocal, and get_db
    so that all test files and FastAPI routes use the isolated database.
    """
    global _test_temp_dir, _test_db_path, _test_engine, _TestSessionLocal

    _test_temp_dir = tempfile.mkdtemp(prefix="gfg_test_isolated_")
    _test_db_path = os.path.join(_test_temp_dir, "test_isolated.db")

    if os.path.exists(MASTER_DB_PATH):
        shutil.copy2(MASTER_DB_PATH, _test_db_path)
    else:
        temp_engine = create_engine(f"sqlite:///{_test_db_path}", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=temp_engine)
        temp_engine.dispose()

    _test_engine = create_engine(
        f"sqlite:///{_test_db_path}",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
    _TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_test_engine)

    # Replace db_module engine and SessionLocal before tests are imported
    db_module.engine = _test_engine
    db_module.SessionLocal = _TestSessionLocal

    if not os.path.exists(MASTER_DB_PATH):
        from backend.database.seed_data import seed_database
        from backend.database.seed_learning import seed_learning_hub_data
        _seed_db = _TestSessionLocal()
        try:
            seed_database(_seed_db)
            seed_learning_hub_data(_seed_db)
        finally:
            _seed_db.close()

    def override_get_db():
        db = _TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db


def pytest_unconfigure(config):
    """Clean up the isolated database and temp files after all tests finish."""
    global _test_temp_dir, _test_engine

    app.dependency_overrides.pop(get_db, None)

    if _test_engine:
        _test_engine.dispose()

    if _test_temp_dir and os.path.exists(_test_temp_dir):
        try:
            shutil.rmtree(_test_temp_dir, ignore_errors=True)
        except Exception:
            pass


@pytest.fixture
def db_session():
    """Provides a thread-safe database session targeting the isolated test database."""
    session = _TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    """Provides a TestClient wired to the isolated database."""
    return TestClient(app)


@pytest.fixture
def candidate_user(db_session):
    """Returns an authenticated candidate user email, profile, and JWT token."""
    email = "priya.sharma@example.com"
    user = db_session.query(Profile).filter(Profile.email == email).first()
    if not user:
        user = Profile(
            id="test-candidate-fixture-01",
            full_name="Priya Sharma",
            email=email,
            password_hash=hash_password("Password@123"),
            role="candidate",
            approval_status="active"
        )
        db_session.add(user)
        db_session.commit()
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {"user": user, "token": token, "email": email}


@pytest.fixture
def employer_user(db_session):
    """Returns an authenticated employer user with a linked company record."""
    email = "hr@novatech.com"
    user = db_session.query(Profile).filter(Profile.email == email).first()
    if not user:
        user = Profile(
            id="test-employer-fixture-01",
            full_name="Nova Tech HR",
            email=email,
            password_hash=hash_password("Password@123"),
            role="employer",
            approval_status="active"
        )
        db_session.add(user)
        db_session.flush()

        company = Company(
            id="test-company-fixture-01",
            owner_user_id=user.id,
            name="Nova Technologies Test",
            industry="Technology",
            location="Bengaluru"
        )
        db_session.add(company)
        db_session.commit()

    company = db_session.query(Company).filter(Company.owner_user_id == user.id).first()
    company_id = company.id if company else None
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {"user": user, "token": token, "email": email, "company_id": company_id}


@pytest.fixture
def admin_user(db_session):
    """Returns an authenticated admin user."""
    email = "admin@gfg.org"
    user = db_session.query(Profile).filter(Profile.email == email).first()
    if not user:
        user = Profile(
            id="test-admin-fixture-01",
            full_name="GFG Administrator",
            email=email,
            password_hash=hash_password("Password@123"),
            role="admin",
            approval_status="active"
        )
        db_session.add(user)
        db_session.commit()
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {"user": user, "token": token, "email": email}
