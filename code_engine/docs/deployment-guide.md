# Judge0 CE Deployment & Operations Guide

**Document Version:** 1.0.0  
**Phase:** Phase 4D — Integration Readiness  
**Target:** Local Windows / WSL 2 Deployment & Future Cloud Production  
**Component:** Judge0 Community Edition v1.13.1  

---

## 1. Local Development Operations (Verified Commands)

All operations should be executed from within `code_engine/judge0/` using Windows PowerShell or PowerShell Core.

### 1.1 Cold Start (Safe Initialization Sequence)
To prevent race conditions where the API server or workers attempt to connect before PostgreSQL has initialized its schema or Redis has opened sockets:

```powershell
# Navigate to deployment directory
cd E:\code_engine\judge0

# 1. Start database and cache first
docker compose up -d db redis

# 2. Wait 10 seconds for PostgreSQL and Redis to become healthy
Start-Sleep -Seconds 10

# 3. Start API server and execution workers
docker compose up -d
```

### 1.2 Verifying Container Health & Status
Verify that all 4 containers are running and healthy:

```powershell
docker compose ps
```

**Expected Healthy Output:**
```
NAME               IMAGE                  STATUS         PORTS
judge0-server-1    judge0/judge0:1.13.1   Up (healthy)   127.0.0.1:2358->2358/tcp
judge0-workers-1   judge0/judge0:1.13.1   Up (healthy)   2358/tcp
judge0-db-1        postgres:16.2          Up (healthy)   5432/tcp
judge0-redis-1     redis:7.2.4            Up (healthy)   6379/tcp
```

### 1.3 Smoke Testing the Engine
Run the automated verification scripts provided in `scripts/`:

```powershell
# 1. Test API reachability & discover installed languages
powershell -ExecutionPolicy Bypass -File E:\code_engine\scripts\verify-api.ps1

# 2. Run infrastructure health check & single execution sanity run
powershell -ExecutionPolicy Bypass -File E:\code_engine\scripts\verify-health.ps1

# 3. Execute the full 12-test automated execution suite
powershell -ExecutionPolicy Bypass -File E:\code_engine\scripts\test-execution.ps1
```

### 1.4 Stopping the Infrastructure (Data Preserved)
To safely stop the containers while preserving PostgreSQL submission history, language tables, and volumes:

```powershell
cd E:\code_engine\judge0
docker compose stop
```

> [!CAUTION]
> **Data Loss Warning:** Do **NOT** run `docker compose down -v`. The `-v` flag deletes Docker volumes, which permanently destroys your PostgreSQL database (`data` volume) and all submission history!
> To remove containers without deleting persistent data, run:
> ```powershell
> docker compose down
> ```

---

## 2. Log Inspection & Diagnostics

### Real-Time Combined Logs
```powershell
cd E:\code_engine\judge0
docker compose logs -f --tail=100
```

### Inspect Execution Worker Activity (Sandbox / Isolate)
```powershell
docker compose logs -f --tail=100 workers
```

### Inspect API Server HTTP Requests
```powershell
docker compose logs -f --tail=100 server
```

### Inspect PostgreSQL Database Logs
```powershell
docker compose logs --tail=50 db
```

### Inspect Redis Queue Logs
```powershell
docker compose logs --tail=50 redis
```

---

## 3. Transitioning to Production Deployment

When transitioning Judge0 from local Windows/WSL 2 development to production cloud infrastructure (AWS ECS, Kubernetes, or dedicated Linux VMs):

### Step 1: Operating System & Kernel Requirements
- **Host OS:** Clean Ubuntu Server 22.04 LTS or 24.04 LTS (64-bit x86_64).
- **Cgroups:** Judge0 CE v1.13.1 relies on `isolate`, which requires cgroup v1 support or POSIX setrlimit mode. On modern Linux kernels with cgroup v2, enable:
  ```ini
  ENABLE_PER_PROCESS_AND_THREAD_TIME_LIMIT=true
  ENABLE_PER_PROCESS_AND_THREAD_MEMORY_LIMIT=true
  ```
  in `judge0.conf` (as validated during Phase 4C).

### Step 2: Production Network Hardening
1. Remove host loopback binding (`127.0.0.1:2358:2358`).
2. Attach Judge0 containers to an internal private bridge or Kubernetes overlay network.
3. Place an internal load balancer (or Envoy/NGINX sidecar) in front of Judge0 with TLS termination (`https://judge0.internal.numu.com`).

### Step 3: Production Credential Management
1. Generate high-entropy 64-character random passwords for `POSTGRES_PASSWORD` and `REDIS_PASSWORD`.
2. Configure `AUTH_TOKEN` in `judge0.conf` and provide this token to NUMU NestJS via `JUDGE0_AUTH_TOKEN`.
3. Store all secrets in AWS Secrets Manager, Vault, or Doppler.

### Step 4: Worker Scaling & Concurrency
In `judge0.conf`, tune worker concurrency to match server CPU core capacity:
```ini
# Recommended: 1-2 workers per available physical CPU core
COUNT=4
```
