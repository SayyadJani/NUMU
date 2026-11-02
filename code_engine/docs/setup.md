# Judge0 CE Local Setup Guide (Windows 11 / WSL 2)

This document provides the step-by-step setup procedure for running official Judge0 Community Edition (CE) locally on Windows 10/11 using Docker Desktop and WSL 2.

## 1. Prerequisites
- **Operating System**: Windows 10 (Build 19044+) or Windows 11 (64-bit).
- **WSL 2**: WSL 2 enabled with Linux kernel updates.
- **Docker Desktop**: Docker Desktop 4.28+ with Linux container support.
- **PowerShell**: Windows PowerShell 5.1 or PowerShell Core 7+.
- **Disk Space**: At least 15 GB of available storage for the Docker engine virtual disk and compilers.

## 2. Directory Layout
The project is strictly self-contained within `code_engine/`:

```
code_engine/
├── judge0/
│   ├── docker-compose.yml     # Upstream Compose deployment
│   ├── judge0.conf            # Local configuration & credentials
│   └── judge0.conf.example    # Redacted template
├── scripts/                   # Automated operations & test scripts
├── tests/                     # Test cases and harness inputs
├── docs/                      # Architectural and operational docs
├── reports/                   # Execution reports and phase sign-off
└── .gitignore                 # Secrets & log protection
```

## 3. Initial Configuration Steps

### Step 1: Obtain the Official Release
Download official release `v1.13.1` deployment files:
```powershell
$zipUrl = "https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip"
Invoke-WebRequest -Uri $zipUrl -OutFile "judge0-v1.13.1.zip"
Expand-Archive -Path "judge0-v1.13.1.zip" -DestinationPath "temp_judge0"
Move-Item "temp_judge0\judge0-v1.13.1" "E:\code_engine\judge0"
```

### Step 2: Configure Local Passwords
Set strong, unique random passwords in `judge0/judge0.conf`:
```powershell
$redisPass = [System.Guid]::NewGuid().ToString("N")
$postgresPass = [System.Guid]::NewGuid().ToString("N")

(Get-Content "judge0\judge0.conf") `
    -replace "^REDIS_PASSWORD=.*", "REDIS_PASSWORD=$redisPass" `
    -replace "^POSTGRES_PASSWORD=.*", "POSTGRES_PASSWORD=$postgresPass" |
    Set-Content "judge0\judge0.conf"
```

### Step 3: Local-Only Port Binding
In `judge0/docker-compose.yml`, bind port 2358 to localhost:
```yaml
ports:
  - "127.0.0.1:2358:2358"
```

### Step 4: Validate Pre-Flight Environment
Run the environment validator:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\check-environment.ps1
```

## 4. Launching the Services

Start the database and Redis cache first to allow clean schema initialization:
```powershell
cd E:\code_engine\judge0
docker compose up -d db redis
Start-Sleep -Seconds 10
docker compose up -d
```

Verify service status:
```powershell
docker compose ps
```
