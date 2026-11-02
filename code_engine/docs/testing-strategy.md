# Testing Strategy & Integration Test Specifications

**Document Version:** 1.0.0  
**Phase:** Phase 4D — Integration Readiness  
**Target:** NUMU NestJS Integration Test Suite  
**Status:** PROPOSED TEST SPECIFICATIONS (PLANNED FOR PHASE 4D EXECUTION)  

---

## 1. Testing Framework & Philosophy

The testing strategy verifies the contract, reliability, and security of the integration between NUMU's NestJS backend and Judge0 CE v1.13.1.

### Evidence & Verification Standard
- **Historical Engine Baseline:** The 12 local Judge0 CE execution tests executed in Phase 4C are **VERIFIED (12/12 PASSED)** as documented in `reports/phase-4c-report.md`.
- **Future NUMU Integration Tests:** All test scenarios defined in this document represent the **PROPOSED** integration test suite to be executed when the NestJS integration module is implemented. None of these tests are claimed as passed prior to actual implementation.

```
+--------------------------------------------------------------------------------------------------+
|                                  FOUR TEST SUITE CATEGORIES                                      |
|                                                                                                  |
|  1. CONNECTIVITY & HEALTH (CH-01 .. CH-03): Engine reachability, discovery & timeout bounds.     |
|  2. COMPILER & SANDBOX (CS-01 .. CS-08): Toolchain execution, resource limits & exit codes.      |
|  3. NUMU BUSINESS LOGIC (NB-01 .. NB-10): Auth, Run vs Submit, hidden tests & verdict synthesis. |
|  4. RELIABILITY & RESILIENCE (RR-01 .. RR-05): Fault injection, queue overflow & recovery.       |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Test Suite Specifications

### Category 1: Connectivity & Engine Health

| Test ID | Test Scenario | Setup | Action | Expected Result | Required Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **CH-01** | Language Discovery & Probe | Judge0 containers running on `127.0.0.1:2358`. | Send `GET /languages`. | HTTP 200; array contains Python 3 (`71`) and C++ (`52`/`54`). | Response JSON body logged with HTTP 200. | **PROPOSED** |
| **CH-02** | Engine Unreachable Fallback | Judge0 stopped via `docker compose stop server`. | NestJS sends submission request. | NestJS catches `ECONNREFUSED`, retries boundedly, marks submission `SYSTEM_ERROR`. | NestJS error log showing graceful catch; HTTP 503 to client. | **PROPOSED** |
| **CH-03** | Request Timeout Abort | Network latency injected or server paused. | Outgoing HTTP request exceeds 5,000ms. | NestJS `AbortSignal` fires; request aborted; submission marked `TIMEOUT`. | Axios/Fetch AbortError log; socket closed. | **PROPOSED** |

---

### Category 2: Compiler & Sandbox Execution Tests

*Note: These scenarios mirror the underlying capabilities proven during Phase 4C (T01–T12) and will be run via the NestJS adapter.*

| Test ID | Test Scenario | Language & Input | Action | Expected Result | Required Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **CS-01** | Python Hello World | Python 3 (`71`), code: `print("Hello from NUMU")`. | Async dispatch (`wait=false`) + poll. | Final status `Accepted (3)`; stdout matches `Hello from NUMU\n`. | Judge0 result JSON with status ID 3 and decoded stdout. | **PROPOSED** |
| **CS-02** | C++ Compilation & Stdin | C++ GCC 9 (`54`), reads two ints and prints sum. | Stdin: `10 20`. | Compiles without warning; status `Accepted (3)`; stdout `30`. | Judge0 result with `exit_code: 0` and stdout `30`. | **PROPOSED** |
| **CS-03** | C++ Compilation Error | C++ GCC 9 (`54`), syntax error (`missing semicolon`). | Dispatch and poll. | Status `Compilation Error (6)`; `compile_output` contains compiler diagnostic. | `compile_output` captured in response; `status.id == 6`. | **PROPOSED** |
| **CS-04** | Python Runtime Exception | Python 3 (`71`), `1 / 0`. | Dispatch and poll. | Status `Runtime Error (NZEC) (11)`; stderr contains `ZeroDivisionError`. | `status.id == 11`; stderr captured. | **PROPOSED** |
| **CS-05** | Time Limit Exceeded (TLE) | Python 3 (`71`), infinite `while True: pass`. | `cpu_time_limit: 1.0`. | Sandbox SIGXCPU/SIGKILL halts process at 1.0s; status `Time Limit Exceeded (5)`. | `status.id == 5`; execution time <= 2.0s. | **PROPOSED** |
| **CS-06** | Memory Limit Containment | Python 3 (`71`), array allocation exceeding 128MB. | `memory_limit: 128000`. | POSIX rlimit aborts allocation; status `Runtime Error (11)` or `Internal Error`. | Container remains healthy; memory constrained. | **PROPOSED** |
| **CS-07** | Consecutive Submissions | Python 3 (`71`), 3 identical submissions in sequence. | Dispatch 3 jobs sequentially. | All 3 return separate tokens; all complete with `Accepted (3)`. | 3 distinct tokens with matching outputs. | **PROPOSED** |
| **CS-08** | Multi-tenant Worker Recovery | C++ compilation error followed immediately by clean Python job. | Send CE job, then clean job. | First returns `CE (6)`; second returns `Accepted (3)` without worker hanging. | Worker logs confirm clean isolate sandbox teardown. | **PROPOSED** |

---

### Category 3: NUMU Business Logic & Platform Tests

| Test ID | Test Scenario | Setup | Action | Expected Result | Required Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **NB-01** | Unauthorized Submission Rejection | Unauthenticated client (no JWT). | `POST /api/submissions`. | NestJS rejects with `401 Unauthorized`; no Judge0 calls made. | HTTP 401 response; zero Judge0 tokens created. | **PROPOSED** |
| **NB-02** | Unsupported Language Rejection | Request specifies `language: "fortran"`. | Submit to NUMU API. | NestJS rejects with `400 Bad Request: Unsupported language`. | HTTP 400 response with validation message. | **PROPOSED** |
| **NB-03** | Code Size Ceiling Rejection | Payload contains 100 KB source code. | Submit to NUMU API. | NestJS rejects with `413 Payload Too Large` (max 64 KB). | HTTP 413 response; zero Judge0 traffic. | **PROPOSED** |
| **NB-04** | Run Mode with Custom Stdin | User submits two-sum code with custom input `5 7`. | Mode = `RUN`. | Returns execution stdout `12`; no problem verdict awarded; hidden tests not run. | API response includes `execution: { stdout: "12" }`, no verdict. | **PROPOSED** |
| **NB-05** | Submit Mode Full Acceptance | Correct two-sum solution submitted. | Mode = `SUBMIT`. | All 10 problem test cases executed; comparator matches 10/10; verdict `ACCEPTED`. | Submission record updated: `verdict: "ACCEPTED"`, `passedTestCases: 10`. | **PROPOSED** |
| **NB-06** | Submit Mode Partial Failure | Solution fails test case 4 (logic error). | Mode = `SUBMIT`. | Tests 1–3 pass; test 4 fails; execution halts; verdict `WRONG_ANSWER`. | Record: `verdict: "WRONG_ANSWER"`, `passedTestCases: 3`. | **PROPOSED** |
| **NB-07** | Hidden Test Protection | User inspects Submit response payload. | Intercept network response. | Hidden test case inputs and expected outputs are completely absent. | Response JSON contains only counts and pass/fail booleans for hidden tests. | **PROPOSED** |
| **NB-08** | Submission History Record | Successful submission completed. | `GET /api/submissions/history`. | Submission record present with language, execution time, memory, and verdict. | Database query returns complete submission row. | **PROPOSED** |
| **NB-09** | Concurrent User Submissions | 5 simulated concurrent users submit jobs simultaneously. | Parallel POST requests. | All 5 queued; all 5 receive unique tokens and complete independently. | Database shows 5 distinct records all reaching terminal state. | **PROPOSED** |
| **NB-10** | Duplicate Dispatch Prevention | Network latency simulation causing client double-click. | Send duplicate request with identical idempotency token within 2 seconds. | NestJS returns existing submission record; only 1 job enqueued to Judge0. | Exactly 1 Judge0 token created. | **PROPOSED** |

---

### Category 4: Reliability & Resilience Tests

| Test ID | Test Scenario | Setup | Action | Expected Result | Required Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **RR-01** | Queue Full Schedular Backoff | Redis flooded with 100 dummy jobs. | NestJS attempts to dispatch submission. | Judge0 responds 429/503; NestJS applies exponential backoff before failing gracefully. | NestJS retry logs; client receives `429 System Busy`. | **PROPOSED** |
| **RR-02** | Polling Deadline Expiration | Worker intentionally stopped after job enqueued. | NestJS polls for 30s (60 attempts). | Polling loop terminates; submission marked `POLLING_TIMEOUT`; worker released. | Submission state updated to `POLLING_TIMEOUT`. | **PROPOSED** |
| **RR-03** | Database Drop After Token Received | DB disconnect injected immediately after Judge0 returns token. | Dispatch job to Judge0. | Token and submissionId logged to fallback recovery log; re-synced on DB reconnect. | Emergency log file contains `[ORPHAN_TOKEN]` entry. | **PROPOSED** |
| **RR-04** | Malformed Response Resilience | Proxy returns non-JSON HTML error page. | Retrieve submission result. | NestJS JSON parser catches error; marks submission `SYSTEM_ERROR` without crashing. | Unhandled rejection prevented; error logged cleanly. | **PROPOSED** |
| **RR-05** | Post-Crash Worker Reconciliation | Simulate NestJS crash during active polling; restart NestJS. | Boot up NestJS server. | Startup sweep identifies lingering `PROCESSING` submissions and resumes polling. | Startup log shows `Recovered 1 pending submission`. | **PROPOSED** |
