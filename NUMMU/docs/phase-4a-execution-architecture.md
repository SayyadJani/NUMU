# NUMU Phase 4A — Code Execution Architecture & Judge0 Integration

## 1. Executive Summary

Executing untrusted user-submitted code inside the main application process (NestJS) is a catastrophic security vulnerability that can cause server compromise, resource starvation, and data exfiltration. 

To ensure complete process isolation, NUMU adopts an **out-of-process sandbox architecture** using **Judge0 Community Edition**. The application server delegates code execution over an internal network to isolated worker containers running Linux cgroups and isolated namespaces, receiving only sanitized standard outputs, execution timings, and verdicts.

---

## 2. Execution Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                  │
│             Next.js 15 App Router Workspace (Monaco Editor)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             BACKEND API                                │
│                   NestJS 11 Application Monolith                       │
│                                                                        │
│  ┌──────────────────────┐              ┌────────────────────────────┐  │
│  │ SubmissionsController│              │     SubmissionsService     │  │
│  │ (Auth, DTO, Quotas)  │─────────────►│ (DB Transaction, Verdicts) │  │
│  └──────────────────────┘              └─────────────┬──────────────┘  │
│                                                      │                 │
│                                                      ▼                 │
│                                        ┌────────────────────────────┐  │
│                                        │  ExecutionProvider (IFace) │  │
│                                        └─────────────┬──────────────┘  │
└──────────────────────────────────────────────────────┼─────────────────┘
                                                       │
                           ┌───────────────────────────┴───────────────────────────┐
                           │ (In Development/Test)                                 │ (In Production/Local Compose)
                           ▼                                                       ▼
            ┌─────────────────────────────┐                         ┌─────────────────────────────┐
            │    MockExecutionProvider    │                         │    Judge0ExecutionAdapter   │
            │  (Deterministic Simulation) │                         │  (HTTP REST Client / Judge0)│
            └─────────────────────────────┘                         └──────────────┬──────────────┘
                                                                                   │
                                                                                   ▼
                                                                    ┌─────────────────────────────┐
                                                                    │    Judge0 Community Edition │
                                                                    │  (Docker Sandbox Container) │
                                                                    │  - Isolated cgroups v2      │
                                                                    │  - Memory / CPU quotas      │
                                                                    │  - Network disabled         │
                                                                    └─────────────────────────────┘
```

---

## 3. The `ExecutionProvider` Abstraction

To avoid tight coupling between the NestJS business logic and Judge0 API schemas, an `ExecutionProvider` interface isolates execution operations:

```typescript
export interface ExecutionJob {
  sourceCode: string;
  language: string; // 'python' | 'javascript' | 'typescript' | 'cpp' | 'java'
  stdin: string;
  expectedOutput?: string;
  cpuTimeLimitSec: number;
  memoryLimitKb: number;
}

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  runtimeMs: number | null;
  memoryKb: number | null;
  statusId: number; // Judge0 standard status ID
  verdict: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'INTERNAL_ERROR';
}

export interface ExecutionProvider {
  /**
   * Executes a single test case synchronously or fast-polled (used for 'Run Code')
   */
  runSingle(job: ExecutionJob): Promise<ExecutionResult>;

  /**
   * Submits a batch of test cases for asynchronous execution (used for 'Submit Code')
   */
  submitBatch(jobs: ExecutionJob[]): Promise<{ tokens: string[] }>;

  /**
   * Retrieves results for a previously submitted batch of tokens
   */
  getBatchResults(tokens: string[]): Promise<{ isComplete: boolean; results: ExecutionResult[] }>;
}
```

### Benefits of the Abstraction:
1. **Deterministic Unit Testing**: Unit and E2E tests run with `MockExecutionProvider` without booting external Docker containers or hitting internet endpoints.
2. **Vendor Independence**: If the platform migrates to another execution engine (e.g., AWS Lambda, Piston, or a proprietary microVM runner), zero changes are required in `SubmissionsService`.

---

## 4. Judge0 Integration Specifications

### 4.1 Programming Language Mappings

Judge0 identifies compilers and runtimes by numerical IDs. The table below outlines the mappings for NUMU's supported languages:

| Language Identifier | Runtime / Compiler | Judge0 CE Language ID | File Name Used |
|---|---|---|---|
| `python` | Python (3.11.2 / 3.12) | **71** | `solution.py` |
| `javascript` | Node.js (v18 / v20) | **63** | `solution.js` |
| `typescript` | TypeScript (v5.0.3) | **74** | `solution.ts` |
| `cpp` | GCC 9.2.0 / Clang (C++17) | **54** | `solution.cpp` |
| `java` | OpenJDK 13 / 17 | **62** | `Main.java` |

### 4.2 Submission Mode: Batch vs Single
- **Run Code**: Uses single submission (`POST /submissions?wait=true`) with base64 encoding to execute against the active sample test case or custom input in under 2 seconds.
- **Submit Code**: Uses batch submission (`POST /submissions/batch?base64_encoded=true`) to evaluate all visible and hidden test cases simultaneously. The backend receives a list of job tokens, periodically polls `GET /submissions/batch?tokens=...`, and computes the combined verdict once all tokens terminate.

### 4.3 Base64 Encoding
All source code, stdin, stdout, and compile outputs transferred to and from Judge0 must use **Base64 encoding** (`base64_encoded=true`). This prevents data truncation or encoding corruption when dealing with whitespace, special symbols (`<`, `>`, `&`), or binary characters.

---

## 5. Submission Lifecycle State Machine

```
               [ User Clicks Submit ]
                         │
                         ▼
                     ┌───────┐
                     │QUEUED │
                     └───┬───┘
                         │
            [ Dispatched to Judge0 Batch ]
                         │
                         ▼
                   ┌──────────┐
                   │PROCESSING│
                   └─────┬────┘
                         │
             [ All Test Cases Complete ]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   [Any Failure?]                   [All Match?]
        │                                 │
        ▼                                 ▼
┌──────────────────────────────┐    ┌──────────┐
│ Verdict:                     │    │ Verdict: │
│ - WRONG_ANSWER               │    │ ACCEPTED │
│ - COMPILATION_ERROR          │    └──────────┘
│ - TIME_LIMIT_EXCEEDED        │
│ - MEMORY_LIMIT_EXCEEDED      │
│ - RUNTIME_ERROR              │
└──────────────────────────────┘
```

### 5.1 Terminal Verdict Priority Order
When evaluating multiple test cases for a single submission, the terminal verdict is chosen according to strict priority:
1. **`COMPILATION_ERROR`**: If compilation fails, no tests run.
2. **`INTERNAL_ERROR`**: If Judge0 infrastructure or sandbox fails.
3. **`TIME_LIMIT_EXCEEDED`**: If any test case exceeds the CPU time limit.
4. **`MEMORY_LIMIT_EXCEEDED`**: If any test case exceeds memory limit.
5. **`RUNTIME_ERROR`**: If any test case crashes with a non-zero exit code.
6. **`WRONG_ANSWER`**: If code runs without errors but stdout does not match expected output.
7. **`ACCEPTED`**: Only if **every single test case** matches expected output within time and memory constraints.

---

## 6. Background Queue vs In-Process Asynchronous Dispatch

For Phase 4, two dispatch strategies were evaluated:

| Criterion | In-Process Async Dispatch (`setImmediate` / Promises + DB Status) | External Queue (Redis + BullMQ) |
|---|---|---|
| **Architectural Complexity** | Low — Uses existing PostgreSQL and NestJS services. | Medium — Requires Redis container, queue module, and worker process. |
| **Durability on Server Crash** | Medium — If server restarts during job, `status = 'PROCESSING'` can be marked `FAILED` or retried via startup reaper. | High — Jobs remain safely queued in Redis persistence. |
| **Worker Concurrency** | Bounded by NestJS Node event loop (sufficient for <50 concurrent users). | Highly scalable across multiple worker processes. |
| **Infrastructure Overhead** | Zero additional containers beyond Judge0. | Requires adding `redis:7` to `compose.yaml`. |

### Recommendation for Initial Phase 4:
Implement the **in-process async dispatcher** backed by PostgreSQL status transitions (`QUEUED` ➔ `PROCESSING` ➔ `COMPLETED` / `FAILED`), while cleanly isolating all queue actions inside `SubmissionsQueueService`. This provides rapid developer productivity and zero unnecessary infrastructure, while enabling drop-in migration to BullMQ when production traffic dictates.
