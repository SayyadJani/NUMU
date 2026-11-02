# NUMU Phase 4A — Testing Strategy & Operational Considerations

## 1. Executive Summary

Phase 4 testing requires verifying both deterministic business logic (DTO validation, database transactions, state machines, ownership guards) and asynchronous execution behavior (timeout handling, compilation errors, sandbox crashes).

This document establishes a **two-tier testing strategy**:
1. **Offline / Mock-Driven Tests**: Run in CI/CD without an external Judge0 container using `MockExecutionProvider`.
2. **Live Integration / E2E Tests**: Run against an isolated test database and a live Judge0 sandbox container.

---

## 2. Comprehensive Testing Matrix

| Test Category | Test Case Description | Test Type | Requires Live Judge0? | Verification Target |
|---|---|---|---|---|
| **DTO Validation** | Rejects payload exceeding 64KB | Unit | No | `SubmitCodeDto` / `ValidationPipe` |
| **DTO Validation** | Rejects unsupported language string | Unit | No | `SubmitCodeDto` (`@IsEnum`) |
| **State Machine** | Transition `QUEUED` ➔ `PROCESSING` ➔ `COMPLETED` | Unit | No | `SubmissionsService` state logic |
| **Verdict Resolution** | `WRONG_ANSWER` prioritized over subsequent tests | Unit | No | `SubmissionsService.calculateVerdict` |
| **Verdict Resolution** | Single `TIME_LIMIT_EXCEEDED` marks submission as TLE | Unit | No | `SubmissionsService.calculateVerdict` |
| **Verdict Resolution** | All tests matching marks submission as `ACCEPTED` | Unit | No | `SubmissionsService.calculateVerdict` |
| **Authorization** | Student cannot view another student's source code | Unit / Integration | No | `SubmissionsService.findById` ownership check |
| **Authorization** | Unauthenticated user cannot trigger `POST /submissions` | Integration | No | `JwtAuthGuard` |
| **Rate Limiting** | 6th submission within 1 minute returns `429 Too Many Requests` | Integration | No | `@nestjs/throttler` |
| **Hidden Case Privacy**| API response never exposes inputs of `isHidden = true` test cases | E2E | No | `SubmissionsController` response serialization |
| **Run Code (Mock)** | Sample test execution returns stdout & comparison within 100ms | E2E | No | `MockExecutionProvider` |
| **Run Code (Live)** | Python script printing "Hello" returns stdout correctly | E2E | **Yes** | `Judge0ExecutionAdapter` |
| **Submit Code (Live)**| Python two-sum solution receives `ACCEPTED` against 24 tests | E2E | **Yes** | Full pipeline |
| **Submit Code (Live)**| Python infinite loop (`while True: pass`) terminates with `TLE` | E2E | **Yes** | cgroup CPU time limit enforcement |
| **Submit Code (Live)**| C++ syntax error returns `COMPILATION_ERROR` with compiler log | E2E | **Yes** | GCC compiler error capture |
| **Submit Code (Live)**| Zero division (`1 // 0`) returns `RUNTIME_ERROR` | E2E | **Yes** | Non-zero exit code capture |
| **Frontend UI** | Editor switches boilerplate cleanly across 5 languages | Component / E2E | No | Next.js Problem Workspace |
| **Frontend UI** | Run button triggers running state and updates console drawer | Component / E2E | No | Next.js Problem Workspace |
| **Frontend UI** | Submit button shows spinner and polls until terminal verdict | Component / E2E | No | Next.js Polling hook |

---

## 3. Operational Considerations & Reliability

### 3.1 Database Indexing & Query Optimization
Submissions queries follow two high-frequency access patterns:
1. **User History for a Problem**:
   ```sql
   SELECT * FROM submissions 
   WHERE user_id = $1 AND problem_id = $2 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
   *Optimized with*: `@@index([userId, problemId, createdAt(sort: Desc)])`

2. **Global Problem Verdict Stats**:
   ```sql
   SELECT verdict, COUNT(*) FROM submissions 
   WHERE problem_id = $1 
   GROUP BY verdict;
   ```
   *Optimized with*: `@@index([problemId, verdict])`

3. **Pending Job Polling**:
   ```sql
   SELECT * FROM submissions 
   WHERE status IN ('QUEUED', 'PROCESSING') 
   ORDER BY created_at ASC;
   ```
   *Optimized with*: `@@index([status])`

### 3.2 Health Checks & Observability
- Add Judge0 connectivity probe to `apps/api/src/modules/health/health.controller.ts`:
  - Pings `GET ${JUDGE0_API_URL}/about` or `GET ${JUDGE0_API_URL}/health_check`.
  - Exposes `judge0: 'up'` or `'down'` in `/api/v1/health` response.

### 3.3 Data Retention & Pruning Policy
1. **Ephemeral Run Data**: Never stored in the database.
2. **Old Failed/Error Submissions**: Retain all metadata (`runtime`, `memory`, `verdict`), but consider truncating compiler outputs (`compileError`) and standard errors older than 90 days to conserve database storage.
3. **Source Code**: Stored as `TEXT` (average 1KB per submission). 100,000 submissions consume approximately 100MB of storage, well within PostgreSQL capacity.
