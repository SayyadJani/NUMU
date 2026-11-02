# Judge0 CE Comprehensive Troubleshooting Guide

**Document Version:** 2.0.0  
**Phase:** Phase 4D — Operational Reliability  
**Target Platform:** Windows 11 / WSL 2 / Docker Desktop (Local) & Linux Container Operations  

---

## 1. Quick Diagnostic Decision Tree

```
API Request Fails?
  |
  +---> "Connection refused" / Port 2358 unreachable?
  |       └─> Check Section 2: Docker Daemon & Host Port Issues
  |
  +---> Submissions stuck in "In Queue" (Status 1)?
  |       └─> Check Section 3: Redis & Worker Processing Failures
  |
  +---> Submissions fail with Status 13 (Internal Error)?
  |       └─> Check Section 4: WSL 2 cgroup v2 & Isolate Sandbox Errors
  |
  +---> Submissions fail with UTF-8 Serialization Error?
  |       └─> Check Section 5: Base64 Encoding Mismatches
  |
  +---> NestJS Polling Times Out (>30s)?
          └─> Check Section 6: Polling Deadlocks & Worker Starvation
```

---

## 2. Docker Daemon & Host Port Issues

### Symptom: `connect ECONNREFUSED 127.0.0.1:2358`
- **Cause 1: Docker Desktop is stopped or still starting.**
  - **Diagnostic:** Run `docker.exe version` in PowerShell.
  - **Resolution:** Launch Docker Desktop from the Windows Start menu. Wait until the status in the system tray shows green ("Engine running").
- **Cause 2: Container exited or failed to start.**
  - **Diagnostic:** Run `docker compose ps` inside `code_engine/judge0/`.
  - **Resolution:** If `judge0-server-1` is in status `Exited`, inspect logs with `docker compose logs server`.
- **Cause 3: Port conflict on host port 2358.**
  - **Diagnostic:** Run in PowerShell:
    ```powershell
    Get-NetTCPConnection -LocalPort 2358 -ErrorAction SilentlyContinue | Select-Object OwningProcess
    ```
  - **Resolution:** Terminate the competing process using `Stop-Process -Id <PID>` or remap the host port in `judge0/docker-compose.yml` (e.g. `"127.0.0.1:2359:2358"`).

### Symptom: "No space left on device" during container start
- **Cause:** Docker Desktop stores the WSL 2 virtual hard disk (`docker_data.vhdx`) on `C:` by default.
- **Resolution (Validated in Phase 4C):**
  1. Stop Docker Desktop.
  2. Relocate `docker_data.vhdx` to secondary drive with ample space (e.g. `E:\DockerDesktop\disk\`).
  3. Create an NTFS junction link:
     ```powershell
     cmd.exe /c "mklink /J `"C:\Users\$env:USERNAME\AppData\Local\Docker\wsl\disk`" `"E:\DockerDesktop\disk`""
     ```
  4. Restart Docker Desktop.

---

## 3. Redis & Worker Processing Failures

### Symptom: Submissions stuck in `In Queue` (Status 1) indefinitely
- **Cause 1: Worker container (`judge0-workers-1`) is stopped.**
  - **Diagnostic:** Run `docker compose ps workers`.
  - **Resolution:** Start the worker service:
    ```powershell
    cd E:\code_engine\judge0
    docker compose up -d workers
    ```
- **Cause 2: Redis authentication mismatch.**
  - **Diagnostic:** Inspect worker logs: `docker compose logs workers`. If logs show `NOAUTH Authentication required` or `WRONGPASS`:
  - **Resolution:** Ensure `judge0/docker-compose.yml` passes `--requirepass "$$REDIS_PASSWORD"` to Redis and that `judge0.conf` contains an identical non-empty `REDIS_PASSWORD`. Restart the stack:
    ```powershell
    docker compose restart redis server workers
    ```
- **Cause 3: Worker missing Linux privileges.**
  - **Diagnostic:** Worker logs show `isolate: Operation not permitted`.
  - **Resolution:** Ensure `privileged: true` is set on the `workers` service in `docker-compose.yml`.

---

## 4. WSL 2 cgroup v2 & Isolate Sandbox Errors

### Symptom: Submissions fail with Status 13 (Internal Error)
- **Log Diagnostic:** Worker log shows:
  ```
  Failed to create control group /sys/fs/cgroup/memory/box-*
  ```
- **Root Cause:** Modern Windows 11 WSL 2 kernels use unified **cgroup v2**. Judge0's underlying Linux sandbox (`isolate`) defaults to cgroup v1 controllers (`--cg`), which fail on WSL 2 with Internal Error 13.
- **Resolution (Hardened in Phase 4C):**
  1. Open `code_engine/judge0/judge0.conf`.
  2. Ensure the following POSIX resource limit flags are set to `true`:
     ```ini
     ENABLE_PER_PROCESS_AND_THREAD_TIME_LIMIT=true
     ENABLE_PER_PROCESS_AND_THREAD_MEMORY_LIMIT=true
     ```
  3. When both flags are `true`, Judge0's `isolate_job.rb` automatically drops the `--cg` flag and enforces resource limits via standard POSIX `setrlimit` calls, which work flawlessly inside WSL 2.
  4. Restart the workers:
     ```powershell
     docker compose restart workers
     ```

---

## 5. Base64 Encoding Mismatches & Character Corruption

### Symptom: API returns HTTP 500: `some attributes for this submission cannot be converted to UTF-8`
- **Root Cause:** When GCC or Clang compile C++ with diagnostics, they output curved Unicode quotation marks (`‘` and `’`). In non-Base64 mode (`base64_encoded=false`), Rails JSON serialization encounters invalid byte sequences and rejects the payload.
- **Resolution:**
  - **Always pass `?base64_encoded=true`** on both `POST /submissions` and `GET /submissions/{token}`.
  - Base64-encode all inputs (`source_code`, `stdin`) before sending.
  - Base64-decode all outputs (`stdout`, `stderr`, `compile_output`) before parsing.

### Symptom: Worker crashes with `seq: invalid floating point argument: '\r'`
- **Root Cause:** `judge0.conf` was saved with Windows CRLF (`\r\n`) line endings, which bash scripts inside the Linux container cannot parse.
- **Resolution:** Ensure `judge0.conf` is saved with Unix LF (`\n`) line endings. In PowerShell:
  ```powershell
  $content = [System.IO.File]::ReadAllText("judge0\judge0.conf")
  [System.IO.File]::WriteAllText("judge0\judge0.conf", $content.Replace("`r`n", "`n"))
  ```

---

## 6. Polling Deadlocks & Worker Starvation

### Symptom: NestJS Polling reaches 60 attempts (30s) and fails with `POLLING_TIMEOUT`
- **Cause 1: High concurrency saturation.**
  - If 20 submissions are queued simultaneously and Judge0 has only 1 worker thread (`COUNT=1`), later submissions wait in Redis until earlier submissions complete.
  - **Resolution:** Increase worker concurrency in `judge0.conf`:
    ```ini
    COUNT=4
    ```
    Then restart workers: `docker compose restart workers`.
- **Cause 2: Infinite loop code monopolizing workers.**
  - If user code does not terminate and `cpu_time_limit` is set excessively high (e.g. 30s), the worker is occupied for that entire duration.
  - **Resolution:** Cap `cpu_time_limit` to 2.0s in NestJS dispatch requests.
