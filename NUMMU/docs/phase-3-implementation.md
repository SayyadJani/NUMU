# NUMU — Phase 3: DSA Data Architecture, Fast APIs & Frontend Integration Specification

## 1. Executive Overview

Phase 3 implements the persistent **Data Structures & Algorithms (DSA) Problem Repository & Topic Catalog** for the NUMU developer-learning platform. Based on the approved Phase 3A audit and data mapping, Phase 3 delivers verified data architecture, database-level pagination, multi-factor filtering, publication lifecycle authorization, strongly typed shared contracts, frontend UI integration, and regression-tested performance.

In accordance with strict phase boundaries, code execution, sandboxing, and submission evaluation are deferred to Phase 4.

---

## 2. Architecture & Design Principles

### 2.1 Monorepo Boundaries & Data Flow

```
                      ┌──────────────────────────────────────────────┐
                      │              @numu/types                     │
                      │  (Difficulty, ContentStatus, DTOs, Contracts) │
                      └──────────────┬───────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌─────────────────────────┐             ┌─────────────────────────┐
    │       @numu/web         │             │       @numu/api         │
    │  - Next.js 15 App Router│   HTTP/REST │  - NestJS 11 Controller │
    │  - dsaService API Client│◄───────────►│  - Problems/Topics Serv.│
    │  - Problems Catalog UI  │  /api/v1/...│  - RBAC / JwtAuthGuard  │
    │  - Problem Detail View  │             │  - PrismaService (ORM)  │
    └─────────────────────────┘             └────────────┬────────────┘
                                                         │
                                            ┌────────────▼────────────┐
                                            │     @numu/database      │
                                            │  - PostgreSQL 16 DB     │
                                            │  - Prisma Schema/Client │
                                            │  - Indexes & Foreign Keys│
                                            └─────────────────────────┘
```

1. **Database Ownership**: `@numu/database` owns the Prisma schema, database migrations, and canonical Prisma client. Only `@numu/api` imports `@numu/database`.
2. **Contract Sharing**: `@numu/types` exports pure TypeScript interfaces and enums (`Difficulty`, `ContentStatus`, `ProblemListItem`, `ProblemDetail`, `PaginatedProblemsResult`, `TopicItem`, etc.) without runtime ORM or backend dependencies.
3. **Frontend Isolation**: `@numu/web` never executes direct database queries. All data access flows through typed `dsaService` calling `@numu/api` over authenticated HTTP/REST.

---

## 3. Database Architecture & Schema Specification

### 3.1 Migration History

- **Migration**: `20261016100000_init_dsa_problems_and_topics`
- **Location**: `packages/database/prisma/migrations/20261016100000_init_dsa_problems_and_topics/migration.sql`
- **Integrity Policy**: Forward-only migrations. Never rewrites history or resets migrations.

### 3.2 Entities & Relationships

#### 1. `Topic` (`topics` table)
- `id`: UUID (Primary Key, `@default(uuid())`)
- `slug`: VarChar(100), Unique (`@unique`)
- `name`: VarChar(100)
- `description`: Text (Nullable)
- `orderIndex`: Int (`@default(0)`)
- `createdAt` / `updatedAt`: Timestamps

#### 2. `Problem` (`problems` table)
- `id`: UUID (Primary Key, `@default(uuid())`)
- `slug`: VarChar(150), Unique (`@unique`)
- `title`: VarChar(200)
- `difficulty`: Enum (`EASY`, `MEDIUM`, `HARD`)
- `status`: Enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `@default(DRAFT)`)
- `acceptanceRate`: Float (`@default(0.0)`)
- `likesCount` / `dislikesCount`: Int (`@default(0)`)
- `statement`: Text
- `constraints`: Text[]
- `starterCode`: JSON (Object mapping language keys to boilerplate code)
- `hints`: Text[]
- `timeLimit`: Int (`@default(2000)`, milliseconds)
- `memoryLimit`: Int (`@default(256)`, megabytes)
- `createdAt` / `updatedAt`: Timestamps

#### 3. `ProblemTopic` (`problem_topics` join table)
- `problemId`: UUID (Foreign Key -> `problems(id)` on delete CASCADE)
- `topicId`: UUID (Foreign Key -> `topics(id)` on delete CASCADE)
- **Primary Key**: `@@id([problemId, topicId])`
- **Index**: `@@index([topicId])`

#### 4. `ProblemExample` (`problem_examples` table)
- `id`: UUID (Primary Key, `@default(uuid())`)
- `problemId`: UUID (Foreign Key -> `problems(id)` on delete CASCADE)
- `orderIndex`: Int (`@default(0)`)
- `input`: Text
- `output`: Text
- `explanation`: Text (Nullable)
- **Index**: `@@index([problemId, orderIndex])`

### 3.3 Database Indexes & Optimization Decisions

| Table | Index Columns | Purpose |
|---|---|---|
| `problems` | `[status, difficulty, createdAt(desc)]` | Composite index for catalog filtering and default ordering. |
| `problems` | `[slug]` | Fast single-lookup by unique slug for detail API. |
| `problems` | `[status, createdAt(desc)]` | Fast lookup of published catalog without difficulty filter. |
| `problem_topics` | `[topicId]` | Fast reverse-join filtering when querying problems by topic slug/ID. |
| `problem_examples` | `[problemId, orderIndex]` | Efficient ordered retrieval of problem examples. |

---

## 4. Backend Modules & API Contracts

### 4.1 Implemented Modules (`apps/api`)

1. **`TopicsModule`**: Provides topic retrieval and topic catalog statistics.
2. **`ProblemsModule`**: Implements catalog pagination, multi-factor filtering, detail lookup, and admin CRUD with publication status controls.

### 4.2 Endpoint Catalog

| Endpoint | Method | Auth / Role | Description |
|---|---|---|---|
| `/api/v1/topics` | `GET` | Public | List all topics with problem counts |
| `/api/v1/topics/:id` | `GET` | Public | Get single topic by ID or slug |
| `/api/v1/problems` | `GET` | Optional JWT | Paginated problem catalog (public sees `PUBLISHED`, `ADMIN`/`AUTHOR` sees drafts if requested) |
| `/api/v1/problems/:slug` | `GET` | Optional JWT | Problem detail by slug (drafts restricted to `ADMIN`/`AUTHOR`) |
| `/api/v1/problems` | `POST` | `ADMIN`, `AUTHOR` | Create a new problem with topics and examples |
| `/api/v1/problems/:id` | `PUT` | `ADMIN`, `AUTHOR` | Update problem fields, status, topics, examples |
| `/api/v1/problems/:id` | `DELETE` | `ADMIN` | Delete problem |

### 4.3 Catalog Filtering & Pagination Query Parameters

- `page`: Positive integer (Default: `1`)
- `limit`: Bounded integer 1-100 (Default: `20`)
- `difficulty`: Optional enum (`EASY`, `MEDIUM`, `HARD`)
- `topic`: Optional topic slug or UUID
- `search`: Safe substring search over problem title and slug
- `status`: Optional status filter (Only honored if authenticated as `ADMIN` or `AUTHOR`)

### 4.4 Example Responses

#### `GET /api/v1/problems`
```json
{
  "items": [
    {
      "id": "e44d3170-c020-4bf0-a080-c1f0ffcffb91",
      "slug": "two-sum",
      "title": "Two Sum",
      "difficulty": "EASY",
      "status": "PUBLISHED",
      "acceptanceRate": 49.2,
      "likesCount": 1420,
      "dislikesCount": 42,
      "topics": [
        { "id": "1", "name": "Arrays & Hashing", "slug": "arrays-and-hashing" }
      ],
      "createdAt": "2026-10-16T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 5,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

#### `GET /api/v1/problems/two-sum`
```json
{
  "id": "e44d3170-c020-4bf0-a080-c1f0ffcffb91",
  "slug": "two-sum",
  "title": "Two Sum",
  "difficulty": "EASY",
  "status": "PUBLISHED",
  "acceptanceRate": 49.2,
  "likesCount": 1420,
  "dislikesCount": 42,
  "statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "constraints": [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "Only one valid answer exists."
  ],
  "hints": [
    "A brute force approach checks all pairs in O(n^2).",
    "Can you use a hash map to look up complements in O(1)?"
  ],
  "starterCode": {
    "javascript": "function twoSum(nums, target) {\n  // Implementation\n}",
    "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    pass",
    "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n    }\n};"
  },
  "timeLimit": 2000,
  "memoryLimit": 256,
  "examples": [
    {
      "id": "ex-1",
      "orderIndex": 0,
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  "topics": [
    { "id": "1", "name": "Arrays & Hashing", "slug": "arrays-and-hashing" }
  ],
  "createdAt": "2026-10-16T10:00:00.000Z",
  "updatedAt": "2026-10-16T10:00:00.000Z"
}
```

---

## 5. Security & Authorization Rules

1. **Publication Visibility (Server-Side Enforcement)**:
   - Anonymous and regular `USER` callers can **never** view `DRAFT` or `ARCHIVED` problems in catalog or detail APIs. Requests for unpublished slugs return `404 Not Found`.
   - `ADMIN` and `AUTHOR` callers can view draft problems and manage problem lifecycles.
2. **Privileged Operations**:
   - Creating or updating problems requires `Roles(Role.ADMIN, Role.AUTHOR)`.
   - Deleting problems requires `Roles(Role.ADMIN)`.
3. **Data Protection**:
   - Secret grading test cases, test suites, and internal evaluation parameters are completely excluded from public endpoints.

---

## 6. Frontend Integration (`apps/web`)

### 6.1 Route & Component Architecture

1. **`/dashboard/dsa` (Topic Hub)**:
   - Displays DSA topic track cards with real problem counts retrieved via `dsaService.getTopics()`.
2. **`/dashboard/dsa/problems` (Problems Catalog)**:
   - Full search input with debounced querying.
   - Topic selector pills and Difficulty filter dropdown (`ALL`, `EASY`, `MEDIUM`, `HARD`).
   - Clean tabular display with acceptance rate, difficulty color badges, and topic tags.
   - Database-level pagination controls with page indicators and previous/next navigation.
   - Comprehensive loading skeleton, empty result state with reset button, and error state.
3. **`/dashboard/dsa/problems/[slug]` (Problem Detail Workspace)**:
   - Left pane: Problem header, difficulty badge, acceptance rate, formatted statement, structured example test cases with input/output blocks, constraints list, and hints accordion.
   - Right pane: Multi-language code editor/viewer (JavaScript, Python, C++, Java) with starter boilerplate, language switcher, copy code, and reset actions.
   - Clean error banner for missing/unpublished problem slugs.

### 6.2 Service Architecture (`dsa.service.ts`)

- `dsaService` provides strongly typed methods:
  - `getTopics(): Promise<TopicItem[]>`
  - `getProblems(params: ProblemFilterQuery): Promise<PaginatedProblemsResult>`
  - `getProblemBySlug(slug: string): Promise<ProblemDetail>`
- Supports automatic fallback to offline mock data when the backend API is unreachable in detached development mode.

---

## 7. Verification & Automated Test Coverage

### 7.1 Automated Integration Test Suites

1. **DSA Problems & Topics E2E Suite (`apps/api/test-e2e-problems.js`)**:
   - **38/38 tests passing (100%)**.
   - Validates topic listing and counting.
   - Validates catalog pagination boundaries (page 1, page 2, limits).
   - Validates filtering by difficulty (`EASY`, `MEDIUM`, `HARD`).
   - Validates filtering by topic slug.
   - Validates title substring search.
   - Validates detail retrieval by slug.
   - Validates 404 response for non-existent slugs.
   - Validates draft visibility restriction (public cannot see drafts, admin can).
   - Validates RBAC protection on `POST`, `PUT`, `DELETE`.
   - Validates problem creation, update, and cascade deletion.

2. **Phase 2 Authentication Regression Suite (`apps/api/test-e2e-api.js`)**:
   - **40/40 tests passing (100%)**.
   - Confirms zero regressions in authentication, registration, login, token refresh, and profile endpoints.

3. **Backend Unit Tests**:
   - `problems.service.spec.ts` executed and passing.

4. **Lint and Typecheck**:
   - `pnpm typecheck`: **0 errors across all workspace packages**.
   - `pnpm lint`: **0 errors across all workspace packages**.

5. **Production Build**:
   - `@numu/api`: NestJS production build compiled cleanly.
   - `@numu/web`: Next.js 15 production build compiled 27/27 pages cleanly.

---

## 8. Local Development & Seed Guide

### 8.1 Database Migration
```bash
pnpm --filter @numu/database prisma migrate deploy
```

### 8.2 Database Seeding
To populate canonical topics and problem sets:
```bash
pnpm --filter @numu/database prisma db seed
```
*Seeded Problems*: `two-sum`, `valid-parentheses`, `merge-two-sorted-lists`, `reverse-linked-list`, `lru-cache`, plus 1 draft problem `median-of-two-sorted-arrays`.

### 8.3 Running Services
```bash
# Start backend API (Port 4000)
pnpm --filter @numu/api dev

# Start frontend Web App (Port 3000)
pnpm --filter @numu/web dev
```
