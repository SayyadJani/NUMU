# Architecture Specification — NUMU Code Engine & Execution System

**Document Version:** 2.0.0  
**Phase:** Phase 4D — Integration Readiness & Architecture Specification  
**Status:** IMPLEMENTATION-READY PROPOSAL  
**Target Environment:** Local Windows 11 / WSL 2 / Docker Desktop (Development)  

---

## 1. System Context & Architectural Boundaries

The NUMU platform is an educational Data Structures and Algorithms (DSA) platform. Code execution is decoupled from the main platform application into an isolated execution engine: **Judge0 Community Edition (CE) v1.13.1**.

### Strict System Boundaries

```
+---------------------------------------------------------------------------------------------------+
|                                     NUMU APPLICATION BOUNDARY                                     |
|                                                                                                   |
|   +-----------------------+              +----------------------------------------------------+   |
|   |    Next.js Client     |              |                 NestJS API Server                  |   |
|   |  - Monaco Code Editor | <==========> |  - Authentication & Authorization                  |   |
|   |  - Run / Submit UI    |  HTTPS/WSS   |  - Problem & Hidden Test Case Catalog             |   |
|   |  - Verdict Display    |              |  - Submission Lifecycle & Persistence (Postgres)   |   |
|   +-----------------------+              |  - Test Case Evaluator & Verdict Engine            |   |
|                                          |  - Judge0 HTTP Adapter & Polling Dispatcher        |   |
|                                          +----------------------------------------------------+   |
+-------------------------------------------------------------------|-------------------------------+
                                                                    |
                                                     HTTP REST API  | (Loopback: 127.0.0.1:2358)
                                                     Private Link   | (Base64 Encoded Payloads)
                                                                    v
+---------------------------------------------------------------------------------------------------+
|                                  JUDGE0 CE INFRASTRUCTURE BOUNDARY                                |
|                                       (Isolated Docker Stack)                                     |
|                                                                                                   |
|   +------------------------------------+              +---------------------------------------+   |
|   |     Judge0 API Server (server)     |              |     Judge0 Resque Workers (workers)   |   |
|   |  - Token generator (UUIDv4)        |              |  - Dequeue jobs from Redis            |   |
|   |  - Enqueue jobs to Redis           |              |  - Isolate Linux Sandbox Executor     |   |
|   |  - Ephemeral submission cache      |              |  - POSIX limit enforcement (RLIMIT)   |   |
|   +-----------------+------------------+              |  - Compile & Runtime output capture   |   |
|                     |                                 +-------------------+-------------------+   |
|                     |                                                     |                       |
|         +-----------+-----------+                             +-----------+-----------+           |
|         |                       |                             |                       |           |
|         v                       v                             v                       v           |
|  +--------------+       +---------------+              +--------------+       +---------------+   |
|  | Redis 7.2.4  |       | PostgreSQL 16 |              | Redis 7.2.4  |       | PostgreSQL 16 |   |
|  | (Job Queue)  |       | (Judge0 Store)|              | (Job Queue)  |       | (Judge0 Store)|   |
|  +--------------+       +---------------+              +--------------+       +---------------+   |
+---------------------------------------------------------------------------------------------------+
```

### Decoupling Principles

1. **Physical & Repository Decoupling:**
   - The execution engine files reside exclusively inside `code_engine/` (`judge0/`, `scripts/`, `docs/`, `reports/`).
   - The application codebase resides in the NUMU Turborepo (`NUMMU/`).
   - The two systems never share source code, build pipelines, or monorepo packages.

2. **Network & Protocol Decoupling:**
   - Communication occurs solely over standard HTTP REST (`http://127.0.0.1:2358` locally).
   - The Judge0 API server is bound strictly to `127.0.0.1:2358` on the host, preventing external access.
   - Judge0 has no knowledge of NUMU users, problem IDs, submission history, or test suites.

3. **Database Decoupling:**
   - NUMU maintains its own relational database (application users, problems, test cases, submission records, verdicts).
   - Judge0 maintains its own independent PostgreSQL database (`postgres:16.2`) and Redis instance (`redis:7.2.4`) strictly for its internal task queue and execution logs.
   - Under no circumstances does NUMU query Judge0's PostgreSQL database directly, nor does Judge0 query NUMU's database.

---

## 2. Component Roles & Responsibilities

| Responsibility Area | Handled By | Details |
| :--- | :--- | :--- |
| **User Authentication & Quotas** | NUMU NestJS | JWT validation, role checks, submission rate limiting (e.g., 5 submissions/min per user). |
| **Problem & Test Case Management** | NUMU NestJS | Storing problem statements, sample test cases, and secret hidden test cases. |
| **Language Selection & Validation** | NUMU NestJS | Validating requested language identifier against approved whitelist before dispatching. |
| **Submission Record Persistence** | NUMU NestJS | Persisting pending submission in NUMU DB *before* dispatching to execution engine. |
| **Untrusted Code Execution** | Judge0 CE | Compiling and executing source code inside a secure Linux `isolate` sandbox with strict memory and CPU limits. |
| **Execution Metrics Collection** | Judge0 CE | Measuring process CPU time, wall-clock time, peak memory usage, exit codes, and stdout/stderr. |
| **Test Case Output Evaluation** | NUMU NestJS | Comparing actual execution `stdout` against expected output with customizable comparison rules (trimming, whitespace, tokenization). |
| **Verdict Assignment** | NUMU NestJS | Synthesizing execution results across all test cases into a final verdict (`Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Memory Limit Exceeded`, `Runtime Error`, `Compilation Error`). |
| **Submission History & Analytics** | NUMU NestJS | Storing user attempt logs, execution metrics, pass counts, and leaderboard analytics. |

---

## 3. Separation of Concerns: Execution vs. Judging

A fundamental principle of the NUMU architecture is the strict boundary between **Code Execution** and **Problem Judging**:

```
                       [ User Source Code + Input ]
                                    |
                                    v
            +-----------------------------------------------+
            |            Judge0 Execution Engine            |
            |                                               |
            |  Goal: "Execute this binary safely and        |
            |         report resource consumption & output" |
            +-----------------------------------------------+
                                    |
            Returns: { stdout, stderr, time, memory, status }
                                    |
                                    v
            +-----------------------------------------------+
            |           NUMU Test-Case Evaluator            |
            |                                               |
            |  Goal: "Does this output satisfy the problem  |
            |         requirements for test case N?"        |
            +-----------------------------------------------+
                                    |
                                    +---> Test 1: Match (PASS)
                                    +---> Test 2: Match (PASS)
                                    +---> Test 3: Output Mismatch (FAIL -> WA)
                                    |
                                    v
                     NUMU Final Verdict: WRONG ANSWER
```

### Critical Rules
- **Judge0 returning "Accepted" (Status ID 3)** merely indicates that the user's code compiled and exited with code `0` within the allotted time and memory limits. It does **not** indicate that the DSA problem is solved.
- **Judge0's internal `expected_output` feature** is deliberately bypassed in the asynchronous architecture. NUMU manages test case comparison internally. This keeps hidden test cases securely inside NUMU's domain and allows sophisticated custom comparators (e.g., floating-point tolerance, arbitrary order comparison).

---

## 4. Operational Topology

### Local Development Topology
- **Host OS:** Windows 10/11 with WSL 2 backend.
- **NestJS Server:** Running directly on the host (Node.js) or inside a local development container.
- **Judge0 Stack:** Running via Docker Compose with 4 services (`judge0-server-1`, `judge0-workers-1`, `judge0-db-1`, `judge0-redis-1`).
- **Connection Endpoint:** `http://127.0.0.1:2358`.

### Future Containerized / Production Topology
When both NUMU and Judge0 run inside containerized environments:
- **Shared Network Bridge:** If co-located on a single host or cluster, NestJS communicates with Judge0 using the service hostname (e.g., `http://judge0-server:2358` across an internal Docker overlay or bridge network).
- **Isolated VPC / Cluster:** In production cloud environments, Judge0 resides on a dedicated, hardened execution node or cluster behind a private internal load balancer with mTLS or authorization token validation.
- **Zero Public Access:** The Judge0 port is never bound to `0.0.0.0` and is completely inaccessible from the public internet.

---

## 5. Architectural Assumptions & Inspection Requirements

| Item | Classification | Requirement for Phase 4D Implementation |
| :--- | :--- | :--- |
| **Judge0 Stack (v1.13.1)** | `VERIFIED` | Stack verified and operational at `http://127.0.0.1:2358` with 12 passing test cases. |
| **Asynchronous Polling Pattern** | `PROPOSED` | NUMU NestJS backend will use bounded polling (`wait=false`) via background worker/job queue. |
| **NUMU Execution Provider Abstraction** | `REQUIRES NUMU REPOSITORY INSPECTION` | Must inspect `NUMMU/` to determine if an execution provider interface (e.g., `IExecutionEngine`) or BullMQ queue already exists. |
| **NUMU Database Schema & ORM** | `REQUIRES NUMU REPOSITORY INSPECTION` | Must inspect Prisma or TypeORM schema in `NUMMU/` to identify exact submission entity structure. |
| **Production Network & TLS** | `PRODUCTION REQUIREMENT` | Production Judge0 instance must enforce token authentication and reside inside an isolated private subnet. |
