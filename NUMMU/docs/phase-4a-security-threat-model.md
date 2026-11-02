# NUMU Phase 4A — Security Threat Model: Untrusted Code Execution

## 1. Executive Summary

Executing untrusted, user-submitted code is one of the highest-risk operations a software platform can undertake. An adversary could attempt to steal database credentials, mount Denial of Service (DoS) attacks, exfiltrate hidden test cases, consume infinite CPU/memory resources, or gain root shell access to the host machine.

This document conducts a rigorous threat model review across application, network, container, and sandbox layers, providing mitigations and verification criteria for Phase 4.

---

## 2. Comprehensive Security Threat Matrix

| Threat Category | Specific Threat Scenario | Potential Severity | Recommended Mitigation | Architecture Layer | Current Status |
|---|---|---|---|---|---|
| **Host System Compromise** | User submits code that attempts privilege escalation, container breakout, or mounts a kernel exploit. | **CRITICAL** | Isolate execution inside Judge0 running with unprivileged user (`judge`), Linux cgroups v2, disabled seccomp profiles, and isolated PID/network namespaces. Never run as root. | Sandbox / Docker Container | **Missing (Requires Judge0 Compose Config)** |
| **Network Exfiltration & SSRF** | User code attempts socket connections, scans localhost/internal network, or queries AWS/cloud metadata endpoints (e.g. `169.254.169.254`). | **CRITICAL** | Disable network access completely within the execution sandbox (`--network none` in Docker, or `ENABLE_NETWORK=false` in Judge0). | Container / Network | **Missing (Requires Judge0 Config)** |
| **Hidden Test Case Leakage** | User writes code that reads stdin and echoes all test inputs or expected answers to stdout/stderr. | **HIGH** | Only return full stdout/stderr for public sample cases. For hidden test cases, sanitize and suppress outputs, returning only pass/fail status and diff hints on the first failing case. | Backend API (`SubmissionsService`) | **Proposed (To Implement in 4B)** |
| **Resource Exhaustion (CPU)** | Malicious infinite loop (`while(true) {}`) or fork bomb (`while(1) fork();`). | **HIGH** | Hard CPU time limit (e.g., 2.0s), wall-clock limit (5.0s), and strict max process limits (`pids.max = 30`). | Judge0 / Linux cgroups | **Missing (To configure in Judge0)** |
| **Resource Exhaustion (Memory)** | Code allocates gigabytes of RAM in an array (`new byte[1024*1024*1024]`), crashing the host. | **HIGH** | Hard memory cap per execution (e.g., 256MB) enforced by Linux cgroups. Exceeding triggers `MEMORY_LIMIT_EXCEEDED` verdict without crashing host. | Judge0 / Linux cgroups | **Missing (To configure in Judge0)** |
| **Disk Fill / Output Flooding** | User code loops printing millions of characters, filling disk space or overwhelming network payloads. | **MEDIUM** | Hard limit on stdout/stderr size (max 4KB / 4096 bytes). Truncate excess data with `[Output truncated...]`. | ExecutionProvider Adapter | **Proposed (To Implement in 4B)** |
| **Payload Size Abuse** | User posts a 50MB source code payload to overwhelm JSON parser or DB. | **MEDIUM** | Enforce DTO validation `@MaxLength(65535)` (64KB max) and body parser payload limits (`limit: '100kb'`). | NestJS Controller / ValidationPipe | **Existing (ValidationPipe Active)** |
| **API Denial of Service (Spam)** | Automated script spams submission endpoint 100 times per second, overloading execution queue. | **HIGH** | Enforce `@Throttle({ default: { limit: 5, ttl: 60000 } })` via `@nestjs/throttler` on submit endpoints. | NestJS Guard / Throttler | **Partial (Package Installed, Needs Endpoint Guard)** |
| **Cross-User Data Access** | Student A queries `GET /submissions/:id` belonging to Student B to view their source code. | **HIGH** | Enforce strict ownership check: `submission.userId === currentUser.id` or `currentUser.role in ['PLATFORM_ADMIN', 'TRAINER']`. Else return `403 Forbidden`. | Backend Service / Guard | **Proposed (To Implement in 4B)** |
| **Secret & Credential Exposure** | Malicious code attempts to read `/proc/self/environ` to extract `DATABASE_URL` or `JWT_ACCESS_SECRET`. | **CRITICAL** | Untrusted code executes inside an isolated container with zero access to application environment variables. | Container / Env Isolation | **Verified (Out-of-process design guarantees separation)** |
| **Logging Sensitive Data** | Backend logs entire user source code or raw test cases in cleartext application logs. | **LOW** | Sanitize logs. Log only submission ID, problem slug, language, and final verdict without source code bodies. | Backend Logging Service | **Proposed (To Implement in 4B)** |

---

## 3. Defense-in-Depth Implementation Checklist

1. **Layer 1: Edge & Network**:
   - NestJS Throttler guards applied to `POST /submissions` (5/min) and `POST /submissions/run` (10/min).
   - CORS strictly restricted to `http://localhost:3000` (production origin).
2. **Layer 2: API & Validation**:
   - `class-validator` enforces whitelist, forbid non-whitelisted, and max length 64KB on source code.
   - Ownership validation on every submission retrieval.
3. **Layer 3: Execution Provider**:
   - Base64 encoding for all inputs and outputs.
   - Stdout/stderr truncated at 4096 bytes.
4. **Layer 4: Sandbox & Container**:
   - Execution runs in unprivileged container with read-only root filesystem.
   - Network connectivity disabled (`--network none`).
   - Hard cgroup limits: 2000ms CPU time, 256MB RAM, 30 max processes.
