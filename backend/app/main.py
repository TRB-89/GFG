import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from backend.app.config.settings import settings
from backend.app.database.database import init_db
from backend.database.seed_data import seed_database
from backend.app.schemas.common import error_response

# Configure Structured Logging per Section 31
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("GFG_API")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing GFG Database tables...")
    init_db()
    logger.info("Verifying seed data...")
    seed_database()
    logger.info("GFG API ready.")
    yield

app = FastAPI(
    title="GFG Career Continuity & Return-to-Work Platform API",
    description="""
    Production-grade backend infrastructure and REST APIs for GFG.
    Designed for career-continuity and return-to-work pathways for women professionals.
    
    Features:
    - Candidate onboarding, career break tracking, skills and portfolio management
    - Career Continuity Passport generation
    - Employer company and returnship opportunity publishing
    - Duplicate application prevention & application tracking flow
    - Rule-based Compatibility Scoring engine (Module 2 V1)
    - Full Swagger/OpenAPI documentation
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration with strict explicit allowlist (No wildcard allowed with credentials)
configured_origins = settings.cors_origins
if settings.ENVIRONMENT == "development":
    dev_defaults = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]
    origins = list(dict.fromkeys(configured_origins + dev_defaults))
else:
    origins = configured_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# Public vs Private Asset Separation
STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage")
AVATARS_DIR = os.path.join(STORAGE_DIR, "avatars")
LOGOS_DIR = os.path.join(STORAGE_DIR, "company-logos")
RESUMES_DIR = os.path.join(STORAGE_DIR, "resumes")
CERTS_DIR = os.path.join(STORAGE_DIR, "certificates")

os.makedirs(AVATARS_DIR, exist_ok=True)
os.makedirs(LOGOS_DIR, exist_ok=True)
os.makedirs(RESUMES_DIR, exist_ok=True)
os.makedirs(CERTS_DIR, exist_ok=True)

# Mount public assets strictly to their specific subpaths
app.mount("/storage/avatars", StaticFiles(directory=AVATARS_DIR), name="public_avatars")
app.mount("/storage/company-logos", StaticFiles(directory=LOGOS_DIR), name="public_company_logos")

# Explicit security block: Private user documents must never be accessible via static file mounts
@app.get("/storage/resumes/{path:path}", include_in_schema=False)
def block_direct_static_resumes(path: str):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "code": "FORBIDDEN",
            "message": "Direct static access to private candidate documents is prohibited. Use authenticated endpoint /api/upload/resumes/{file_id}."
        }
    )

@app.get("/storage/certificates/{path:path}", include_in_schema=False)
def block_direct_static_certificates(path: str):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "code": "FORBIDDEN",
            "message": "Direct static access to private certificates is prohibited. Use authenticated verification endpoints."
        }
    )

# Include all modular routers
from backend.app.routers import (
    auth,
    candidates,
    career_breaks,
    skills,
    interests,
    companies,
    jobs,
    applications,
    dashboard,
    recommendations,
    uploads,
    admin,
    ai,
    digital_twin,
    simulator,
    adaptive_learning,
    career_passport_v2,
    community,
    inclusivity,
    employer_intelligence,
    government_pilot,
    privacy,
    responsible_ai,
    learning,
)

app.include_router(auth.router)
app.include_router(candidates.router)
app.include_router(career_breaks.router)
app.include_router(skills.router)
app.include_router(interests.router)
app.include_router(companies.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(dashboard.router)
app.include_router(recommendations.router)
app.include_router(uploads.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(digital_twin.router)
app.include_router(simulator.router)
app.include_router(adaptive_learning.router)
app.include_router(career_passport_v2.router)
app.include_router(community.router)
app.include_router(inclusivity.router)
app.include_router(employer_intelligence.router)
app.include_router(government_pilot.router)
app.include_router(privacy.router)
app.include_router(responsible_ai.router)
app.include_router(learning.router)

# Global Exception Handlers per Section 21 & 22
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code = "HTTP_ERROR"
    message = str(exc.detail)
    details = None
    if isinstance(exc.detail, dict):
        code = exc.detail.get("code", "ERROR")
        message = exc.detail.get("message", "An error occurred.")
        details = exc.detail.get("details", None)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(code, message, details)
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response(
            "VALIDATION_ERROR",
            "Submitted input parameters failed validation constraints.",
            details=[{"field": ".".join(str(l) for l in err["loc"]), "msg": err["msg"]} for err in errors]
        )
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception during {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response(
            "INTERNAL_SERVER_ERROR",
            "An internal error occurred. Please contact platform administrators."
        )
    )

@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "GFG Backend Platform",
        "version": "2.0.0",
        "database": "connected"
    }
