# Future Integration Checklist — Phase 4D Implementation

**Document Version:** 1.1.0  
**Phase:** Phase 4D — Implementation (Level 1 Completed)  
**Target:** NUMU Engineering Team  
**Scope:** Actionable checklist for linking NUMU NestJS with Judge0 CE  

---

## Pre-Requisites & Status Classification Legend

- `[x] VERIFIED / COMPLETED` — Validated and operational in current environment.
- `[ ] ACTION REQUIRED` — Task planned for future scalable phases (Level 2/3).
- `[ ] PRODUCTION GATE` — Required prior to production deployment.

---

## 1. Engine Baseline Verification
- [x] **`VERIFIED`** Judge0 CE v1.13.1 deployed and running locally via Docker Compose.
- [x] **`VERIFIED`** Local API endpoint operational at `http://127.0.0.1:2358`.
- [x] **`VERIFIED`** Redis 7.2.4 and PostgreSQL 16.2 internal services healthy.
- [x] **`VERIFIED`** 12/12 Automated execution tests passed (Phase 4C report signed).
- [x] **`VERIFIED`** WSL 2 cgroup v2 sandbox compatibility validated (`setrlimit` flags enabled).
- [x] **`VERIFIED`** Base64 payload encoding standard established.

---

## 2. NUMU Monorepo Audit (Phase 4D.1 - Completed)
- [x] **`COMPLETED`** Inspected `NUMMU/apps/api` for submission controllers, services, and DTOs.
- [x] **`COMPLETED`** Discovered existing `ExecutionProvider` interface (`runSingle`, `submitBatch`, `getBatchResults`) in `modules/submissions/providers/`.
- [x] **`COMPLETED`** Audited Prisma schema (`packages/database/prisma/schema.prisma`): `Submission` model with `judge0Tokens String[]`, `SubmissionStatus`, `SubmissionVerdict`, and `ProblemTestCase` already modeled.
- [x] **`COMPLETED`** Confirmed JWT authentication guards and user ID context.
- [x] **`COMPLETED`** Authored Level 1 Architecture Blueprint in `docs/first-level-integration-plan.md`.

---

## 3. Judge0 HTTP Adapter & Provider (Phase 4D.2 - Level 1 Completed)
- [x] **`COMPLETED`** Implemented `Judge0ExecutionProvider` in `apps/api/src/modules/submissions/providers/judge0-execution.provider.ts`.
- [x] **`COMPLETED`** Injected configuration: `JUDGE0_BASE_URL` (`http://127.0.0.1:2358`), `JUDGE0_TIMEOUT_MS`, `JUDGE0_POLL_INTERVAL_MS`, `JUDGE0_MAX_POLL_ATTEMPTS`.
- [x] **`COMPLETED`** Implemented language mapping (Python 71, C++ 54/52, Java 62, JavaScript 63, TypeScript 74).
- [x] **`COMPLETED`** Implemented Base64 payload encoding for input/source and decoding for stdout/stderr/compiler output.
- [x] **`COMPLETED`** Implemented explicit 5,000ms `AbortSignal` timeout on all Judge0 HTTP requests.
- [x] **`COMPLETED`** Updated `SubmissionsModule` with dynamic provider factory (`EXECUTION_PROVIDER=judge0` or `mock`).
- [x] **`COMPLETED`** Authored unit tests in `judge0-execution.provider.spec.ts`.

---

## 4. Durable Submission Dispatch & State Machine (Level 1 Completed)
- [x] **`COMPLETED`** Pre-dispatch persistence: `SubmissionsService` saves submission with status `QUEUED` *before* execution.
- [x] **`COMPLETED`** Atomic token persistence: `judge0Tokens: batch.tokens` saved directly on Prisma submission record.
- [x] **`COMPLETED`** Status transitions (`QUEUED` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED`).
- [ ] **`ACTION REQUIRED`** (Level 2) Distributed queue persistence via BullMQ worker jobs.

---

## 5. Asynchronous Polling Pipeline (Level 1 Completed)
- [x] **`COMPLETED`** Bounded polling implemented in `Judge0ExecutionProvider` (500ms intervals, 60 iterations / 30s deadline).
- [x] **`COMPLETED`** Status ID normalization: Status IDs 3–14 normalized to `SubmissionVerdict`.
- [x] **`COMPLETED`** Base64 outputs decoded safely into UTF-8.
- [x] **`COMPLETED`** Polling timeout safety valve returns `TIME_LIMIT_EXCEEDED` on deadline breach.
- [ ] **`ACTION REQUIRED`** (Level 2) Offload polling from API process to standalone worker threads.

---

## 6. Run & Submit Endpoints (Level 1 Completed)
- [x] **`COMPLETED`** `POST /api/submissions/run` endpoint (custom stdin, single execution, raw output returned via `runSingle`).
- [x] **`COMPLETED`** `POST /api/submissions` endpoint (official problem test cases, batch dispatch via `submitBatch`).
- [x] **`COMPLETED`** Output comparator normalizes line endings and trailing whitespace.
- [x] **`COMPLETED`** Hidden test case protection: hidden test inputs and expected outputs are never exposed to the client.

---

## 7. Future Scalability Gates (Level 2 / Level 3)
- [ ] **`ACTION REQUIRED`** BullMQ job queue integration for background asynchronous evaluation.
- [ ] **`ACTION REQUIRED`** Real-time client updates via Server-Sent Events (SSE) or WebSockets.
- [ ] **`ACTION REQUIRED`** Pre-compilation caching of identical code submissions.
- [ ] **`ACTION REQUIRED`** Distributed load balancing across multiple Judge0 container clusters.

---

## 8. Production Deployment & Security Gates
- [ ] **`PRODUCTION GATE`** Deploy Judge0 on private VPC subnet with zero public internet exposure.
- [ ] **`PRODUCTION GATE`** Configure strong `AUTH_TOKEN` in `judge0.conf` and `JUDGE0_AUTH_TOKEN` in NestJS secrets.
- [ ] **`PRODUCTION GATE`** Enforce user submission rate limits (e.g. 5 submissions/min) in NestJS.
- [ ] **`PRODUCTION GATE`** Enable internal TLS / HTTPS between NestJS and Judge0.
- [ ] **`PRODUCTION GATE`** Set up log redaction to prevent leaking user source code or credentials into log aggregators.
