# Security Requirements & Threat Mitigation

**Document Version:** 1.0.0  
**Phase:** Phase 4D — Integration Readiness  
**Target:** NUMU Platform & Judge0 Execution Engine  

---

## 1. Security Philosophy: Defense in Depth

Executing untrusted arbitrary code submitted by public users is inherently hazardous. The NUMU architecture enforces security across multiple distinct protective perimeters:

```
[ Public Internet / Untrusted Client ]
              |
              | 1. Cloudflare / WAF (DDoS protection, TLS termination)
              v
[ NUMU Next.js Frontend ]
              |
              | 2. Rate Limiting, JWT Authentication, Submission Quotas
              v
[ NUMU NestJS API Server ]
              |
              | 3. Input Sanitization, Code Size Caps, Language Whitelist
              v
[ Internal Private Network / Loopback Link ]
              |
              | 4. Network Isolation (Loopback only / VPC firewall, Auth Token)
              v
[ Judge0 Execution Server ]
              |
              | 5. Linux Sandbox: isolate (Namespaces, cgroups, chroot, POSIX rlimits)
              v
[ Subprocess Execution ] (Zero network access, constrained CPU/RAM/Disk)
```

---

## 2. Threat Modeling & Mitigation Matrix

| Threat / Attack Vector | Severity | Vulnerability Description | Mitigation Strategy | Status |
| :--- | :---: | :--- | :--- | :---: |
| **Sandbox Escape / Host Takeover** | Critical | User code attempts to exploit Linux kernel vulnerabilities to break out of Docker container. | Untrusted code executes inside `isolate` sandbox within non-root worker container; cgroups and chroot isolation active. | **VERIFIED** (Phase 4C) |
| **Denial of Service (CPU/Fork Bomb)** | High | User submits `:(){ :\|:& };:` or infinite loop to exhaust host CPU cores and PID space. | `max_processes_and_or_threads` capped at `60`; strict `cpu_time_limit` enforced by SIGXCPU/SIGKILL. | **VERIFIED** (Phase 4C T08) |
| **Memory Exhaustion (OOM Crash)** | High | User allocates massive arrays to crash Docker or host OS. | POSIX `setrlimit` enforced (`ENABLE_PER_PROCESS_AND_THREAD_MEMORY_LIMIT=true`); capped at 128MB. | **VERIFIED** (Phase 4C T09) |
| **Network Probing / SSRF** | High | User code attempts to probe AWS metadata endpoints (`169.254.169.254`) or internal databases. | Worker execution sandbox has outbound network disabled by default in `isolate` environment. | **VERIFIED** (Engine Baseline) |
| **Disk Filling / Output Flooding** | Medium | User writes infinite loops printing to stdout or creating huge files in `/tmp`. | `max_file_size` parameter capped at 1024 KB; output buffer truncated upon limit breach. | **VERIFIED** |
| **Hidden Test Case Exfiltration** | High | User inspects browser network payloads to discover hidden test inputs or answers. | Hidden test cases are stored in NUMU DB; never returned in HTTP responses to the client. | **PROPOSED** (NUMU Contract) |
| **Direct Judge0 Port Access** | High | Malicious user accesses `http://<ip>:2358` directly to bypass NUMU rate limits and run code. | Port 2358 is bound strictly to `127.0.0.1` locally; private VPC security group in production. | **VERIFIED** (Local Host) |
| **Compiler Injection Attacks** | High | Attacker injects malicious compiler flags (e.g. `-D` or `#include </etc/shadow>`). | `compiler_options` is controlled strictly by NestJS; clients cannot supply custom compiler arguments. | **PROPOSED** (NUMU Whitelist) |

---

## 3. Verified Current Local Controls vs. Production Requirements

The following table distinguishes what has been verified in the local environment from what must be enforced during production deployment:

| Control | Local Development (Verified) | Production Target (Required) |
| :--- | :--- | :--- |
| **Network Binding** | Bound to `127.0.0.1:2358`. LAN/WAN access blocked. | Private VPC Subnet with Security Groups allowing traffic only from NestJS IP addresses. |
| **Authentication** | Unauthenticated (loopback trust). | `X-Auth-Token` header enabled with 32+ character cryptographically random token. |
| **Transport Encryption** | HTTP loopback (`http://127.0.0.1:2358`). | Internal HTTPS/mTLS encryption for all inter-service traffic. |
| **Rate Limiting** | Disabled locally for rapid testing. | Strict Redis-backed sliding-window rate limit (e.g. 5 submissions/minute per user) in NestJS. |
| **Secret Management** | Local file `judge0.conf` ignored by `.gitignore`. | Secret Manager (AWS Secrets Manager, HashiCorp Vault, or Doppler). |
| **Worker Privileges** | Docker `privileged: true` required for WSL 2 isolate. | Minimal required Linux capabilities (`CAP_SYS_ADMIN` scoped, seccomp profile). |
| **Log Sanitization** | Full stdout/stderr logged to debug scripts. | Structured JSON logs redacting user code, secrets, and private test inputs. |

---

## 4. Source Code and Input Validation Invariants

Before sending any submission to Judge0, the NUMU NestJS backend **MUST** enforce the following validation guards:

1. **Maximum Code Size:** 64 Kilobytes (rejects oversized payloads before encoding).
2. **Maximum Custom Input Size:** 128 Kilobytes for Run mode custom stdin.
3. **Language Whitelist:** Language must match a valid, enabled key in `SUPPORTED_LANGUAGES`.
4. **Stripping Null Bytes:** Strip `\0` null bytes from source strings to prevent C-string truncation attacks.
5. **No Direct Tokens in Client UI:** The Judge0 `token` (UUID) is an internal execution handle and must **never** be exposed in public API responses or URLs.
