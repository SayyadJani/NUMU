<#
.SYNOPSIS
    verify-api.ps1 - Verifies the Judge0 CE REST API endpoint and language support.
.DESCRIPTION
    Tests connectivity to http://localhost:2358, validates /languages response schema,
    discovers Python and C++ language IDs, and checks API health.
#>

[CmdletBinding()]
param(
    [string]$BaseUrl = "http://localhost:2358"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Verifying Judge0 CE API at $BaseUrl ===" -ForegroundColor Cyan

# 1. Test Endpoint Connectivity
Write-Host "`n[1/3] Testing API Reachability..." -ForegroundColor Yellow
try {
    $langUrl = "$BaseUrl/languages"
    $response = Invoke-RestMethod -Uri $langUrl -Method Get -TimeoutSec 10
    Write-Host "Successfully connected to $langUrl" -ForegroundColor Green
} catch {
    Write-Error "Failed to reach Judge0 API at $langUrl. Error: $_"
    exit 1
}

# 2. Validate Response Structure & Discover Languages
Write-Host "`n[2/3] Validating /languages response..." -ForegroundColor Yellow
if (-not $response -or $response.Count -eq 0) {
    Write-Error "Invalid response: /languages returned an empty list."
    exit 1
}

Write-Host "Total languages available: $($response.Count)" -ForegroundColor Green

$pythonLangs = $response | Where-Object { $_.name -match "Python" }
$cppLangs = $response | Where-Object { $_.name -match "C\+\+" }

if (-not $pythonLangs) {
    Write-Error "Assertion Failed: Python not found in languages list."
    exit 1
}

if (-not $cppLangs) {
    Write-Error "Assertion Failed: C++ not found in languages list."
    exit 1
}

Write-Host "`nDiscovered Python Environments:" -ForegroundColor Cyan
$pythonLangs | Format-Table -Property id, name | Out-String | Write-Host

Write-Host "Discovered C++ Environments:" -ForegroundColor Cyan
$cppLangs | Format-Table -Property id, name | Out-String | Write-Host

# 3. Optional System Info
Write-Host "`n[3/3] Testing System / Version Endpoints..." -ForegroundColor Yellow
$endpoints = @("/system_info", "/about", "/version")
foreach ($ep in $endpoints) {
    try {
        $info = Invoke-RestMethod -Uri "$BaseUrl$ep" -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($info) {
            Write-Host "Endpoint $ep returned data:" -ForegroundColor Green
            $info | Format-List | Out-String | Write-Host
            break
        }
    } catch {
        # Optional endpoint, silent fallback
    }
}

Write-Host "`nAPI verification PASSED: Judge0 CE is reachable and supports required languages." -ForegroundColor Green
exit 0
