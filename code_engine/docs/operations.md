# Judge0 CE Operations & Runbook

This runbook covers routine operations, lifecycle management, health monitoring, and log inspection for the local Judge0 Community Edition environment.

## 1. Service Lifecycle Management

All commands should be executed from within `E:\code_engine\judge0` (or using the `-f` flag).

### Starting Services
To start the environment cleanly without race conditions:
```powershell
cd E:\code_engine\judge0

# 1. Start core dependencies (PostgreSQL and Redis)
docker compose up -d db redis

# 2. Wait 10 seconds for DB schema and Redis listener initialization
Start-Sleep -Seconds 10

# 3. Start API server and execution workers
docker compose up -d
```

### Stopping Services (Safe Shutdown)
To stop the services while preserving persistent database volumes and submission history:
```powershell
cd E:\code_engine\judge0
docker compose stop
```
> **Warning**: Do NOT use `docker compose down -v` as the `-v` flag removes the persistent `data` volume containing your PostgreSQL database and submission records.

### Restarting Services
To restart a specific service (e.g. after updating configuration in `judge0.conf`):
```powershell
cd E:\code_engine\judge0
docker compose restart server workers
```

### Complete Stack Teardown (Containers Only)
To remove stopped containers and the default network without removing volumes:
```powershell
cd E:\code_engine\judge0
docker compose down
```

---

## 2. Health Monitoring & Verification

Automated PowerShell scripts are located under `code_engine/scripts/`:

### Environment Readiness Check
```powershell
powershell -ExecutionPolicy Bypass -File scripts\check-environment.ps1
```

### API Reachability & Language Discovery
```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify-api.ps1
```

### Full Infrastructure Health & Sanity Run
```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify-health.ps1
```

### Comprehensive 12-Test Execution Suite
```powershell
powershell -ExecutionPolicy Bypass -File scripts\test-execution.ps1
```

---

## 3. Log Inspection

### View Real-Time Combined Logs
```powershell
cd E:\code_engine\judge0
docker compose logs -f --tail=100
```

### Inspect Execution Worker Activity
```powershell
docker compose logs -f --tail=100 workers
```

### Inspect API Server Requests
```powershell
docker compose logs -f --tail=100 server
```

### Inspect PostgreSQL Logs
```powershell
docker compose logs --tail=50 db
```

### Inspect Redis Logs
```powershell
docker compose logs --tail=50 redis
```
