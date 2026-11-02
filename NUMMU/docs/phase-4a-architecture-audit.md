# NUMU Phase 4A — Architecture Audit: Code Submission & Execution

## 1. Executive Summary

Phase 4 of the NUMU platform addresses **Code Submissions and Secure Code Execution**. The platform requires an algorithmic execution engine capable of running user-submitted code in multiple programming languages (Python, TypeScript, JavaScript, C++, Java), validating outputs against visible and hidden test cases, computing execution metrics (runtime in milliseconds, memory in kilobytes), and enforcing strict resource and security constraints.

This document performs a read-only architectural audit of the existing codebase to:
1. Identify all existing submission, coding, and problem-related components across the monorepo.
2. Uncover implementation gaps between the current state and Phase 4 requirements.
3. Formulate architectural recommendations without altering existing code or database migrations.

---

## 2. Monorepo Architecture & Relevant File Inventory

The NUMU codebase is organized as a Turborepo monorepo with pnpm workspaces. The components relevant to Phase 4 are cataloged below:

```
NUMMU/
├── apps/
│   ├── api/                                      # NestJS 11 Modular Monolith
│   │   ├── src/
│   │   │   ├── app.module.ts                     # Root module registering feature modules
│   │   │   ├── main.ts                           # Global prefix /api/v1, cookie-parser, validation
│   │   │   ├── modules/
│   │   │   │   ├── auth/                         # JWT authentication, guards, cookies, roles
│   │   │   │   │   ├── guards/jwt-auth.guard.ts  # Token & HttpOnly cookie validation
│   │   │   │   │   ├── guards/roles.guard.ts     # RBAC (STUDENT, TRAINER, etc.)
│   │   │   │   │   └── decorators/current-user.ts# Authenticated user injection
│   │   │   │   ├── problems/                     # Problem CRUD, catalog pagination, slug lookup
│   │   │   │   │   ├── problems.controller.ts    # GET /problems, GET /problems/:slug, etc.
│   │   │   │   │   └── problems.service.ts       # Database queries & projection
│   │   │   │   ├── topics/                       # Topic catalog & syllabus
│   │   │   │   └── users/                        # User profiles & settings
│   │   │   └── prisma/prisma.service.ts          # Canonical Prisma database client
│   │   └── package.json                          # Dependencies: @nestjs/throttler, class-validator
│   └── web/                                      # Next.js 15 App Router Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── dashboard/dsa/
│       │   │   │   ├── page.tsx                  # DSA Topic Track Hub
│       │   │   │   ├── problems/page.tsx         # DSA Problem Catalog with search/pagination
│       │   │   │   └── problems/[slug]/page.tsx  # DSA Problem Detail Workspace
│       │   │   ├── tests/[testId]/attempt/page.tsx # Assessment attempt interface with Monaco
│       │   │   └── profile/[username]/page.tsx   # User profile with DSA submission history tab
│       │   ├── components/
│       │   │   ├── profile/tabs/DsaTab.tsx       # DSA stats & recent submissions list
│       │   │   └── profile/tabs/DsaSubmissionModal.tsx # Modal viewing submitted code
│       │   ├── services/
│       │   │   ├── dsa.service.ts                # Frontend API client for problems & topics
│       │   │   └── tests.service.ts              # Frontend service for assessments
│       │   └── types/profile.ts                  # DsaSubmission interface definition
│       └── package.json                          # Dependencies: @monaco-editor/react (v4.7.0)
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma                     # Prisma schema (User, Problem, Topic, etc.)
│   │   │   └── migrations/                       # Versioned SQL migrations
│   │   └── src/seed.ts                           # Database seeder for problems & topics
│   └── types/                                    # Shared TypeScript domain contracts
│       ├── src/problem.types.ts                  # ProblemDetail, ProblemListItem, Difficulty
│       ├── src/topic.types.ts                    # TopicItem
│       └── src/user.types.ts                     # User & Auth types
├── compose.yaml                                  # Docker Compose for PostgreSQL 17
└── docs/                                         # Architecture specifications
```

---

## 3. Audit of the Existing User Interface

A comprehensive walkthrough of the existing user-facing screens reveals the following state:

| UI Feature / Screen | Component Path | Current State | Verification Details |
|---|---|---|---|
| **Problem Catalog** | `apps/web/src/app/dashboard/dsa/problems/page.tsx` | **Verified & Functional** | Live database-paginated table, debounced search, topic pills, difficulty filter, loading skeleton, error states. |
| **Problem Detail Statement** | `apps/web/src/app/dashboard/dsa/problems/[slug]/page.tsx` | **Verified & Functional** | Shows title, difficulty badge, acceptance rate, topics, Markdown statement, structured examples, constraints, and hints accordion. |
| **Code Editor on Problem Page** | `apps/web/src/app/dashboard/dsa/problems/[slug]/page.tsx` | **Partially Implemented** | Simple `<textarea>` editor with language dropdown (`selectedLang`), syntax template switching, copy, and reset. **Lacks Monaco editor, line numbers, and syntax highlighting**. |
| **Run & Submit Buttons on Problem Page** | `apps/web/src/app/dashboard/dsa/problems/[slug]/page.tsx` | **Missing** | Bottom bar contains only a placeholder badge: *"Code Execution & Judge0 (Phase 4)"*. No execution triggers exist. |
| **Console / Drawer for Testcases & Output** | `apps/web/src/app/dashboard/dsa/problems/[slug]/page.tsx` | **Missing** | No collapsible bottom drawer for sample cases, custom inputs, stdout/stderr, runtime, or memory. |
| **Assessment Monaco Interface** | `apps/web/src/app/tests/[testId]/attempt/page.tsx` | **Verified (Mock Data)** | Contains a rich `@monaco-editor/react` implementation, draggable testcase console drawer, custom input, and simulated run/submit via `setTimeout(..., 600)`. |
| **Profile Submissions Tab** | `apps/web/src/components/profile/tabs/DsaTab.tsx` | **Verified (Mock Data)** | Displays submission cards with difficulty, status badge, runtime, memory, and click-to-view code modal (`DsaSubmissionModal.tsx`) using hardcoded dummy data from `apps/web/src/data/profile.ts`. |
| **Problem Submissions History** | `apps/web/src/app/dashboard/dsa/problems/[slug]/page.tsx` | **Missing** | No sub-tab on the problem workspace to view past submissions for the current problem. |

---

## 4. Existing Backend Capabilities & Infrastructure

### 4.1 What Exists (Verified)
1. **NestJS Modular Monolith**: Robust modular architecture with global prefix `/api/v1`, class-validator transformation pipeline, global exception handling, and Swagger OpenAPI documentation.
2. **Authentication & Session Management**:
   - `JwtAuthGuard` supporting Bearer header and HttpOnly cookies (`numu_access_token`).
   - `RolesGuard` supporting RBAC (`STUDENT`, `TRAINER`, `COLLEGE_ADMIN`, `PLATFORM_ADMIN`).
   - Token rotation, family revocation, and active session checking.
3. **Problem & Topic Persistence**:
   - `Problem` entity with `slug`, `title`, `difficulty`, `status`, `statement`, `constraints`, `hints`, `boilerplate` (JSON), `acceptanceRate`, and timestamps.
   - `ProblemExample` entity with `input`, `output`, `explanation`, and `order`.
   - `ProblemTopic` many-to-many relationship with `Topic`.
4. **Rate Limiting Package**: `@nestjs/throttler` (v6.7.1) is installed in `apps/api/package.json`.

### 4.2 What Is Missing (Gaps Identified)
1. **No Submission Entity in Database**: `packages/database/prisma/schema.prisma` has no `Submission` model to store user code, execution verdict, runtime, memory, compiler errors, or test results.
2. **No Hidden Test Case Entity**: `ProblemExample` only stores public illustrative examples. There is no `ProblemTestCase` entity storing hidden test cases required for formal verdict evaluation.
3. **No Language Registry**: Programming languages are loosely represented as JSON keys in `problem.boilerplate` (`javascript`, `python`, `cpp`). There is no mapping to execution runtime parameters or Judge0 language IDs (e.g., Python 3 = 71, C++17 = 54, etc.).
4. **No Code Execution Service**: There is no Judge0 service in `compose.yaml`, no execution client/adapter in `apps/api`, and no asynchronous worker or polling mechanism.
5. **No Submission Endpoints**: `apps/api` has no controllers or routes for `POST /submissions/run`, `POST /submissions`, or `GET /submissions`.

---

## 5. Architectural Findings & Assumptions

### 5.1 Verified Facts
- **Fact 1**: The Next.js web application already has `@monaco-editor/react` (v4.7.0) installed and successfully used in `apps/web/src/app/tests/[testId]/attempt/page.tsx`.
- **Fact 2**: The database is PostgreSQL 17 running via Docker Compose (`compose.yaml`). Prisma ORM 6 manages schema and migrations.
- **Fact 3**: All API routes use `/api/v1` prefix and enforce strict request DTO validation via `class-validator` and `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.
- **Fact 4**: The frontend communicates with the backend via `apps/web/src/lib/api/api-client.ts`, which wraps the browser `fetch` API and transparently handles cookie credentials.

### 5.2 Proposed Architecture
- **Proposal 1**: Introduce a dedicated NestJS `SubmissionsModule` in `apps/api/src/modules/submissions`.
- **Proposal 2**: Implement an `ExecutionProvider` interface to decouple the business logic from Judge0, allowing mock execution during local tests without a live Judge0 container.
- **Proposal 3**: Differentiate ephemeral **Run Code** (testing code against sample/custom inputs without permanent database records) from formal **Submit Code** (grading code against hidden test cases, recording a persistent `Submission` with metrics and updating problem acceptance stats).

### 5.3 Unknowns & External Dependencies
- **Unknown 1**: Will Judge0 Community Edition be hosted on the same Docker network as PostgreSQL (`compose.yaml`), or accessed via an external cloud instance / RapidAPI?
  *Assumption for Phase 4*: Support local Docker Compose deployment in `compose.yaml` (Judge0 CE + Redis + PostgreSQL) with configurable environment variables (`JUDGE0_API_URL`, `JUDGE0_API_KEY`).
- **Unknown 2**: Does NUMU require a durable background queue (Redis + BullMQ) in Phase 4, or is in-memory asynchronous dispatch with database-backed status sufficient for early development?
  *Recommendation*: Use database-backed status (`QUEUED`, `PROCESSING`, final verdicts) with asynchronous service dispatch for initial delivery, leaving architecture open for BullMQ when concurrent volume requires distributed workers.
