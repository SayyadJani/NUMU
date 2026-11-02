# NUMU Integration Plan — Phase 4D Roadmap & Implementation Guide

**Document Version:** 1.0.0  
**Phase:** Phase 4D — Implementation Roadmap & Architectural Blueprint  
**Target:** NUMU Monorepo (`NUMMU/`) NestJS API Application  
**Execution Engine:** Judge0 Community Edition v1.13.1 (`code_engine/`)  

---

## 1. Executive Implementation Strategy

This roadmap details the seven execution stages required to link the NUMU platform with the verified Judge0 execution engine. 

> [!IMPORTANT]
> **Strict Implementation Guardrail:**  
> In accordance with Phase 4D boundaries, **no code inside `NUMMU/` is modified during this planning phase**. All architectural decisions, DTO proposals, and interface contracts documented below are prepared for future implementation following a comprehensive inspection of the NUMU monorepo.

---

## 2. Seven-Stage Implementation Roadmap

```
Stage 4D.1: NUMU Repository Audit & Abstraction Discovery
     |
     v
Stage 4D.2: Judge0 HTTP Execution Adapter Implementation
     |
     v
Stage 4D.3: Durable Submission Dispatch & Persistence
     |
     v
Stage 4D.4: Asynchronous Polling Worker & Result Pipeline
     |
     v
Stage 4D.5: Run & Submit Endpoints / Controller Integration
     |
     v
Stage 4D.6: Test Case Evaluator & Comparator Engine
     |
     v
Stage 4D.7: Automated Test Suite & Controlled Rollout
```

---

### Stage 4D.1: NUMU Repository Audit
**Objective:** Inspect the actual structure, conventions, and existing implementations inside `NUMMU/` to prevent redundant abstractions or breaking changes.

#### Specific Inspection Targets:
1. **NestJS Module Structure:** Identify where submission logic currently lives (e.g., `apps/api/src/modules/submissions/` or `apps/api/src/modules/execution/`).
2. **Execution Provider Abstraction:** Check if an existing interface exists (e.g., `ExecutionProvider`, `IExecutionEngine`, or `CodeRunnerService`). If present, implement the Judge0 adapter against this existing interface rather than creating a competing one.
3. **Database ORM & Migrations:** Inspect `prisma/schema.prisma` or TypeORM entities to determine the existing submission model, status enums, foreign keys, and indexes.
4. **Queue Infrastructure:** Check if BullMQ, Redis, or an in-memory queue is already initialized in `apps/api/`.
5. **Authentication Guards:** Identify the JWT authentication strategy (`@UseGuards(JwtAuthGuard)`) and how `userId` is extracted from requests.
6. **Problem & Test Case Model:** Determine how test cases are structured (e.g., whether inputs and outputs are stored directly in PostgreSQL or referenced via S3/storage buckets).

---

### Stage 4D.2: Judge0 HTTP Adapter
**Objective:** Construct a dedicated, type-safe NestJS service to handle low-level communication with the Judge0 REST API.

#### Core Responsibilities:
- Manage the configured base URL (`process.env.JUDGE0_BASE_URL`).
- Translate NUMU language slugs into Judge0 language IDs via `SUPPORTED_LANGUAGES`.
- Perform Base64 encoding of `source_code` and `stdin` before dispatch.
- Enforce explicit HTTP request timeouts (5,000ms via `AbortSignal`).
- Handle low-level HTTP status codes and map network errors to internal NestJS domain exceptions.
- Provide type-safe methods: `getLanguages()`, `createSubmission(dto)`, `getSubmission(token)`.

#### Proposed Provider Interface (Subject to NUMMU Audit):
```typescript
export interface IExecutionProvider {
  ping(): Promise<boolean>;
  getAvailableLanguages(): Promise<string[]>;
  dispatchExecution(request: ExecutionDispatchDto): Promise<{ executionToken: string }>;
  checkExecutionResult(token: string): Promise<NormalizedExecutionResult>;
}
```

---

### Stage 4D.3: Durable Submission Dispatch
**Objective:** Ensure that every submission attempt is persisted in NUMU's database *prior* to dispatching to the execution engine.

#### Requirements:
1. **Pre-dispatch Record Creation:** Insert the submission row with status `QUEUED` before triggering the HTTP call.
2. **Atomic Token Persistence:** Upon receiving the HTTP 201 response from Judge0, update the submission record with `judge0Token` and status `PROCESSING`.
3. **Idempotency Safeguard:** If client retries within a short window with the same submission hash or idempotency key, return the existing pending submission rather than submitting twice to Judge0.
4. **Crash Reconciliation:** A background startup routine scans for records stuck in `DISPATCHING` or `PROCESSING` and reconciles their states.

---

### Stage 4D.4: Asynchronous Execution & Result Retrieval
**Objective:** Retrieve execution results without holding open client HTTP connections.

#### Evaluation of Polling vs. Callbacks:
- **Callback / Webhook Approach:** Judge0 supports a `callback_url` parameter. However, in local development on Windows, containers running inside Docker Desktop / WSL 2 cannot reliably resolve or reach the host machine loopback (`127.0.0.1`) without complex host networking or reverse proxies.
- **Decision:** **Bounded Asynchronous Polling (`wait=false`) is the chosen standard.**
  - Polls `GET /submissions/{token}?base64_encoded=true` every 500ms.
  - Bounded to 60 iterations (30-second maximum duration).
  - Handles transient 5xx glitches with exponential backoff.
  - Decodes Base64 outputs cleanly into UTF-8.

---

### Stage 4D.5: Run & Submit Endpoints
**Objective:** Expose clean, validated REST endpoints on the NUMU API for the Next.js frontend.

#### Route Structure:
- `POST /api/submissions/run` — Executes user code against custom input. Returns execution stdout/stderr and resource usage.
- `POST /api/submissions/submit` — Executes user code against official problem test cases. Evaluates output and assigns verdicts.
- `GET /api/submissions/:id` — Polling or SSE endpoint for the frontend to query current submission progress.

---

### Stage 4D.6: Verdict Evaluation Engine
**Objective:** Compare execution outputs against expected problem test cases to assign final DSA verdicts.

#### Evaluation Algorithm:
1. Check Judge0 execution status. If `status_id != 3` (e.g. TLE, CE, RE), immediately adopt that status as the verdict and skip further test cases.
2. For `Accepted (3)` executions, pass actual `stdout` to the output comparator.
3. Normalize line endings (`\r\n` -> `\n`) and strip trailing whitespaces.
4. If actual output matches expected output: mark test case `PASSED`.
5. If output diverges: mark test case `WRONG_ANSWER` and record the first failing test case.
6. When all test cases pass: assign final verdict `ACCEPTED`.

---

### Stage 4D.7: Testing & Controlled Rollout
**Objective:** Validate end-to-end functionality and roll out safely.

#### Rollout Sequence:
1. **Unit & Mock Tests:** Mock Judge0 HTTP responses to test adapter, comparator, and error handling.
2. **Local End-to-End Tests:** Execute Category 1–4 integration tests against the live local Judge0 container stack (`127.0.0.1:2358`).
3. **Feature Flag Strategy:** Gate the Judge0 execution provider behind a configuration flag (`EXECUTION_PROVIDER=judge0`). This enables instant rollback to existing or mock providers if unexpected issues arise during deployment.

---

## 3. Proposed API Contracts (Illustrative Proposals)

> [!NOTE]
> The following DTOs are proposed architectural contracts. They are subject to refinement once the existing NUMU API conventions and schemas are inspected during Stage 4D.1.

### 3.1 Run Mode Contract Proposal

#### `POST /api/submissions/run`
**Request Payload:**
```json
{
  "problemId": "prob_two_sum_01",
  "language": "python",
  "sourceCode": "import sys\nlines = sys.stdin.read().split()\nif lines:\n    print(int(lines[0]) + int(lines[1]))",
  "stdin": "10 20"
}
```

**Initial Response (`202 Accepted`):**
```json
{
  "submissionId": "sub_8f29c41d",
  "status": "PROCESSING",
  "mode": "RUN"
}
```

**Completed Result (`GET /api/submissions/sub_8f29c41d`):**
```json
{
  "submissionId": "sub_8f29c41d",
  "status": "COMPLETED",
  "mode": "RUN",
  "execution": {
    "status": "ACCEPTED",
    "stdout": "30\n",
    "stderr": null,
    "compileOutput": null,
    "timeSeconds": 0.082,
    "memoryKb": 7892
  }
}
```

---

### 3.2 Submit Mode Contract Proposal

#### `POST /api/submissions/submit`
**Request Payload:**
```json
{
  "problemId": "prob_two_sum_01",
  "language": "cpp",
  "sourceCode": "#include <iostream>\nusing namespace std;\nint main() { int a, b; if (cin >> a >> b) cout << a + b << endl; return 0; }"
}
```

**Initial Response (`202 Accepted`):**
```json
{
  "submissionId": "sub_a419ef82",
  "status": "PROCESSING",
  "mode": "SUBMIT"
}
```

**Completed Result (`GET /api/submissions/sub_a419ef82`):**
```json
{
  "submissionId": "sub_a419ef82",
  "status": "COMPLETED",
  "mode": "SUBMIT",
  "verdict": "ACCEPTED",
  "passedTestCases": 12,
  "totalTestCases": 12,
  "executionSummary": {
    "maxTimeSeconds": 0.435,
    "maxMemoryKb": 4210
  },
  "publicTestResults": [
    {
      "testCaseIndex": 1,
      "passed": true,
      "input": "2 3",
      "expectedOutput": "5",
      "actualOutput": "5\n"
    }
  ]
}
```

*Note: For hidden test cases, `input`, `expectedOutput`, and `actualOutput` are omitted to protect problem integrity.*
