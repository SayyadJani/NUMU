# NUMU Phase 4A — Implementation Roadmap & Execution Plan

## 1. Executive Summary

This roadmap provides a phased, step-by-step engineering plan for delivering Phase 4: Code Submissions & Execution. Each sub-phase has clear boundaries, dependencies, and verification criteria, ensuring zero regressions to Phases 1–3.

---

## 2. Phased Implementation Sequence

```
┌─────────────────────────────────────────────────────────┐
│ Phase 4A: Architecture Audit & Strategy (Current Phase) │
│ - Read-only inspection & gap analysis                   │
│ - Data mapping & API contracts                          │
│ - Security threat model & testing strategy              │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 4B: Database Models, Seed & Contracts             │
│ - Add Submission and ProblemTestCase to Prisma schema   │
│ - Generate migration & update seed scripts              │
│ - Export shared types in @numu/types                    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 4C: Execution Engine & Judge0 Integration         │
│ - Add Judge0 CE to compose.yaml                         │
│ - Implement ExecutionProvider abstraction & mock engine │
│ - Implement Judge0ExecutionAdapter with base64 client   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 4D: Submissions API Module                        │
│ - SubmissionsModule, Service, Controller in apps/api    │
│ - POST /submissions/run & POST /submissions             │
│ - GET /submissions/:id & GET /submissions history       │
│ - Rate limiting, ownership checks & verdict aggregation │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 4E: Frontend Workspace & Monaco Editor            │
│ - Replace textarea with Monaco editor in [slug]/page    │
│ - Add draggable testcases / output console drawer       │
│ - Wire Run & Submit buttons to dsaService               │
│ - Implement polling state & submission history modal    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 4F: E2E Verification & Security Hardening         │
│ - Automated E2E test suites for Run & Submit            │
│ - Edge case testing (TLE, MLE, Compile Error, WA)       │
│ - Hidden testcase privacy validation                    │
│ - Documentation updates & production sign-off           │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Sub-Phase Breakdown & Acceptance Criteria

### Phase 4B: Data Architecture & Contracts
- **Scope**:
  - Add `Submission` and `ProblemTestCase` models in `packages/database/prisma/schema.prisma`.
  - Add `SubmissionStatus` and `SubmissionVerdict` enums.
  - Create migration `20261016200000_add_submissions_and_test_cases`.
  - Update `packages/types/src/submission.types.ts` with shared interfaces.
  - Update `packages/database/src/seed.ts` with sample and hidden test cases for canonical problems.
- **Acceptance Criteria**:
  - Migration applies cleanly forward.
  - `pnpm --filter @numu/database prisma db seed` seeds test cases without errors.
  - `pnpm typecheck` passes across all packages.

### Phase 4C: Execution Engine & Judge0 Adapter
- **Scope**:
  - Add Judge0 CE service (and supporting Redis) to `compose.yaml`.
  - Create `ExecutionProvider` interface in `apps/api/src/modules/submissions/providers/execution-provider.interface.ts`.
  - Implement `MockExecutionProvider` for offline development/testing.
  - Implement `Judge0ExecutionAdapter` utilizing base64 encoding and batch submissions.
- **Acceptance Criteria**:
  - Unit tests prove `MockExecutionProvider` returns expected results for all 5 languages.
  - Integration test verifies communication with local Judge0 Docker container.

### Phase 4D: Backend Submissions Module
- **Scope**:
  - Create `apps/api/src/modules/submissions`.
  - Implement DTOs (`RunCodeDto`, `SubmitCodeDto`, `SubmissionQueryDto`) with `class-validator`.
  - Implement `SubmissionsService`:
    - Handles ephemeral `runCode` with single execution.
    - Handles formal `submitCode` with database transaction, batch submission, and polling resolution.
    - Calculates terminal verdict according to strict priority.
  - Implement `SubmissionsController` with `@UseGuards(JwtAuthGuard)` and `@Throttle`.
- **Acceptance Criteria**:
  - 100% test coverage for DTO validation, ownership guards, and verdict calculation.
  - Automated test verifies that hidden test cases are never leaked in response payloads.

### Phase 4E: Frontend Coding Workspace Integration
- **Scope**:
  - Integrate `@monaco-editor/react` into `apps/web/src/app/dashboard/dsa/problems/[slug]/page.tsx`.
  - Build collapsible, draggable test case and execution console drawer (reusing patterns from `apps/web/src/app/tests/[testId]/attempt/page.tsx`).
  - Wire Run Code and Submit Code buttons to `dsaService`.
  - Implement live status polling (`QUEUED` ➔ `PROCESSING` ➔ `COMPLETED`) with spinners and verdict banners.
  - Add "Submissions" tab to view past attempts for the current problem.
- **Acceptance Criteria**:
  - User can edit code with syntax highlighting in Monaco.
  - Clicking "Run" executes against sample cases and shows stdout/expected output in the console.
  - Clicking "Submit" evaluates all test cases and shows terminal verdict badge.

### Phase 4F: E2E Verification & Security Hardening
- **Scope**:
  - Create automated test runner `test-e2e-submissions.js`.
  - Run complete regression suites:
    - Phase 2 Authentication & Profile tests (`test-e2e-api.js`).
    - Phase 3 DSA Problems & Topics tests (`test-e2e-problems.js`).
    - Phase 4 Submissions & Execution tests (`test-e2e-submissions.js`).
  - Verify lint, typecheck, and production build across all packages.
- **Acceptance Criteria**:
  - All test suites pass 100%.
  - Zero TypeScript or ESLint errors.
  - Monorepo production build succeeds.

---

## 4. Key Decisions & Unresolved Questions

1. **Judge0 Deployment Option**:
   - *Option A (Recommended)*: Local self-hosted Judge0 CE in `compose.yaml` (completely free, zero external API costs, works offline).
   - *Option B*: Cloud-hosted Judge0 via RapidAPI (requires external API keys and internet access).
   - *Decision needed before Phase 4C*: Local self-hosted container via `compose.yaml` is strongly recommended for local developer ergonomics.

2. **Monaco Editor Bundle Size**:
   - Monaco Editor loads Web Workers asynchronously. In Next.js, it must be loaded dynamically (`ssr: false`) or via `@monaco-editor/react` to prevent hydration mismatches. This was verified working in `apps/web/src/app/tests/[testId]/attempt/page.tsx`.
