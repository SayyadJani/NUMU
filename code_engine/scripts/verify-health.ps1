<#
.SYNOPSIS
    verify-health.ps1 - Health and operational status check for Judge0 CE stack.
.DESCRIPTION
    Checks Docker container statuses, API connectivity, database, redis,
    worker health, and runs an end-to-end execution test.
#>

[CmdletBinding()]
param(
    [string]$BaseUrl = "http://localhost:2358"
)

$ErrorActionPreference = "Continue"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "            Judge0 CE Infrastructure Health Check           " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Container Status Check
Write-Host "`n[1/5] Inspecting Docker Compose Containers..." -ForegroundColor Yellow
$judge0Dir = Join-Path (Split-Path $PSScriptRoot -Parent) "judge0"
Push-Location $judge0Dir
try {
    $psOutput = docker.exe compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>&1 | Out-String
    Write-Host $psOutput.Trim()
} finally {
    Pop-Location
}

# 2. Redis and Database Container Verification
Write-Host "`n[2/5] Checking Redis & PostgreSQL Status..." -ForegroundColor Yellow
Push-Location $judge0Dir
try {
    $dbLog = docker.exe compose logs --tail=10 db 2>&1 | Out-String
    $redisLog = docker.exe compose logs --tail=10 redis 2>&1 | Out-String
    
    if ($dbLog -match "ready to accept connections|database system is ready") {
        Write-Host "PostgreSQL: Ready and accepting connections." -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL status from logs:`n$($dbLog.Trim())" -ForegroundColor Gray
    }

    if ($redisLog -match "Ready to accept connections") {
        Write-Host "Redis: Ready and accepting connections." -ForegroundColor Green
    } else {
        Write-Host "Redis status from logs:`n$($redisLog.Trim())" -ForegroundColor Gray
    }
} finally {
    Pop-Location
}

# 3. Worker Container Logs
Write-Host "`n[3/5] Checking Worker Status..." -ForegroundColor Yellow
Push-Location $judge0Dir
try {
    $workerLog = docker.exe compose logs --tail=10 workers 2>&1 | Out-String
    Write-Host "Workers log snippet:`n$($workerLog.Trim())" -ForegroundColor Gray
} finally {
    Pop-Location
}

# 4. API Health Check
Write-Host "`n[4/5] Testing API Server Endpoint ($BaseUrl)..." -ForegroundColor Yellow
$apiOk = $false
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/languages" -Method Get -TimeoutSec 10
    if ($res -and $res.Count -gt 0) {
        Write-Host "API Server: Responsive (Returned $($res.Count) languages)" -ForegroundColor Green
        $apiOk = $true
    }
} catch {
    Write-Error "API Server is not responding at ${BaseUrl}: $_"
}

# 5. End-to-End Submission Test
Write-Host "`n[5/5] Executing End-to-End Sanity Submission..." -ForegroundColor Yellow
$e2eOk = $false
if ($apiOk) {
    try {
        $body = @{
            source_code = "print('Judge0 Health Sanity Check OK')"
            language_id = 71 # Python (3.8.1) or general Python
        }
        # Find actual Python ID from $res
        $py = $res | Where-Object { $_.name -match "Python \(3\." } | Select-Object -First 1
        if ($py) { $body.language_id = $py.id }

        $jsonBody = $body | ConvertTo-Json
        $sub = Invoke-RestMethod -Uri "$BaseUrl/submissions?base64_encoded=false&wait=true" -Method Post -Body $jsonBody -ContentType "application/json" -TimeoutSec 15
        if ($sub.status.id -eq 3 -and $sub.stdout -match "Judge0 Health Sanity Check OK") {
            Write-Host "End-to-End Execution: SUCCESS (Accepted in $($sub.time)s)" -ForegroundColor Green
            $e2eOk = $true
        } else {
            Write-Host "End-to-End Execution: Unexpected status $($sub.status.description)" -ForegroundColor Red
        }
    } catch {
        Write-Error "End-to-End sanity check failed: $_"
    }
}

Write-Host "`n============================================================" -ForegroundColor Cyan
if ($apiOk -and $e2eOk) {
    Write-Host "Judge0 CE Stack Health: HEALTHY & OPERATIONAL" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Judge0 CE Stack Health: DEGRADED OR UNHEALTHY" -ForegroundColor Red
    exit 1
}
