<#
.SYNOPSIS
    check-environment.ps1 - Validates the local host environment for Judge0 CE.
.DESCRIPTION
    Checks Windows version, PowerShell version, Docker CLI, Docker Daemon,
    Docker Compose, WSL2 status, Judge0 deployment files, port 2358 availability,
    and system resources (RAM, CPU, and Disk).
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"

Write-Host "`n=== [1/6] Operating System & Shell ===" -ForegroundColor Cyan
Write-Host "OS: $((Get-CimInstance Win32_OperatingSystem).Caption) (Build $((Get-CimInstance Win32_OperatingSystem).BuildNumber))"
Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)"

Write-Host "`n=== [2/6] WSL 2 Environment ===" -ForegroundColor Cyan
try {
    $wslStatus = wsl.exe --status 2>&1 | Out-String
    Write-Host "WSL Status:`n$($wslStatus.Trim())"
    $wslDistros = wsl.exe --list --verbose 2>&1 | Out-String
    Write-Host "WSL Distributions:`n$($wslDistros.Trim())"
} catch {
    Write-Warning "Failed to query WSL status: $_"
}

Write-Host "`n=== [3/6] Docker & Compose Availability ===" -ForegroundColor Cyan
$dockerCliOk = $false
$dockerDaemonOk = $false
$composeOk = $false

try {
    $dockerVer = docker.exe --version
    Write-Host "Docker CLI: $dockerVer"
    $dockerCliOk = $true
} catch {
    Write-Error "Docker CLI is not found or not in PATH."
}

try {
    $composeVer = docker.exe compose version
    Write-Host "Docker Compose: $composeVer"
    $composeOk = $true
} catch {
    Write-Error "Docker Compose is not available."
}

try {
    $info = docker.exe info --format 'OS: {{.OperatingSystem}} | Containers: {{.Containers}} | ServerVersion: {{.ServerVersion}}' 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker Daemon: Healthy ($info)" -ForegroundColor Green
        $dockerDaemonOk = $true
    } else {
        Write-Error "Docker Daemon is not reachable: $info"
    }
} catch {
    Write-Error "Failed to query Docker daemon: $_"
}

Write-Host "`n=== [4/6] Port 2358 Availability ===" -ForegroundColor Cyan
$portInUse = $false
try {
    $conn = Test-NetConnection -ComputerName "127.0.0.1" -Port 2358 -WarningAction SilentlyContinue
    if ($conn.TcpTestSucceeded) {
        Write-Host "Port 2358 is currently active/open." -ForegroundColor Yellow
        $portInUse = $true
    } else {
        Write-Host "Port 2358 is free (ready for Judge0 API)." -ForegroundColor Green
    }
} catch {
    Write-Host "Could not test port 2358: $_"
}

Write-Host "`n=== [5/6] System Resources ===" -ForegroundColor Cyan
$os = Get-CimInstance Win32_OperatingSystem
$totalRamGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeRamGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
Write-Host "RAM: Total = $totalRamGB GB, Free = $freeRamGB GB"

$drives = Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{N='FreeGB'; E={[math]::Round($_.Free / 1GB, 2)}}, @{N='UsedGB'; E={[math]::Round($_.Used / 1GB, 2)}}
Write-Host "Disks:"
$drives | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "`n=== [6/6] Judge0 Deployment Files ===" -ForegroundColor Cyan
$judge0Dir = Join-Path (Split-Path $PSScriptRoot -Parent) "judge0"
$composeFile = Join-Path $judge0Dir "docker-compose.yml"
$confFile = Join-Path $judge0Dir "judge0.conf"

$filesOk = $true
if (Test-Path $composeFile) {
    Write-Host "Found docker-compose.yml at: $composeFile" -ForegroundColor Green
} else {
    Write-Error "Missing: $composeFile"
    $filesOk = $false
}

if (Test-Path $confFile) {
    Write-Host "Found judge0.conf at: $confFile" -ForegroundColor Green
} else {
    Write-Error "Missing: $confFile"
    $filesOk = $false
}

Write-Host "`n=== Environment Summary ===" -ForegroundColor Cyan
if ($dockerCliOk -and $composeOk -and $dockerDaemonOk -and $filesOk) {
    Write-Host "Environment check PASSED: System is ready for Judge0 CE deployment." -ForegroundColor Green
    exit 0
} else {
    Write-Host "Environment check FAILED: Some prerequisites are not satisfied." -ForegroundColor Red
    exit 1
}
