# NUMU Execution Engine Configuration Guide

**Document Version:** 1.0.0  
**Phase:** Phase 4D — Integration Readiness  
**Target Platform:** NestJS Backend (NUMU Monorepo)  
**Execution Service:** Judge0 Community Edition v1.13.1  

---

## 1. Overview & Context

This document guides the future configuration of the NUMU NestJS backend to communicate reliably with the Judge0 execution engine across local development, containerized staging, and production environments.

> [!IMPORTANT]
> **Scope Notice:** This document defines the *target configuration contract* for NUMU. It does **not** create, modify, or commit any configuration or `.env` files within the NUMU monorepo during Phase 4D.

---

## 2. Environment Variables Specification

The future NUMU NestJS integration module requires the following environment variables:

| Variable Name | Required | Default (Dev) | Production Target | Description |
| :--- | :---: | :--- | :--- | :--- |
| `JUDGE0_BASE_URL` | **Yes** | `http://127.0.0.1:2358` | `https://engine.internal.numu.com` | Base URL of the Judge0 REST API. |
| `JUDGE0_AUTH_TOKEN` | No | `""` | `[Secure Random Token]` | Secret token passed via `X-Auth-Token` header. |
| `JUDGE0_TIMEOUT_MS` | No | `5000` | `5000` | HTTP request timeout for creation and status checks. |
| `JUDGE0_POLL_INTERVAL_MS`| No | `500` | `500` | Polling frequency for pending submissions. |
| `JUDGE0_POLL_MAX_ATTEMPTS`| No | `60` | `60` | Maximum poll iterations before timeout (30 seconds total). |
| `JUDGE0_DEFAULT_CPU_LIMIT`| No | `2.0` | `2.0` | Default CPU time limit per submission in seconds. |
| `JUDGE0_DEFAULT_MEM_LIMIT`| No | `128000` | `128000` | Default memory ceiling per submission in Kilobytes (128 MB). |

---

## 3. Network Topologies & Hostname Resolution

Understanding network resolution is critical to avoiding connection errors across different deployment environments:

```
Scenario A: NestJS on Windows Host, Judge0 in Docker Desktop
+----------------------------------------------------+
|  Windows Host                                      |
|    NestJS App (npm run dev)                        |
|        |                                           |
|        v HTTP GET/POST                             |
|    http://127.0.0.1:2358                           |
|        |                                           |
|    Docker Desktop (WSL 2)                          |
|      judge0-server-1 (:2358)                       |
+----------------------------------------------------+

Scenario B: NestJS and Judge0 both in Docker (Containerized Stack)
+----------------------------------------------------+
|  Docker Bridge / Overlay Network                   |
|                                                    |
|    numu-api-container                              |
|        |                                           |
|        v HTTP GET/POST                             |
|    http://judge0-server:2358   (NOT localhost!)    |
|        |                                           |
|    judge0-server-1                                 |
+----------------------------------------------------+
```

### Local Development (Host-to-Container)
When NestJS runs directly on Windows via `pnpm dev` or `npm run dev`:
```env
JUDGE0_BASE_URL=http://127.0.0.1:2358
```
- Port `2358` is forwarded from Docker Desktop's WSL 2 VM directly to Windows loopback.
- Using `127.0.0.1` avoids IPv6/IPv4 resolution ambiguity common on Windows (`localhost` vs `::1`).

### Containerized Development (Container-to-Container)
When NestJS itself runs inside a Docker container (e.g. via `docker compose`):
> [!CAUTION]
> Inside a container, `localhost` or `127.0.0.1` resolves to that specific container itself! Calling `http://127.0.0.1:2358` from inside another container will result in `ECONNREFUSED`.
- The containers must share a Docker network.
- NestJS must connect using the service name:
```env
JUDGE0_BASE_URL=http://server:2358
# or via host gateway:
# JUDGE0_BASE_URL=http://host.docker.internal:2358
```

### Production Deployment (Private Cloud VPC)
In production, Judge0 must never be accessible over the public internet:
1. **Private Subnet:** Judge0 operates inside a private VPC with ingress restricted strictly to the NestJS application instances.
2. **TLS / HTTPS:** Communication between NestJS and Judge0 must use internal TLS (`https://...`) to prevent packet inspection.
3. **Authentication Token:** Enable Judge0 token authentication:
```env
JUDGE0_BASE_URL=https://judge0-internal.vpc:2358
JUDGE0_AUTH_TOKEN=32_CHAR_HIGH_ENTROPY_RANDOM_SECRET
```

---

## 4. Timeout and Circuit Breaker Design

To ensure NUMU API responsiveness when Judge0 experiences load:

1. **HTTP Client Timeout:**
   - Every outgoing HTTP request from NestJS (`HttpService` / `axios` / `fetch`) must specify an explicit timeout (`signal: AbortSignal.timeout(5000)`).
   - If Judge0 does not respond within 5,000 ms, the request is aborted and marked transient failure.

2. **Polling Deadline:**
   - Asynchronous polling must never loop indefinitely.
   - Set maximum poll iterations to `60` with `500ms` intervals (30-second ceiling).
   - If the deadline expires without a terminal status, update the submission state to `POLLING_TIMEOUT` and release the worker thread.

---

## 5. Security & Secret Hygiene

1. **Zero Secret Commits:**
   - `judge0.conf` is ignored in Git via `.gitignore`.
   - Never commit `.env` or production secrets to Git.
   - Templates (`.env.example` and `judge0.conf.example`) must contain placeholder strings only.

2. **Backend-Only Exposure:**
   - Under no circumstances should `JUDGE0_BASE_URL` or `JUDGE0_AUTH_TOKEN` be prefixed with `NEXT_PUBLIC_` or exposed to the frontend bundle.
