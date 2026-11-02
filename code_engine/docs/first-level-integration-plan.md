# First-Level Judge0 Integration Plan (Phase 4D.1 - Level 1)

**Document Version:** 1.0.0  
**Status:** IMPLEMENTATION BLUEPRINT  
**Target Architecture:** NUMU NestJS Backend (`NUMMU/apps/api`)  
**Execution Engine:** Judge0 Community Edition v1.13.1 (`http://127.0.0.1:2358`)  

---

## 1. Executive Vision: Phased Scalability

To deliver immediate value while maintaining long-term architectural scalability, NUMU adopts a phased integration model:

```
+--------------------------------------------------------------------------------------------------+
|                                    PHASED INTEGRATION MODEL                                      |
|                                                                                                  |
|  LEVEL 1 (Current Scope — Fast, Robust, Direct Execution):                                       |
|    - Implement Judge0ExecutionProvider adhering to existing ExecutionProvider interface.        |
|    - Direct HTTP asynchronous dispatch (wait=false) with bounded async polling.                  |
|    - Server-side language slug translation (Python 71, C++ 54, Java 62, JS 63, TS 74).           |
|    - Base64 payload encoding standard for bulletproof Unicode & diagnostic handling.             |
|    - Pluggable via NestJS Dependency Injection with fallback to MockExecutionProvider.           |
|                                                                                                  |
|  LEVEL 2 (Future Scalability — Distributed Queuing):                                             |
|    - Offload submission dispatch to background BullMQ / Redis worker threads.                    |
|    - Real-time client updates via Server-Sent Events (SSE) or WebSockets.                        |
|    - Multi-worker load balancing across multiple Judge0 instances.                               |
|                                                                                                  |
|  LEVEL 3 (Enterprise Scale — Advanced Optimization):                                             |
|    - Pre-compilation caching of identical code hashes.                                           |
|    - Webhook callback listener (in cloud VPC environments with reachable IP).                   |
|    - Dynamic concurrency throttling based on Judge0 queue depth.                                 |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Level 1 Architecture & Component Design

### 2.1 The Provider Abstraction
The NUMU NestJS backend already exposes an `ExecutionProvider` interface in `apps/api/src/modules/submissions/providers/execution-provider.interface.ts`:

```typescript
export interface ExecutionProvider {
  runSingle(job: ExecutionJob): Promise<ExecutionResult>;
  submitBatch(jobs: ExecutionJob[]): Promise<{ tokens: string[] }>;
  getBatchResults(tokens: string[]): Promise<{ isComplete: boolean; results: ExecutionResult[] }>;
}
```

In Level 1, we implement `Judge0ExecutionProvider` implementing this exact interface. This means **zero breaking changes** to `SubmissionsService`, `SubmissionsController`, or the Prisma database schema.

---

### 2.2 Sequence Flow for Level 1 Integration

#### Single Run Flow (`runSingle`):
```
Client ---> SubmissionsController ---> SubmissionsService
                                              |
                                              v
                                   Judge0ExecutionProvider
                                              |
                     1. POST /submissions?base64_encoded=true&wait=false
                                              |
                                              v  Returns { token }
                                   [ Bounded Polling Loop ]
                                   GET /submissions/{token} (every 500ms, max 30s)
                                              |
                                              v  Status >= 3 (Terminal)
                                   Decode Base64 stdout/stderr
                                   Map Status ID -> SubmissionVerdict
                                              |
                                              v
Client <--- JSON { status: "COMPLETED", verdict: "ACCEPTED", stdout: "..." }
```

#### Batch Submit Flow (`submitBatch` + `getBatchResults`):
```
Client ---> SubmissionsController ---> SubmissionsService
                                              |
                                              v
                                   Judge0ExecutionProvider
                                              |
                     1. Dispatches N test cases to POST /submissions
                        Returns array of N tokens: ["tok_1", "tok_2", ... "tok_N"]
                                              |
                                              v
                     2. getBatchResults(tokens):
                        Polls each token until terminal state
                        Returns ExecutionResult[] for all test cases
                                              |
                                              v
                                   SubmissionsService
                                   Calculates aggregate terminal verdict
                                   Persists passedTests, runtimeMs, tokens in PostgreSQL
                                              |
                                              v
Client <--- JSON { status: "COMPLETED", verdict: "ACCEPTED", testsPassed: 10, totalTests: 10 }
```

---

## 3. Language Mapping Table (Level 1)

`Judge0ExecutionProvider` translates incoming NUMU language slugs into Judge0 CE v1.13.1 language IDs:

| NUMU Language Slug | Judge0 ID | Runtime & Version | Default Source File |
| :--- | :---: | :--- | :--- |
| `python` | **71** | Python 3.8.1 | `main.py` |
| `cpp` | **54** | C++ (GCC 9.2.0) | `main.cpp` |
| `java` | **62** | Java (OpenJDK 13.0.1) | `Main.java` |
| `javascript` | **63** | Node.js 12.14.0 | `solution.js` |
| `typescript` | **74** | TypeScript 3.7.4 | `solution.ts` |

---

## 4. Status Normalization Logic

Judge0 numerical status IDs are mapped directly into NUMU's `SubmissionVerdict` enum:

| Judge0 Status ID | Judge0 Description | NUMU `SubmissionVerdict` |
| :---: | :--- | :--- |
| **3** | Accepted | `ACCEPTED` (or `WRONG_ANSWER` if output diverges) |
| **4** | Wrong Answer | `WRONG_ANSWER` |
| **5** | Time Limit Exceeded | `TIME_LIMIT_EXCEEDED` |
| **6** | Compilation Error | `COMPILATION_ERROR` |
| **7..10** | Runtime Error (Signals) | `RUNTIME_ERROR` |
| **11** | Runtime Error (NZEC) | `RUNTIME_ERROR` |
| **12** | Runtime Error (Other) | `RUNTIME_ERROR` |
| **13** | Internal Error | `INTERNAL_ERROR` |
| **14** | Exec Format Error | `COMPILATION_ERROR` |

---

## 5. Configuration & Environment Flags

In `apps/api/.env`:
```env
# Execution Provider Settings
EXECUTION_PROVIDER=judge0
JUDGE0_BASE_URL=http://127.0.0.1:2358
JUDGE0_AUTH_TOKEN=
JUDGE0_TIMEOUT_MS=5000
JUDGE0_POLL_INTERVAL_MS=500
JUDGE0_MAX_POLL_ATTEMPTS=60
```

---

## 6. Implementation Action Plan

1. **Step 1:** Implement `Judge0ExecutionProvider` in `apps/api/src/modules/submissions/providers/judge0-execution.provider.ts`.
2. **Step 2:** Update `SubmissionsModule` in `apps/api/src/modules/submissions/submissions.module.ts` to inject `Judge0ExecutionProvider` or `MockExecutionProvider` dynamically based on `EXECUTION_PROVIDER`.
3. **Step 3:** Update `.env` and `.env.example` with Judge0 configuration keys.
4. **Step 4:** Write unit tests in `judge0-execution.provider.spec.ts`.
5. **Step 5:** Run tests and verify build / typecheck.
