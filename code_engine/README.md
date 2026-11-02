# NUMU Code Engine — Local Judge0 CE Execution Infrastructure

This directory (`code_engine/`) hosts the self-contained, local code execution environment for the **NUMU Platform**, powered by **Judge0 Community Edition (CE) v1.13.1**.

It operates completely independently of the NUMU Turborepo application stack (`NUMMU/`), communicating solely via standard HTTP REST over loopback (`http://127.0.0.1:2358`).

---

## 1. System Architecture & Topology

The execution stack is orchestrated via Docker Compose:
- **Judge0 API Server (`server`)**: Exposes REST API on `http://127.0.0.1:2358`.
- **Execution Workers (`workers`)**: Executes untrusted user code inside isolated Linux sandboxes (`isolate`).
- **PostgreSQL 16.2 (`db`)**: Persistent relational store for languages and execution metadata.
- **Redis 7.2.4 (`redis`)**: In-memory job queue and cache.

```
NUMU NestJS API (NUMMU/) === [HTTP 127.0.0.1:2358] ===> Judge0 CE (code_engine/)
                                                           ├── API Server
                                                           ├── Redis 7.2 (Queue)
                                                           ├── PostgreSQL 16
                                                           └── Sandboxed Workers (isolate)
```

---

## 2. Quick Start & Operational Commands

All commands are executed from within `code_engine/judge0/` using PowerShell:

### Start the Infrastructure (Safe Cold Start)
```powershell
cd code_engine\judge0
docker compose up -d db redis
Start-Sleep -Seconds 10
docker compose up -d
```

### Check Container Health & Status
```powershell
docker compose ps
```

### Run Infrastructure Verification Scripts
```powershell
# 1. Probe API & discover languages
powershell -ExecutionPolicy Bypass -File scripts\verify-api.ps1

# 2. Run sanity check
powershell -ExecutionPolicy Bypass -File scripts\verify-health.ps1

# 3. Execute the full 12-test automated execution suite
powershell -ExecutionPolicy Bypass -File scripts\test-execution.ps1
```

### Stop the Infrastructure (Preserving Data)
```powershell
cd code_engine\judge0
docker compose stop
```

---

## 3. Comprehensive Documentation Index

All technical specifications, contracts, and implementation plans are located in [`docs/`](docs/):

### Architecture & Integration Design
- **[System Architecture](docs/architecture.md)** — Architectural boundaries, component responsibilities, network topology, and execution vs. judging separation.
- **[Integration Overview](docs/integration-overview.md)** — End-to-end request flow, sequence diagrams, Run vs. Submit workflows, and invariants.
- **[First-Level Integration Plan](docs/first-level-integration-plan.md)** — Blueprint for Level 1 direct integration and phased scalability roadmap.
- **[Judge0 API Contract](docs/judge0-api-contract.md)** — Comprehensive specification of Judge0 v1.13.1 endpoints, Base64 protocol, and status codes.
- **[NUMU Integration Plan](docs/numu-integration-plan.md)** — Seven-stage implementation roadmap, execution adapter interface, and proposed API DTOs.
- **[Future Integration Checklist](docs/future-integration-checklist.md)** — Actionable implementation checklist with classification badges.

### Configuration, Languages & Lifecycle
- **[Configuration Guide](docs/configuration-guide.md)** — Environment variables, container vs. host resolution, timeouts, and secret management.
- **[Language Mapping](docs/language-mapping.md)** — Verified mapping table associating NUMU language slugs with Judge0 IDs, whitelist validation, and upgrade drift verification.
- **[Submission Lifecycle](docs/submission-lifecycle.md)** — Formal state machine (`QUEUED` -> `DISPATCHING` -> `PROCESSING` -> `COMPLETED`), failure paths, and recovery.
- **[Status & Verdict Mapping](docs/status-mapping.md)** — Three-tier evaluation model, normalization table, and comparator algorithms.

### Security, Reliability & Operations
- **[Security Requirements](docs/security-requirements.md)** — Defense-in-depth, threat modeling matrix, sandbox isolation, and local vs. production security gates.
- **[Error Handling & Reliability](docs/error-handling.md)** — Failure mode analysis, bounded polling deadlines, backoff algorithms, and crash recovery.
- **[Testing Strategy](docs/testing-strategy.md)** — 26 future integration test specifications across Connectivity, Sandboxing, Business Logic, and Resilience.
- **[Deployment & Operations Guide](docs/deployment-guide.md)** — Verified daily operational commands, health checks, log inspection, and production migration.
- **[Troubleshooting Guide](docs/troubleshooting.md)** — Diagnostic decision tree, WSL 2 cgroup v2 fixes, Redis auth resolutions, and port conflict playbooks.

### Formal Reports
- **[Phase 4C Final Report](reports/phase-4c-report.md)** — Official historical sign-off report confirming 12/12 passing execution tests on local Judge0 CE v1.13.1.
- **[Phase 4D Integration Readiness Report](reports/integration-readiness-report.md)** — Formal sign-off and readiness certification for starting Phase 4D implementation.

---

## 4. Directory Layout

```
code_engine/
├── .gitignore                          # Secrets & log protection
├── README.md                           # Master repository documentation (this file)
├── judge0/
│   ├── docker-compose.yml              # Multi-container orchestration (127.0.0.1:2358)
│   ├── judge0.conf                     # Active runtime secrets & sandbox configuration
│   └── judge0.conf.example             # Redacted configuration template
├── docs/
│   ├── architecture.md                 # System components, dataflow & sequence diagrams
│   ├── integration-overview.md         # Request flow, sequence diagram, Run vs Submit
│   ├── numu-integration-plan.md        # 7-stage implementation roadmap & proposed DTOs
│   ├── judge0-api-contract.md          # REST API schemas, Base64 standard, status IDs
│   ├── configuration-guide.md          # Environment variables, network resolution, timeouts
│   ├── language-mapping.md             # Whitelist mapping, verified v1.13.1 language IDs
│   ├── submission-lifecycle.md         # Formal state machine, failure paths & reconciliation
│   ├── status-mapping.md               # 3-tier status model, normalization & comparator rules
│   ├── security-requirements.md        # Defense-in-depth, threat matrix, local vs prod gates
│   ├── error-handling.md               # Failure modes, bounded polling & retry algorithms
│   ├── testing-strategy.md             # 26 future integration test specifications
│   ├── deployment-guide.md             # Operational runbook, startup sequence & cloud migration
│   ├── troubleshooting.md              # Diagnostics, WSL2 cgroup v2 fixes, port conflict playbooks
│   └── future-integration-checklist.md # Actionable implementation checklist
├── reports/
│   ├── phase-4c-report.md              # Historical verification report (12/12 tests passed)
│   └── integration-readiness-report.md # Phase 4D readiness certification
├── scripts/
│   ├── check-environment.ps1          # Pre-flight host & WSL2 validator
│   ├── verify-api.ps1                  # API connectivity & language discoverer
│   ├── verify-health.ps1               # Infrastructure healthcheck & sanity runner
│   └── test-execution.ps1              # 12-scenario automated testing harness
└── tests/
    ├── README.md                       # Test runner documentation & test catalog
    └── cases/                          # Benchmark source files (Python, C++)
```
