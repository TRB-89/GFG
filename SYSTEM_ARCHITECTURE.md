# GAP FOR GOOD (GFG 2.0) — System Architecture Specification

**Version:** 2.0.0-PROD-CANDIDATE  
**Date:** November 2026  
**Document Classification:** System Architecture & Integration Model  
**Status:** Approved & Verified Against Codebase  

---

## 1. System Topology & Architectural Overview

The GAP FOR GOOD platform utilizes a decoupled client-server architecture separating modern presentation from secure, stateless business logic and persistent data storage.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Presentation Layer (Next.js 16 + React 19)"]
        Browser[Modern Web Browser / Mobile Device]
        UI_Contexts[Accessibility / Bandwidth / Language Contexts]
        UI_Components[Midnight & Sage Modal Components]
        API_Client[Typed API Client: my-website/src/lib/api.ts]
        
        Browser --> UI_Contexts
        UI_Contexts --> UI_Components
        UI_Components --> API_Client
    end

    subgraph GatewayLayer ["Network & Perimeter Security Layer"]
        CORS[CORS Policy Enforcement]
        ReqID[UUID X-Request-ID Correlation Middleware]
        StaticBlock[Direct Storage Access Blocking Handler]
        
        API_Client -->|HTTPS + Bearer JWT| ReqID
        ReqID --> CORS
        CORS --> StaticBlock
    end

    subgraph BackendLayer ["Application Layer (FastAPI 0.115)"]
        AuthMiddleware[Role-Based Access Control: require_role]
        
        subgraph Routers ["Modular Domain Routers (25 Modules)"]
            R_Auth[auth.py]
            R_Cand[candidates.py]
            R_Pers[personalization.py]
            R_Pass[career_passport_v2.py]
            R_Jobs[jobs.py]
            R_Apps[applications.py]
            R_Emp[employer_intelligence.py]
            R_Admin[admin.py]
            R_Comm[community.py]
            R_Inc[inclusivity.py]
        end
        
        subgraph Services ["Core Business Service Layer"]
            S_Pers[PersonalizationService]
            S_Match[MatchingService]
            S_PDF[PassportPDFGenerator]
            S_AI[AIProviderEngine: OpenAI / Gemini / Fallback]
        end
        
        StaticBlock --> AuthMiddleware
        AuthMiddleware --> Routers
        Routers --> Services
    end

    subgraph DataLayer ["Persistence & External Services Layer"]
        DB[(Relational Database: SQLite / PostgreSQL)]
        Storage[(Private File Storage: /storage/resumes)]
        OpenAI_API[OpenAI API: gpt-4o]
        Gemini_API[Google Gemini API: gemini-1.5-flash]
        
        Services --> DB
        Services --> Storage
        S_AI -.->|Sanitized PII| OpenAI_API
        S_AI -.->|Sanitized PII| Gemini_API
    end
```

---

## 2. End-to-End Sequence Diagrams

### 2.1 Candidate Onboarding, Recommendation & Roadmap Sequence
This sequence details how a candidate registers, completes the 7-question onboarding assessment, and receives an adaptive comeback roadmap with confidence goals:

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Returning Woman
    participant UI as Next.js Client
    participant Auth as Auth Router (/api/auth)
    participant Cand as Candidate Router (/api/candidates)
    participant Pers as Personalization Service
    participant DB as Database (SQLAlchemy)

    Candidate->>UI: Submit Registration (Name, Email, Password)
    UI->>Auth: POST /api/auth/register
    Auth->>DB: Check unique email & Hash password with Bcrypt
    DB-->>Auth: Profile Record Created (Role: 'candidate')
    Auth-->>UI: Return JWT Access Token (HS256)

    Note over Candidate,UI: 7-Question Guided Onboarding Sequence
    loop Onboarding Steps 1 to 7
        Candidate->>UI: Fill Questions (Hiatus, Skills, Goals, Pacing)
        UI->>UI: Persist in browser LocalStorage
        UI->>Cand: POST /api/candidates/onboarding/draft
        Cand->>DB: Upsert draft JSON payload
        DB-->>Cand: Draft Persisted
    end

    Candidate->>UI: Click 'Complete Assessment'
    UI->>Cand: POST /api/candidates/onboarding/complete
    Cand->>DB: Create CandidateProfile, seed CandidateSkill records
    Cand->>Pers: Generate Initial Comeback Plan & Tier
    Pers->>DB: Seed ConfidenceGoals & Active Roadmaps
    DB-->>Cand: Commit Transaction
    Cand-->>UI: Return Complete Profile & Readiness Score (e.g. 88%)
    UI-->>Candidate: Render Midnight & Sage Candidate Workspace
```

---

### 2.2 Employer Verification & Consented Candidate Discovery Sequence
This sequence details how an employer registers, undergoes manual compliance review, and accesses opted-in candidate evidence:

```mermaid
sequenceDiagram
    autonumber
    actor Employer as Corporate Recruiter
    actor Admin as Compliance Auditor
    participant UI as Next.js Recruiter Desk
    participant EmpAPI as Employer Intelligence API
    participant DB as Relational Database

    Employer->>UI: Fill Org Registration & Sign Caregiving Charter
    UI->>EmpAPI: POST /api/employer/register
    EmpAPI->>DB: Create Company (verification_status='pending_review', verified=False)
    DB-->>EmpAPI: Company Stored
    EmpAPI-->>UI: 200 OK + "Registration queued for compliance review"

    Employer->>UI: Attempt Candidate Discovery
    UI->>EmpAPI: GET /api/employer/candidates/consented
    EmpAPI->>DB: Query Company verification_status
    Note over EmpAPI: Status is 'pending_review'
    EmpAPI-->>UI: 403 Forbidden (UNVERIFIED_EMPLOYER_ACCESS_DENIED)
    UI-->>Employer: Display "Compliance Audit in Progress"

    Admin->>EmpAPI: PATCH /api/employer/organizations/{id}/verify
    Note over Admin,EmpAPI: Payload: {verification_status: 'verified', notes: 'Domain & license verified'}
    EmpAPI->>DB: Update verified=True, status='verified', verified_at=NOW()
    DB-->>EmpAPI: Commit
    EmpAPI-->>Admin: 200 OK (Status Updated)

    Employer->>UI: Re-access Candidate Discovery
    UI->>EmpAPI: GET /api/employer/candidates/consented?skill=SQL
    EmpAPI->>DB: Filter CandidateProfile where is_discoverable_by_employers == True
    DB-->>EmpAPI: Return opted-in candidates
    EmpAPI-->>UI: Return Consented Candidates with Masked Hiatus & Anti-Bias Match
    UI-->>Employer: Render Candidate Cards with Zero Gap Penalty
```

---

### 2.3 Application State Machine & Status History Audit Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate
    actor Recruiter as Employer Recruiter
    participant AppAPI as Applications API (/api/applications)
    participant DB as Relational Database

    Candidate->>AppAPI: POST /api/jobs/{job_id}/apply
    AppAPI->>DB: Check for existing application (Section 33 prevention)
    alt Duplicate Application Found
        AppAPI-->>Candidate: 400 Bad Request (DUPLICATE_APPLICATION)
    else First-time Application
        AppAPI->>DB: Insert Application (status='submitted', status_history=[submitted])
        DB-->>AppAPI: Created
        AppAPI-->>Candidate: 201 Created
    end

    Recruiter->>AppAPI: PATCH /api/applications/{app_id}/status (status='under_review')
    AppAPI->>DB: Verify employer owns the job company
    AppAPI->>AppAPI: Validate transition in ALLOWED_TRANSITIONS
    AppAPI->>DB: Append to status_history & update status='under_review'
    DB-->>AppAPI: Updated
    AppAPI-->>Recruiter: 200 OK + Formatted Application

    Recruiter->>AppAPI: PATCH /api/applications/{app_id}/status (status='onboarded')
    Note over AppAPI: Transition 'under_review' -> 'onboarded' is invalid
    AppAPI-->>Recruiter: 400 Bad Request (INVALID_STATE_TRANSITION)
```

---

## 3. Entity-Relationship Data Architecture

The platform data model balances normalization with fast retrieval for reporting:

```mermaid
erDiagram
    PROFILES ||--o| CANDIDATE_PROFILES : "extends"
    PROFILES ||--o{ COMPANIES : "owns"
    PROFILES ||--o{ ACCESS_LOGS : "logs"
    
    CANDIDATE_PROFILES ||--o{ CANDIDATE_SKILLS : "possesses"
    SKILLS ||--o{ CANDIDATE_SKILLS : "categorizes"
    
    CANDIDATE_PROFILES ||--o{ CERTIFICATES : "holds"
    CANDIDATE_PROFILES ||--o{ PROJECTS : "develops"
    CANDIDATE_PROFILES ||--o{ LEARNING_PROGRESS : "records"
    CANDIDATE_PROFILES ||--o{ CONFIDENCE_GOALS : "tracks"
    CANDIDATE_PROFILES ||--o{ CONFIDENCE_CHECK_INS : "submits"
    CANDIDATE_PROFILES ||--o{ EMPLOYER_ACCESS_GRANTS : "issues"
    CANDIDATE_PROFILES ||--o{ APPLICATIONS : "submits"
    
    COMPANIES ||--o{ JOBS : "publishes"
    JOBS ||--o{ JOB_SKILLS : "specifies"
    SKILLS ||--o{ JOB_SKILLS : "references"
    
    JOBS ||--o{ APPLICATIONS : "targets"

    PROFILES {
        string id PK
        string auth_user_id UK
        string email UK
        string password_hash
        string full_name
        string role "candidate | employer | admin"
        string approval_status "active | pending_approval | rejected"
        datetime created_at
        datetime updated_at
    }

    CANDIDATE_PROFILES {
        string id PK
        string user_id FK
        string headline
        string target_role
        float years_experience
        string preferred_work_mode "remote | hybrid | onsite | flexible"
        string preferred_location
        boolean is_discoverable_by_employers
        boolean anonymous_in_discovery
        string career_break_visibility "private | employers | public"
    }

    COMPANIES {
        string id PK
        string owner_user_id FK
        string name
        string website
        string authorized_representative
        string business_contact_email
        string verification_status "pending_review | verified | rejected | suspended"
        boolean verified
        datetime verified_at
        string verified_by_user_id FK
        json compliance_checklist
        boolean hiring_charter_accepted
    }

    JOBS {
        string id PK
        string company_id FK
        string title
        string opportunity_type "returnship | job | flexible | project"
        string work_mode "remote | hybrid | onsite | flexible"
        string location
        integer duration_months
        float salary_min
        float salary_max
        string stipend_amount_description
        string status "active | closed | draft"
    }

    APPLICATIONS {
        string id PK
        string candidate_id FK
        string job_id FK
        string status "submitted | under_review | interview_scheduled | offer_extended | onboarded | rejected | withdrawn"
        text cover_note
        string resume_url
        json status_history
        datetime applied_at
        datetime updated_at
    }
```

---

## 4. Multi-Tier Security & Privacy Boundary Architecture

```mermaid
flowchart TD
    subgraph PublicZone ["Zone 0: Public Perimeter"]
        PublicRequests[Public Visitors & Web Crawlers]
        StaticAssets[Public Static Assets: Favicon, Landing Page Media]
        PublicEndpoints[Public Endpoints: /api/auth/login, /api/auth/register, /api/jobs]
    end

    subgraph AuthenticatedZone ["Zone 1: Candidate Protected Zone"]
        CandidateUser[Authenticated Candidate User: Role == 'candidate']
        CandidateProfile[Private Profile, Onboarding Drafts, Learning Progress]
        ConfidenceCheckIns[Personal Confidence Check-Ins & Reflective Micro-Actions]
        PassportGenerator[Personal Career Passport PDF & Section Toggles]
    end

    subgraph EmployerZone ["Zone 2: Employer Recruiter Zone"]
        EmployerUser[Authenticated Employer: Role == 'employer']
        VerificationGate{Verified Org Check: comp.verified == True}
        RecruiterDesk[Pipeline Dashboard & Returnship Builder]
        ConsentedCandidates[Opted-In Candidates: is_discoverable_by_employers == True]
    end

    subgraph AdminZone ["Zone 3: Compliance & Administration Zone"]
        AdminUser[Compliance Auditor: Role == 'admin']
        OrgVerificationTool[Company Verification Lifecycle Tool]
        SystemMetrics[Aggregated De-identified Macro Metrics]
    end

    subgraph StorageSecurity ["Isolated Document Storage"]
        PrivateResumes[storage/resumes/: Blocked from Direct Static Web Access]
        PrivateCerts[storage/certificates/: Authenticated Download Routes Only]
    end

    PublicRequests --> PublicEndpoints
    PublicRequests --> StaticAssets
    PublicRequests -.->|Direct File Access Denied: 403 Forbidden| PrivateResumes

    CandidateUser --> CandidateProfile
    CandidateUser --> ConfidenceCheckIns
    CandidateUser --> PassportGenerator
    CandidateUser --> StorageSecurity

    EmployerUser --> VerificationGate
    VerificationGate -- Verified --> RecruiterDesk
    VerificationGate -- Verified --> ConsentedCandidates
    VerificationGate -- Unverified --> BlockEmployer[403: UNVERIFIED_EMPLOYER_ACCESS_DENIED]

    AdminUser --> OrgVerificationTool
    AdminUser --> SystemMetrics
```

---

## 5. Architectural Quality Attributes & Non-Functional Requirements

### 5.1 Performance & Latency
- **Sub-100ms API Execution:** Core read endpoints (`/api/personalization/dashboard`, `/api/employer/dashboard`) execute in under 25ms against SQLite/PostgreSQL.
- **Client Bundle Efficiency:** Next.js Turbopack generates modular route bundles (<120 KB gzip for initial page load).
- **Bandwidth Adaptation:** Dynamic video streaming bitrate throttled automatically upon detecting `save-data` headers.

### 5.2 Accessibility & Inclusion (WCAG 2.2 AA)
- Comprehensive ARIA labeling on all interactive dialogs and modals (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
- Built-in font-scaling (100%–150%), high-contrast monochromatic themes, and OpenDyslexic typography support.
- Fully keyboard-navigable focus management with Escape key modal dismissals.

### 5.3 Reliability & Fault Tolerance
- **Three-Tier Fallback Hierarchy:** OpenAI → Gemini → Deterministic Local Heuristics ensures 100% feature availability during third-party LLM outages.
- **Client Offline Resilience:** Onboarding progress saved concurrently to browser storage and database draft endpoints.

---

*Verified against `CrediAI / GFG 2.0` architecture specifications and regression test suites.*

