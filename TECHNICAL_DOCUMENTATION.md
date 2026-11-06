# GAP FOR GOOD (GFG 2.0) — Master Technical Documentation

**Version:** 2.0.0-PROD-CANDIDATE  
**Release Engineering & Architecture Lead:** Core Architecture & Platform Engineering Team  
**Date:** November 2026  
**Classification:** Technical Architecture Specification & Platform Audit  
**Codebase:** `CrediAI / GFG 2.0` (FastAPI 0.115+ / Next.js 16.3+ Turbopack / SQLAlchemy 2.0+)  

---

## Table of Contents
1. [Executive Overview & Problem Statement](#1-executive-overview--problem-statement)
2. [Target Users & Role Definitions](#2-target-users--role-definitions)
3. [Existing Implemented Product Capabilities](#3-existing-implemented-product-capabilities)
4. [Candidate User Journey](#4-candidate-user-journey)
5. [Employer User Journey](#5-employer-user-journey)
6. [Administrator Workflow](#6-administrator-workflow)
7. [Seven-Question Personalized Onboarding](#7-seven-question-personalized-onboarding)
8. [Personalized Dashboard & Recommendation Engine](#8-personalized-dashboard--recommendation-engine)
9. [Confidence Rebuild Journey](#9-confidence-rebuild-journey)
10. [Adaptive Eight-Week Roadmap](#10-adaptive-eight-week-roadmap)
11. [Learning Hub & Verified Career Passport](#11-learning-hub--verified-career-passport)
12. [Mentorship & Entrepreneurship Pathways](#12-mentorship--entrepreneurship-pathways)
13. [Employer Verification & Skills-First Hiring](#13-employer-verification--skills-first-hiring)
14. [Jobs, Returnships & Application State Machine](#14-jobs-returnships--application-state-machine)
15. [Frontend Architecture & Component Structure](#15-frontend-architecture--component-structure)
16. [Backend Architecture & Service Boundaries](#16-backend-architecture--service-boundaries)
17. [Database Models & Entity Relationships](#17-database-models--entity-relationships)
18. [Comprehensive API Catalog & Contracts](#18-comprehensive-api-catalog--contracts)
19. [Authentication, Authorization & Privacy Controls](#19-authentication-authorization--privacy-controls)
20. [AI Architecture, Providers & Fallback Engine](#20-ai-architecture-providers--fallback-engine)
21. [File Storage & Private Document Access](#21-file-storage--private-document-access)
22. [Test Architecture & Verification Outcomes](#22-test-architecture--verification-outcomes)
23. [Deployment Architecture & Environment Setup](#23-deployment-architecture--environment-setup)
24. [Known Limitations & Production Roadmap](#24-known-limitations--production-roadmap)

---

## 1. Executive Overview & Problem Statement

### 1.1 The Career Hiatus Penalty
Across global labor markets, women who pause their careers for caregiving, maternity, family health, or personal transitions face severe structural friction when attempting to re-enter formal employment:
- **Resume Black Hole:** Automated Applicant Tracking Systems (ATS) commonly down-rank or filter out resumes with continuous employment gaps exceeding six months.
- **Confidence Erosion:** Extended absences from corporate environments lead to acute imposter phenomenon, self-discounting of capabilities, and reluctance to apply for roles matching pre-break seniorities.
- **Credential Obsolescence Bias:** Employers reflexively assume technical, operational, and analytical skills atrophy rapidly during pauses, despite demonstrable foundational competencies.
- **Unstructured On-Ramps:** Most hiring pipelines lack structured, low-risk transitional on-ramps (e.g., returnships, fellowships, milestone-based internships) that allow returners to demonstrate live technical aptitude.

### 1.2 The GAP FOR GOOD Solution
**GAP FOR GOOD (GFG 2.0)** addresses these structural failures through a dual-sided, skills-first opportunity platform:
- **For Returning Women:** An empowering, dignity-centered environment combining intelligent onboarding, deterministic skill gap analysis, confidence rebuilding micro-actions, adaptive modular learning, a cryptographically verifiable 12-section Career Passport, peer comeback circles, and entrepreneurship toolkits.
- **For Forward-Thinking Employers:** A verified recruiter desk enabling skills-first candidate discovery, explainable competency matching with zero career-break penalties, structured returnship builder tooling, and equal-pay milestone tracking.

---

## 2. Target Users & Role Definitions

The platform enforces Role-Based Access Control (RBAC) backed by SQLAlchemy models and JWT bearer tokens (`backend/app/middleware/auth_middleware.py`).

| Role Identifier | Description | Permissions & Boundaries | Primary UI Modals & Views |
|---|---|---|---|
| `candidate` | Women returning to employment, exploring career changes, upskilling, freelancing, or pursuing micro-entrepreneurship. | Self-profile CRUD, draft persistence, onboarding completion, confidence goal setting, roadmap customization, course tracking, passport generation, grant issuance/revocation, job applications. Denied employer discovery and admin controls. | `UserDashboardModal`, `IntelligentOnboardingModal`, `ConfidenceRebuildModal`, `AdaptiveRoadmapModal`, `CareerPassportModal`, `MentorshipCommunityModal`, `EntrepreneurshipHubModal` |
| `employer` | Corporate recruiters, talent acquisition leads, hiring managers, and returnship program directors. | Management of organization profile, returnship and opportunity publishing, consented candidate discovery, explainable match scoring, application pipeline status progression, HR toolkit playbooks. Denied if organization is unverified (`UNVERIFIED_EMPLOYER_ACCESS_DENIED`). | `EmployerIntelligenceModal`, `SmartOpportunityEngineModal` |
| `admin` | Platform compliance auditors, trust & safety managers, and system administrators. | Global read/write access, employer verification lifecycle management (`pending`, `verified`, `rejected`, `suspended`), user approval management, audit log inspection, system health metrics. | `AdminModal`, `GovernmentPilotModal` |

---

## 3. Existing Implemented Product Capabilities

The GFG 2.0 codebase encompasses 12 core integrated functional modules:

1. **Authentication & Identity Service:** Multi-role registration, bcrypt credential hashing, role-governed JWT generation, token refresh, and guest demo switching.
2. **Intelligent 7-Step Onboarding:** Deterministic state machine capturing career break duration, return motivations, technical competencies, target job functions, and weekly commitments.
3. **Adaptive Eight-Week Roadmap Engine:** Dynamic sprint planning with demonstrated skill skipping, life interruption accommodation without score penalties, and capstone scheduling.
4. **Verified Career Passport 2.0:** 12-section standardized credential passport with cryptographically verifiable QR codes, section-level visibility toggles, and authenticated PDF streaming.
5. **Confidence Rebuild Journey:** Cognitive reframing exercises, micro-actions, peer comeback circles, and daily confidence tracking.
6. **Skills-First Opportunity Engine:** Hybrid semantic/deterministic matching engine with zero penalty for career break gaps and anti-bias algorithmic protections.
7. **Returnship & Fellowship Builder:** Employer tool for creating paid 12–24 week structured re-entry tracks with guaranteed transparent stipends and assigned 1:1 mentors.
8. **Employer Intelligence & Consented Discovery:** Multi-parameter search filter for pre-vetted, consented candidate profiles with masked PII and explainable match breakdowns.
9. **Mentorship & Comeback Community:** 1:1 mentor booking, topic-focused comeback circles, discussion boards, and AI mock interview practice.
10. **Inclusive Entrepreneurship & Freelance Hub:** Local service pricing calculators, automated client proposal generators, and micro-grant scheme navigators.
11. **Responsible AI & Multi-Provider Architecture:** Multi-tier LLM fallback routing (OpenAI → Gemini → Deterministic Rule Engine) with zero data leak guarantees.
12. **Government & CSR Pilot Presentation Deck:** De-identified macro aggregate impact dashboards with \(k\)-anonymity cell suppression and UN SDG alignment metrics.

---

## 4. Candidate User Journey

```mermaid
flowchart TD
    Landing[Cinematic Landing Page] --> Auth[AuthModal: Register / Login]
    Auth --> CheckOnboarding{Onboarding Completed?}
    CheckOnboarding -- No --> Onboarding[IntelligentOnboardingModal: 7-Question Flow]
    Onboarding --> SaveDraft[Auto-Save Draft to LocalStorage & DB]
    SaveDraft --> OnboardingComplete[Complete Onboarding & Seed Profile]
    OnboardingComplete --> Dashboard[UserDashboardModal: Midnight & Sage Workspace]
    CheckOnboarding -- Yes --> Dashboard
    
    Dashboard --> ConfRebuild[ConfidenceRebuildModal: Goals & Check-ins]
    Dashboard --> Roadmap[AdaptiveRoadmapModal: 8-Week Dynamic Sprints]
    Dashboard --> Learning[LearningHubModal: Interactive Modules]
    Dashboard --> Passport[CareerPassportModal: 12-Section Verifiable Document]
    Dashboard --> Community[MentorshipCommunityModal: Circles & Mentor Booking]
    Dashboard --> Opportunity[SmartOpportunityEngineModal: Returnship Search]
    Dashboard --> EntreHub[EntrepreneurshipHubModal: Freelance Pricing & Proposals]
    
    Opportunity --> ApplyJob[Voluntary Job Application]
    ApplyJob --> AppPipeline[Application State Machine: Under Review -> Interview -> Offer]
    Passport --> ManageGrants[Grant Access Token to Verified Employer]
```

---

## 5. Employer User Journey

```mermaid
flowchart TD
    EmpReg[Employer Registration: POST /api/employer/register] --> Charter[Pledge Caregiving Dignity Charter]
    Charter --> PendingState[Organization Status: pending_review]
    PendingState --> AdminReview{Admin Compliance Audit}
    AdminReview -- Rejected --> Blocked[Access Denied]
    AdminReview -- Approved --> VerifiedState[Status: verified & Verified Badge Issued]
    
    VerifiedState --> EmpWorkspace[EmployerIntelligenceModal: Recruiter Desk]
    EmpWorkspace --> ViewDashboard[Pipeline Dashboard: Real KPI Metrics & Cohort Runway]
    EmpWorkspace --> CandidateDiscovery[Consented Discovery: Skills, Experience, Location Filters]
    CandidateDiscovery --> ExplainMatch[POST /api/employer/candidates/explain-match]
    
    EmpWorkspace --> PostReturnship[Returnship Builder: Paid Stipend, Mentor, Milestones]
    PostReturnship --> ActiveListing[Published Listing in Opportunity Engine]
    
    EmpWorkspace --> ManageApps[Application Queue]
    ManageApps --> AdvanceStage[Advance Application: Under Review -> Interview -> Offer -> Onboarded]
    AdvanceStage --> StatusHistoryLog[Append Immutable Audit Entry to status_history]
```

---

## 6. Administrator Workflow

Platform administrators oversee compliance, security, and verification workflows via `backend/app/routers/admin.py` and `backend/app/routers/employer_intelligence.py`:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Platform Auditor
    participant API as Employer Intelligence API
    participant DB as SQLite / PostgreSQL Database
    participant Audit as Immutable Recruiter Audit Trail

    Admin->>API: GET /api/admin/organizations/pending
    API->>DB: Query companies where verification_status == 'pending_review'
    DB-->>API: Return pending company records
    API-->>Admin: Display corporate registration details & representative email

    Admin->>API: PATCH /api/employer/organizations/{company_id}/verify
    Note over Admin,API: Payload: {verification_status: 'verified', notes: 'Verified registration'}
    API->>DB: Update verification_status='verified', verified=True, verified_at=NOW(), verified_by=admin_id
    API->>Audit: Append event: ORG_VERIFIED_BY_ADMIN
    DB-->>API: Commit transaction
    API-->>Admin: Return 200 OK + Updated Verification Object
```

---

## 7. Seven-Question Personalized Onboarding

The onboarding sequence (`my-website/src/components/IntelligentOnboardingModal.tsx` and `backend/app/routers/candidates.py`) executes a 7-step guided assessment:

1. **Career Hiatus Context:** Captures duration in months, primary caregiving/health/sabbatical categories, and optional private reflections.
2. **Professional Foundations:** Pre-break job title, total years of professional tenure, industry vertical, and primary functional domain.
3. **Primary Re-entry Objective:** Immediate full-time employment, paid returnship fellowship, part-time flexible work, or freelance entrepreneurship.
4. **Current Technical & Core Competencies:** Self-reported competency inventory mapped to the global GFG skills ontology (`backend/app/models/candidate.py:Skill`).
5. **Target Roles & Domain Ambition:** Desired future titles, target seniority tier, and salary expectations.
6. **Work Arrangement Preferences:** Remote, hybrid (with max office day constraints), on-site, or flexible hour allocations.
7. **Weekly Learning Availability:** Realistic committed hours per week (5–10 hrs, 10–20 hrs, 20+ hrs) and preferred sprint pacing.

**Draft Persistence Invariant:** Every user keystroke and step advance is mirrored to browser `localStorage` (`gfg_onboarding_draft`) and asynchronously submitted to `POST /api/candidates/onboarding/draft`. If a candidate loses network connectivity, closing and reopening the modal restores the exact state without loss of data.

---

## 8. Personalized Dashboard & Recommendation Engine

The personalization subsystem (`backend/app/services/personalization_service.py` and `backend/app/routers/personalization.py`) generates customized user dashboards based on deterministic evaluation rules:

```
                          ┌────────────────────────────┐
                          │ Candidate Profile & Draft │
                          └─────────────┬──────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
       Readiness Tier Scoring                       Skill Gap Formulation
 (Tenure, Assessment Scores, Certs)             (Target Role vs Verified Skills)
                 │                                             │
                 ▼                                             ▼
  Tier 1: Return Ready (>80%)                      Priority Micro-Learning Units
  Tier 2: Sprint Ready (60-80%)                    Targeted Milestone Quests
  Tier 3: Foundations First (<60%)                 Customized Mentor Matching
                 │                                             │
                 └──────────────────────┬──────────────────────┘
                                        │
                                        ▼
                         Personalized Candidate Workspace
                     (Adaptive Roadmap + Confidence Goals)
```

**Anti-Hallucination Fallback:** When external LLM APIs are unconfigured or experiencing rate limits, `PersonalizationService` falls back to deterministic rule-based heuristic generation, ensuring 100% platform availability without presenting mocked or static demo data as live AI output.

---

## 9. Confidence Rebuild Journey

Implemented in `my-website/src/components/ConfidenceRebuildModal.tsx` and backed by `backend/app/routers/personalization.py`:

- **Cognitive Reframing Modules:** Structured exercises transforming hiatus anxieties ("I have been out of tech for 3 years") into professional strengths ("Managed multi-stakeholder scheduling, budget allocation, and high-stress crisis resolution").
- **Confidence Micro-Actions:** Bite-sized daily milestones (e.g., "Review 1 PR on GitHub", "Update LinkedIn headline with target role", "Complete 1 SQL diagnostic challenge").
- **Comeback Circles:** Private, moderated peer cohorts sharing return journeys with automated PII masking (`backend/app/routers/community.py`).
- **Daily Confidence Pulse:** 1-to-5 slider recording emotional trajectory, logged in `confidence_check_ins` table with longitudinal progress charts.

---

## 10. Adaptive Eight-Week Roadmap

The adaptive roadmap engine (`backend/app/routers/adaptive_learning.py` and `my-website/src/components/AdaptiveRoadmapModal.tsx`) provides dynamic career comeback runways:

- **Weekly Sprint Cadence:**
  - *Weeks 1–2: Foundation Diagnostics & Refresher* (Core languages, environments, cloud tooling).
  - *Weeks 3–4: Practical Applied Problem Solving* (Frameworks, databases, automated workflows).
  - *Weeks 5–6: Production Capstone Implementation* (Public GitHub repository, test suites, architecture docs).
  - *Weeks 7–8: Career Passport Verification & Interview Readiness* (Peer reviews, mock technical screens, recruiter grants).
- **Non-Punitive Recovery:** If a candidate misses study targets due to caregiving emergencies, the roadmap automatically rebalances remaining sprint modules across future weeks without reducing the candidate's readiness score or progress percentage.
- **Demonstrated Skill Skipping:** Candidates scoring \(\ge 85\%\) on diagnostic assessments can skip redundant foundational modules, advancing immediately to advanced project sprints.

---

## 11. Learning Hub & Verified Career Passport

### 11.1 Learning Hub (`backend/app/routers/learning.py`)
- Standardized technical modules across Cloud Computing, Data Analytics, Full-Stack Web, AI Prompt Engineering, and Agile Operations.
- Embedded video lessons with bandwidth-aware streaming controls (`my-website/src/lib/bandwidth/BandwidthContext.tsx`).
- Diagnostic quizzes generating persistent `LearningProgress` and `Skill` verification records.

### 11.2 Verified Career Passport 2.0 (`backend/app/routers/career_passport_v2.py`)
The passport is a structured 12-section verifiable document:
1. `professional_introduction`: Candidate bio, target title, and return vision.
2. `career_timeline`: Chronological journey including career sabbatical entries.
3. `previous_employment`: Verified pre-break corporate tenure.
4. `education`: Institutional degrees and academic credentials.
5. `skill_inventory`: Categorized competencies with verification levels (`self_reported`, `assessment_supported`, `verified`).
6. `completed_learning`: GFG platform learning modules and completion certificates.
7. `certifications`: External third-party credentials (AWS, Microsoft, Google).
8. `portfolio_projects`: Demonstrable code artifacts with repository links.
9. `practical_assessments`: Empirical assessment scores and percentile benchmarks.
10. `mentor_feedback`: Validated qualitative reviews from assigned industry mentors.
11. `career_preferences`: Work mode, location, and compensation parameters.
12. `candidate_controlled_sharing`: Time-limited tokens, expiration timestamps, and audit access logs.

---

## 12. Mentorship & Entrepreneurship Pathways

### 12.1 Mentorship & Community Engine (`backend/app/routers/community.py`)
- Verified mentor directory filtered by functional discipline, corporate background, and shared lived experiences (e.g., parental hiatus, caregiver return).
- Direct 1:1 session booking with calendar synchronization and session goal definition.
- Comeback Circles: Async discussion boards with automatic regex-based masking of emails, telephone numbers, and street addresses.
- AI Mock Interview Practice: Interactive behavioral and technical interview simulations with STAR-method feedback.

### 12.2 Inclusive Entrepreneurship Hub (`backend/app/routers/inclusivity.py`)
- **Freelance Pricing Calculator:** Transparent calculation of sustainable hourly and monthly retainers factoring non-billable hours, self-employment taxes, healthcare, and operational overhead:
  $$\text{Hourly Rate} = \frac{\text{Desired Net Income} \times 1.30}{\text{Billable Weeks} \times \text{Billable Hours/Week}}$$
- **Automated Client Proposal Generator:** Generates professional statements of work (SOW) with milestone deliverables, payment terms, and scope revision clauses.
- **Scheme Navigator:** Directory of verified central and state micro-enterprise loan schemes (e.g., Mudra Yojana, Stand-Up India) with objective eligibility checklists.

---

## 13. Employer Verification & Skills-First Hiring

Implemented in `backend/app/routers/employer_intelligence.py` and `my-website/src/components/EmployerIntelligenceModal.tsx`:

### 13.1 Employer Verification Lifecycle
```
[Employer Registration] ──> pending_review (verified=False)
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   Admin Approves Verification              Admin Rejects Registration
   status = "verified"                      status = "rejected"
   verified = True                          verified = False
   verified_at = NOW()                                  │
              │                                         ▼
              │                              Appeal / Corrective Action
              ▼                                         │
   Infraction / Policy Breach                           ▼
   status = "suspended"                     Re-evaluation by Auditor
   verified = False                         status = "verified"
```

### 13.2 Skills-First Anti-Bias Matching Formula
Candidate match scoring evaluates competencies across empirical evidence categories:
$$\text{Overall Score} = (S_{\text{assess}} \times 0.35) + (S_{\text{certs}} \times 0.25) + (S_{\text{portfolio}} \times 0.25) + (S_{\text{tenure}} \times 0.15)$$

- Career hiatus duration is completely isolated from the mathematical formula: **0% scoring penalty for career breaks**.
- All raw caregiving, maternity, and personal sabbatical narratives are masked from the employer matching algorithm unless explicitly toggled public by the candidate.

---

## 14. Jobs, Returnships & Application State Machine

Managed in `backend/app/routers/applications.py` and `backend/app/routers/jobs.py`:

```mermaid
stateDiagram-v2
    [*] --> submitted: Candidate Voluntarily Applies
    submitted --> under_review: Recruiter Opens Profile
    submitted --> rejected: Criteria Not Met
    submitted --> withdrawn: Candidate Withdraws
    
    under_review --> shortlisted: Competency Alignment Verified
    under_review --> interview_scheduled: Interview Invitation
    under_review --> rejected: Non-Selection
    under_review --> withdrawn: Candidate Withdraws
    
    shortlisted --> interview_scheduled: Structured Interview Scheduled
    shortlisted --> rejected: Non-Selection
    shortlisted --> withdrawn: Candidate Withdraws
    
    interview_scheduled --> offer_extended: Rubric Assessment Passed
    interview_scheduled --> rejected: Post-Interview Feedback
    interview_scheduled --> withdrawn: Candidate Withdraws
    
    offer_extended --> onboarded: Offer Accepted & Runway Commenced
    offer_extended --> withdrawn: Offer Declined
    
    rejected --> under_review: Re-evaluation on New Evidence
    onboarded --> [*]
    withdrawn --> [*]
```

**State Transition Integrity:** The backend enforces `ALLOWED_TRANSITIONS`. Invalid transitions (e.g., `submitted` directly to `onboarded`, or transitioning from a terminal `withdrawn` state) are rejected with `400 Bad Request` (`INVALID_STATE_TRANSITION`). Every valid state transition appends an immutable entry to `Application.status_history`.

---

## 15. Frontend Architecture & Component Structure

### 15.1 Technology Stack
- **Framework:** Next.js 16.3.6 (App Router architecture with React 19).
- **Bundler:** Turbopack for rapid development and production builds.
- **Styling:** Tailwind CSS with custom design tokens adhering to the **Midnight & Sage** design system.
- **Iconography:** Lucide React icons.
- **Animation:** CSS transitions, keyframes, and Framer Motion.
- **Context Providers:**
  - `AccessibilityContext.tsx`: High contrast modes, font scale multipliers (100%–150%), dyslexia-friendly typography, and reduced motion toggles.
  - `BandwidthContext.tsx`: Low-data mode detecting `navigator.connection.saveData`, disabling auto-playing media and high-resolution video streams.
  - `LanguageContext.tsx`: Client-side multilingual translation provider (English, Hindi, Tamil, Telugu, Kannada, Marathi).

### 15.2 Component Directory Mapping
```
my-website/src/
├── app/
│   ├── layout.tsx                   # Root HTML shell with providers
│   ├── page.tsx                     # Main interactive portal with modal orchestrators
│   ├── globals.css                  # Global Midnight & Sage design tokens
│   ├── learning/page.tsx            # Dedicated standalone Learning Hub page
│   ├── minister-presentation/page.tsx # Fullscreen SDG and policy pilot presentation
│   └── verify/[certificateId]/page.tsx # Public certificate verification route
├── components/
│   ├── IntelligentOnboardingModal.tsx # 7-question candidate onboarding wizard
│   ├── UserDashboardModal.tsx       # Primary candidate dashboard workspace
│   ├── ConfidenceRebuildModal.tsx   # Cognitive reframing and daily confidence pulse
│   ├── AdaptiveRoadmapModal.tsx     # 8-week dynamic curriculum and milestone tracker
│   ├── CareerPassportModal.tsx      # 12-section verifiable Career Passport viewer
│   ├── EmployerIntelligenceModal.tsx # Recruiter desk, candidate discovery, returnships
│   ├── MentorshipCommunityModal.tsx # Comeback circles and mentor booking
│   ├── EntrepreneurshipHubModal.tsx # Pricing calculator and client proposal generator
│   ├── GovernmentPilotModal.tsx     # Policy pilot and CSR impact metric reporting
│   ├── AdminModal.tsx               # Compliance auditing and organization verification
│   └── editorial/                   # Cinematic landing page sections
│       ├── CinematicHero.tsx
│       ├── PinnedEditorialStory.tsx
│       ├── MissionStorySection.tsx
│       ├── TestimonialsSection.tsx
│       └── CareerComebackPortal.tsx
└── lib/
    ├── api.ts                       # Typed fetch client with JWT token injection
    └── accessibility/               # Accessibility provider and WCAG helpers
```

---

## 16. Backend Architecture & Service Boundaries

### 16.1 Technology Stack
- **Runtime:** Python 3.13.2.
- **Framework:** FastAPI 0.115.11 (Asynchronous REST API).
- **ORM:** SQLAlchemy 2.0.38 (Declarative models with session management).
- **Security:** Passlib (Bcrypt hashing) and Python-Jose (JWT generation and validation).
- **Logging & Tracing:** Structured logging with automatic UUID `X-Request-ID` correlation middleware.

### 16.2 Architectural Layering
```
                              ┌────────────────────────┐
                              │  HTTP Client (Next.js) │
                              └───────────┬────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │    FastAPI Application (main.py)       │
                      │  - CORS Middleware                     │
                      │  - Request ID Correlation Middleware   │
                      │  - Global Exception Handlers           │
                      └───────────────────┬────────────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
       ┌──────────────────────┐                      ┌──────────────────────┐
       │   Auth Middleware    │                      │   Router Controllers │
       │ (JWT / Role Checks)  │                      │ (25 Domain Routers)  │
       └───────────┬──────────┘                      └──────────┬───────────┘
                   │                                            │
                   └──────────────────────┬─────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │           Service Layer                │
                      │  - PersonalizationService              │
                      │  - AIProvider (OpenAI / Gemini / Fall) │
                      │  - MatchingService                     │
                      │  - PassportPDFGenerator                │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │    Database Layer (SQLAlchemy ORM)     │
                      │  - SQLite (Local Development & Tests)  │
                      │  - PostgreSQL (Production Migration)   │
                      └────────────────────────────────────────┘
```

---

## 17. Database Models & Entity Relationships

The relational model is declared across modular schema files in `backend/app/models/`:

```mermaid
erDiagram
    PROFILES ||--o| CANDIDATE_PROFILES : "has"
    PROFILES ||--o{ COMPANIES : "owns"
    PROFILES ||--o{ ACCESS_LOGS : "logs"
    
    CANDIDATE_PROFILES ||--o{ CANDIDATE_SKILLS : "possesses"
    SKILLS ||--o{ CANDIDATE_SKILLS : "categorizes"
    
    CANDIDATE_PROFILES ||--o{ CERTIFICATES : "earns"
    CANDIDATE_PROFILES ||--o{ PROJECTS : "builds"
    CANDIDATE_PROFILES ||--o{ LEARNING_PROGRESS : "completes"
    CANDIDATE_PROFILES ||--o{ CONFIDENCE_GOALS : "tracks"
    CANDIDATE_PROFILES ||--o{ CONFIDENCE_CHECK_INS : "records"
    CANDIDATE_PROFILES ||--o{ EMPLOYER_ACCESS_GRANTS : "issues"
    CANDIDATE_PROFILES ||--o{ APPLICATIONS : "submits"
    
    COMPANIES ||--o{ JOBS : "publishes"
    JOBS ||--o{ JOB_SKILLS : "requires"
    SKILLS ||--o{ JOB_SKILLS : "defines"
    
    JOBS ||--o{ APPLICATIONS : "receives"
    
    PROFILES {
        string id PK
        string email UK
        string full_name
        string role
        string approval_status
        datetime created_at
    }
    
    CANDIDATE_PROFILES {
        string id PK
        string user_id FK
        string target_role
        float years_experience
        boolean is_discoverable_by_employers
        boolean anonymous_in_discovery
        string career_break_visibility
    }
    
    COMPANIES {
        string id PK
        string owner_user_id FK
        string name
        string verification_status
        boolean verified
        datetime verified_at
        string verified_by_user_id FK
        json compliance_checklist
    }
    
    JOBS {
        string id PK
        string company_id FK
        string title
        string opportunity_type
        string work_mode
        float salary_min
        float salary_max
        string status
    }
    
    APPLICATIONS {
        string id PK
        string candidate_id FK
        string job_id FK
        string status
        json status_history
        datetime applied_at
    }
```

---

## 18. Comprehensive API Catalog & Contracts

| HTTP Method | Route Endpoint | Required Role | Summary & Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new candidate or employer account. |
| `POST` | `/api/auth/login` | Public | Authenticate user, return JWT bearer access token. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile and roles. |
| `GET` | `/api/candidates/onboarding/draft` | `candidate` | Fetch current in-progress onboarding state. |
| `POST` | `/api/candidates/onboarding/draft` | `candidate` | Upsert onboarding questionnaire progress. |
| `POST` | `/api/candidates/onboarding/complete`| `candidate` | Finalize onboarding and generate initial profile. |
| `GET` | `/api/personalization/me` | `candidate` | Fetch personalized career insights and recommendations. |
| `GET` | `/api/personalization/dashboard` | `candidate` | Get aggregate metrics, confidence streaks, and milestones. |
| `GET` | `/api/personalization/confidence/goals`| `candidate` | List candidate confidence rebuild goals. |
| `POST` | `/api/personalization/confidence/goals`| `candidate` | Create a new confidence micro-action goal. |
| `POST` | `/api/personalization/confidence/check-in`| `candidate`| Submit a daily confidence pulse rating (1–5). |
| `GET` | `/api/passport/me` | `candidate` | Retrieve candidate's full 12-section Career Passport. |
| `PUT` | `/api/passport/visibility` | `candidate` | Update candidate privacy and employer discovery consent. |
| `POST` | `/api/passport/grants` | `candidate` | Issue a time-limited access grant for an employer. |
| `DELETE` | `/api/passport/grants/{grant_id}`| `candidate` | Revoke an existing employer access grant token. |
| `GET` | `/api/passport/shared/{access_token}`| Public / Token | View shared passport authorized via access grant token. |
| `GET` | `/api/passport/download-pdf` | Authenticated | Generate and stream cryptographically signed PDF. |
| `POST` | `/api/jobs` | `employer`, `admin`| Publish a new standard job or returnship listing. |
| `GET` | `/api/jobs` | Public | Search published opportunities with skill/location filters. |
| `POST` | `/api/jobs/{job_id}/apply` | `candidate` | Voluntarily apply for a published opportunity. |
| `GET` | `/api/candidates/me/applications` | `candidate` | List all applications submitted by candidate. |
| `PATCH` | `/api/applications/{app_id}/status` | `employer`, `admin`| Advance candidate application along the state machine. |
| `POST` | `/api/employer/register` | Authenticated | Submit employer organization registration. |
| `PATCH` | `/api/employer/organizations/{id}/verify`| `admin` | Transition organization verification state. |
| `GET` | `/api/employer/dashboard` | `employer`, `admin`| Fetch employer pipeline metrics and cohort runways. |
| `GET` | `/api/employer/candidates/consented` | `employer`, `admin`| Search consented candidate profiles (Verified orgs only). |
| `POST` | `/api/employer/candidates/explain-match`| `employer`, `admin`| Calculate explainable 4-tier competency alignment. |
| `POST` | `/api/employer/returnships/create` | `employer`, `admin`| Create a structured paid returnship program. |
| `GET` | `/api/employer/hr-toolkit/templates`| `employer`, `admin`| Retrieve standardized bias-free evaluation rubrics. |

---

## 19. Authentication, Authorization & Privacy Controls

### 19.1 Security & Access Guardrails
1. **Password Encryption:** Passwords hashed with Bcrypt using adaptive salt rounds. Plaintext passwords are never logged or stored.
2. **Stateless JWT Tokens:** Tokens signed with `HS256` secret keys containing `sub` (user UUID), `email`, and `role`. Tokens expire after 7 days and require re-authentication.
3. **Fail-Closed Employer Authorization:** Handled via `get_employer_actor` in `backend/app/routers/employer_intelligence.py`. The legacy fallback to default database employers has been completely excised. Unauthenticated requests return `401 Unauthorized`; non-employer roles or employers not linked to the requested company return `403 Forbidden`.
4. **Tenant Isolation:** Employer users can strictly query and modify records associated with companies they own (`app.job.company.owner_user_id == current_user.id`).

### 19.2 Candidate Privacy Invariants
- **Opt-in Discovery:** Candidate profiles are excluded from employer searches by default until the candidate explicitly toggles `is_discoverable_by_employers = True`.
- **Identity Redaction:** Candidates can enable `anonymous_in_discovery = True`, causing candidate discovery APIs to return `"Anonymous Candidate"` in place of their legal name.
- **PII Shielding:** Direct telephone numbers, private residential street addresses, and unconsented medical/sabbatical notes are strictly excised from all employer discovery and passport payloads.

---

## 20. AI Architecture, Providers & Fallback Engine

The AI integration layer (`backend/app/services/ai/provider.py`) implements an enterprise multi-provider architecture designed to prevent vendor lock-in, eliminate single-point failures, and protect candidate privacy:

```mermaid
flowchart TD
    Request[AI Analysis Request: Skill Gap / Roadmap / Passport] --> PIIMask[PII Sanitization Filter: Regex Masking]
    PIIMask --> ProviderCheck{Check AI Provider Precedence}
    
    ProviderCheck -- OpenAI Configured & Valid --> OpenAI[OpenAI API: gpt-4o / gpt-3.5-turbo]
    OpenAI -- Success --> ReturnResult[Validate JSON Schema & Return]
    OpenAI -- Rate Limit / Timeout --> TryGemini[Failover to Secondary Provider]
    
    ProviderCheck -- Gemini Configured & Valid --> Gemini[Google Gemini API: gemini-1.5-flash]
    Gemini -- Success --> ReturnResult
    Gemini -- Error / Timeout --> TryFallback[Failover to Local Provider]
    
    TryGemini -- Error --> TryFallback
    ProviderCheck -- No Keys / Offline --> TryFallback
    
    TryFallback --> DeterministicEngine[Deterministic Rule-Based Heuristic Engine]
    DeterministicEngine --> ReturnResult
```

- **PII Scrubbing:** All text analyzed by external LLMs passes through `mask_sensitive_pii()`, stripping credit card numbers, Indian Aadhaar/PAN formats, phone numbers, and physical addresses.
- **Deterministic Reliability:** In environments without API keys or during upstream provider outages, `DeterministicFallbackProvider` generates standardized, high-quality, reproducible roadmaps and gap analyses derived from platform ontologies.

---

## 21. File Storage & Private Document Access

- **Private Document Segregation:** User resumes and credential certificates are stored in `storage/resumes` and `storage/certificates`.
- **Blocking Direct Static Access:** `main.py` explicitly overrides direct static web routing for private directories:
  ```python
  @app.get("/storage/resumes/{path:path}", include_in_schema=False)
  def block_direct_static_resumes(path: str):
      raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Direct static access prohibited."})
  ```
- **Authenticated Streaming Endpoints:** Document downloads require authorized JWT credentials via `GET /api/upload/resumes/{file_id}` with record-level candidate ownership checks.

---

## 22. Test Architecture & Verification Outcomes

### 22.1 Test Architecture
Testing is automated using `pytest`, `pytest-asyncio`, and `httpx.TestClient`:
- **Database Isolation (`backend/tests/conftest.py`):** Before tests run, `pytest_configure` creates an isolated scratch database in a temporary directory (`gfg_test_isolated_*`), redirecting all SQLAlchemy engine bindings. The master database `gfg_local.db` is strictly protected against test mutations.

### 22.2 Test Outcomes (Full Suite)
- **Total Backend Tests:** **212 passed / 212 total (100% pass rate)**.
- **Phase 5 Dedicated Test Suite (`test_phase5_employer_bridge.py`):** **12 passed / 12 scenarios**.
- **Frontend Code Quality:**
  - `npm run lint -- --quiet`: **0 ESLint errors**.
  - `next build`: **Compiled successfully with 0 TypeScript errors (Exit code 0)**.

---

## 23. Deployment Architecture & Environment Setup

### 23.1 Environment Configuration (`.env`)
```bash
# Server & Security
ENVIRONMENT=production
SECRET_KEY=generate-secure-random-64-character-hex-string
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=https://gfg.example.com,http://localhost:3000

# Database
DATABASE_URL=sqlite:///./gfg_local.db  # Development
# DATABASE_URL=postgresql://gfg_user:password@postgres-host:5432/gfg_production # Production

# AI Providers (Optional - Falls back to Deterministic Engine if blank)
OPENAI_API_KEY=
GEMINI_API_KEY=
DEFAULT_AI_PROVIDER=deterministic # 'openai', 'gemini', 'deterministic'

# Storage
STORAGE_DIR=./storage
```

### 23.2 Deployment Recommendations
- **Frontend:** Next.js standalone container deployed to Vercel or AWS ECS / Cloud Run with edge caching.
- **Backend:** FastAPI container deployed on AWS App Runner, GCP Cloud Run, or Kubernetes cluster with Gunicorn/Uvicorn workers.
- **Database:** Managed PostgreSQL (AWS RDS or Supabase) with automated point-in-time recovery and SSL encryption.

---

## 24. Known Limitations & Production Roadmap

1. **Database Modernization:** Current development defaults to SQLite. Production deployment requires transitioning to managed PostgreSQL using Alembic migrations.
2. **Cloud Object Storage:** File uploads currently target local filesystem storage (`storage/`). Production requires integrating S3 / Google Cloud Storage with short-lived presigned URLs.
3. **Distributed Rate Limiting:** In-memory request tracking should be augmented with Redis-backed token bucket rate limiters to prevent distributed credential stuffing.
4. **Enterprise Identity:** Integration of enterprise SSO (SAML 2.0 / Okta) for corporate employer workspaces.

---

*Certified as accurate and consistent with the GFG 2.0 repository codebase.*

