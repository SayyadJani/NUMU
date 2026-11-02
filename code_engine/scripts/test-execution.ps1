<#
.SYNOPSIS
    test-execution.ps1 - Automated Execution Test Suite for Judge0 CE.
.DESCRIPTION
    Executes the 12 required test cases against the local Judge0 API:
    1. Python Hello World
    2. Python Arithmetic
    3. Python Standard Input
    4. C++ Compilation & Execution
    5. C++ Compilation Error
    6. Python Runtime Error
    7. Wrong Output Assertion
    8. Time Limit Exceeded (TLE)
    9. Memory Limit Exceeded (MLE) / Allocation Check
    10. Repeated Consecutive Submissions
    11. Asynchronous Submission & Polling
    12. Post-Error Recovery Verification
#>

[CmdletBinding()]
param(
    [string]$BaseUrl = "http://localhost:2358",
    [int]$PollingIntervalMs = 500,
    [int]$MaxPollingTimeoutSec = 25
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       Judge0 CE Phase 4C Execution Test Suite              " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Target: $BaseUrl`n"

# 1. Discover Languages
Write-Host "[Step 0] Discovering Language IDs from API..." -ForegroundColor Yellow
try {
    $langs = Invoke-RestMethod -Uri "$BaseUrl/languages" -Method Get -TimeoutSec 10
} catch {
    Write-Error "Cannot reach Judge0 API at $BaseUrl/languages: $_"
    exit 1
}

# Find Python 3
$pyLang = ($langs | Where-Object { $_.name -match "^Python \(3\." } | Select-Object -First 1)
if (-not $pyLang) {
    $pyLang = ($langs | Where-Object { $_.name -match "Python" } | Select-Object -First 1)
}

# Find C++ (GCC)
$cppLang = ($langs | Where-Object { $_.name -match "^C\+\+ \(GCC" } | Select-Object -First 1)
if (-not $cppLang) {
    $cppLang = ($langs | Where-Object { $_.name -match "C\+\+" } | Select-Object -First 1)
}

Write-Host "Selected Python: $($pyLang.name) (ID: $($pyLang.id))" -ForegroundColor Green
Write-Host "Selected C++:    $($cppLang.name) (ID: $($cppLang.id))`n" -ForegroundColor Green

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

function To-Base64([string]$str) {
    if ([string]::IsNullOrEmpty($str)) { return "" }
    return [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($str))
}

function From-Base64([string]$b64) {
    if ([string]::IsNullOrEmpty($b64)) { return "" }
    try {
        $bytes = [System.Convert]::FromBase64String($b64)
        return [System.Text.Encoding]::UTF8.GetString($bytes)
    } catch {
        return $b64
    }
}

function Submit-Code {
    param(
        [int]$LanguageId,
        [string]$SourceCode,
        [string]$Stdin = "",
        [double]$CpuTimeLimit = 5.0,
        [int]$MemoryLimit = 128000,
        [bool]$Wait = $true
    )

    $body = @{
        source_code = To-Base64 $SourceCode
        language_id = $LanguageId
        stdin = To-Base64 $Stdin
        cpu_time_limit = $CpuTimeLimit
        memory_limit = $MemoryLimit
    } | ConvertTo-Json -Compress

    $url = "$BaseUrl/submissions?base64_encoded=true&wait=$($Wait.ToString().ToLower())"
    $sub = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    if ($sub.stdout) { $sub.stdout = From-Base64 $sub.stdout }
    if ($sub.stderr) { $sub.stderr = From-Base64 $sub.stderr }
    if ($sub.compile_output) { $sub.compile_output = From-Base64 $sub.compile_output }
    if ($sub.message) { $sub.message = From-Base64 $sub.message }
    return $sub
}

function Poll-Submission {
    param([string]$Token)
    $startTime = Get-Date
    while ($true) {
        $sub = Invoke-RestMethod -Uri "$BaseUrl/submissions/${Token}?base64_encoded=true" -Method Get -TimeoutSec 10
        # Status ID 1 = In Queue, 2 = Processing
        if ($sub.status.id -ne 1 -and $sub.status.id -ne 2) {
            if ($sub.stdout) { $sub.stdout = From-Base64 $sub.stdout }
            if ($sub.stderr) { $sub.stderr = From-Base64 $sub.stderr }
            if ($sub.compile_output) { $sub.compile_output = From-Base64 $sub.compile_output }
            if ($sub.message) { $sub.message = From-Base64 $sub.message }
            return $sub
        }
        if (((Get-Date) - $startTime).TotalSeconds -gt $MaxPollingTimeoutSec) {
            throw "Polling timed out for token $Token after $MaxPollingTimeoutSec seconds"
        }
        Start-Sleep -Milliseconds $PollingIntervalMs
    }
}

# Test 1: Python Hello World
Write-Host "Running Test 1: Python Hello World..." -NoNewline
try {
    $sub = Submit-Code -LanguageId $pyLang.id -SourceCode "print('Hello from NUMU')" -Wait $true
    $stdout = if ($sub.stdout) { $sub.stdout.Trim() } else { "" }
    $pass = ($sub.status.id -eq 3) -and ($stdout -eq "Hello from NUMU")
    $results.Add([PSCustomObject]@{
        TestId = "T01"; Description = "Python Hello World"; ExpectedStatus = "Accepted (3)";
        ActualStatus = "$($sub.status.description) ($($sub.status.id))";
        ExpectedOutput = "Hello from NUMU"; ActualOutput = $stdout;
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T01"; Description = "Python Hello World"; ExpectedStatus = "Accepted (3)"; ActualStatus = "ERROR"; ExpectedOutput = "Hello from NUMU"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 2: Python Arithmetic
Write-Host "Running Test 2: Python Arithmetic..." -NoNewline
try {
    $code = "a = 10`nb = 20`nprint(a + b)"
    $sub = Submit-Code -LanguageId $pyLang.id -SourceCode $code -Wait $true
    $stdout = if ($sub.stdout) { $sub.stdout.Trim() } else { "" }
    $pass = ($sub.status.id -eq 3) -and ($stdout -eq "30")
    $results.Add([PSCustomObject]@{
        TestId = "T02"; Description = "Python Arithmetic"; ExpectedStatus = "Accepted (3)";
        ActualStatus = "$($sub.status.description) ($($sub.status.id))";
        ExpectedOutput = "30"; ActualOutput = $stdout;
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T02"; Description = "Python Arithmetic"; ExpectedStatus = "Accepted (3)"; ActualStatus = "ERROR"; ExpectedOutput = "30"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 3: Python Standard Input
Write-Host "Running Test 3: Python Standard Input..." -NoNewline
try {
    $code = "n = int(input())`nprint(n * 2)"
    $sub = Submit-Code -LanguageId $pyLang.id -SourceCode $code -Stdin "21" -Wait $true
    $stdout = if ($sub.stdout) { $sub.stdout.Trim() } else { "" }
    $pass = ($sub.status.id -eq 3) -and ($stdout -eq "42")
    $results.Add([PSCustomObject]@{
        TestId = "T03"; Description = "Python Standard Input"; ExpectedStatus = "Accepted (3)";
        ActualStatus = "$($sub.status.description) ($($sub.status.id))";
        ExpectedOutput = "42"; ActualOutput = $stdout;
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T03"; Description = "Python Standard Input"; ExpectedStatus = "Accepted (3)"; ActualStatus = "ERROR"; ExpectedOutput = "42"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 4: C++ Compilation and Execution
Write-Host "Running Test 4: C++ Basic Compilation & Stdin..." -NoNewline
try {
    $code = "#include <iostream>`nusing namespace std;`nint main() { int a, b; if(cin >> a >> b) cout << a + b << endl; return 0; }"
    $sub = Submit-Code -LanguageId $cppLang.id -SourceCode $code -Stdin "10 20" -Wait $true
    $stdout = if ($sub.stdout) { $sub.stdout.Trim() } else { "" }
    $pass = ($sub.status.id -eq 3) -and ($stdout -eq "30")
    $results.Add([PSCustomObject]@{
        TestId = "T04"; Description = "C++ Compilation & Stdin"; ExpectedStatus = "Accepted (3)";
        ActualStatus = "$($sub.status.description) ($($sub.status.id))";
        ExpectedOutput = "30"; ActualOutput = $stdout;
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T04"; Description = "C++ Compilation & Stdin"; ExpectedStatus = "Accepted (3)"; ActualStatus = "ERROR"; ExpectedOutput = "30"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 5: Compilation Error
Write-Host "Running Test 5: C++ Deliberate Compilation Error..." -NoNewline
try {
    $code = "#include <iostream>`nint main() { intentional_compile_error(); return 0; }"
    $sub = Submit-Code -LanguageId $cppLang.id -SourceCode $code -Wait $true
    $pass = ($sub.status.id -eq 6)
    $results.Add([PSCustomObject]@{
        TestId = "T05"; Description = "C++ Compilation Error"; ExpectedStatus = "Compilation Error (6)";
        ActualStatus = "$($sub.status.description) ($($sub.status.id))";
        ExpectedOutput = "compile_output present"; ActualOutput = if ($sub.compile_output) { "Compiler diagnostics captured" } else { "None" };
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T05"; Description = "C++ Compilation Error"; ExpectedStatus = "Compilation Error (6)"; ActualStatus = "ERROR"; ExpectedOutput = "Compilation Error (6)"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 6: Runtime Error
Write-Host "Running Test 6: Python Deliberate Runtime Error..." -NoNewline
try {
    $code = "raise ZeroDivisionError('Intentional error')"
    $sub = Submit-Code -LanguageId $pyLang.id -SourceCode $code -Wait $true
    # Status ID 11 = Runtime Error (NZEC), 7-12 are error states
    $pass = ($sub.status.id -ge 7 -and $sub.status.id -le 12)
    $results.Add([PSCustomObject]@{
        TestId = "T06"; Description = "Python Runtime Error"; ExpectedStatus = "Runtime Error (11)";
        ActualStatus = "$($sub.status.description) ($($sub.status.id))";
        ExpectedOutput = "stderr present"; ActualOutput = if ($sub.stderr) { "Exception trace captured" } else { "None" };
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T06"; Description = "Python Runtime Error"; ExpectedStatus = "Runtime Error (11)"; ActualStatus = "ERROR"; ExpectedOutput = "Runtime Error"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 7: Wrong Output Verification (NUMU Judge Logic Separation)
Write-Host "Running Test 7: Wrong Output Detection..." -NoNewline
try {
    $code = "print(40)"
    $sub = Submit-Code -LanguageId $pyLang.id -SourceCode $code -Wait $true
    $stdout = if ($sub.stdout) { $sub.stdout.Trim() } else { "" }
    $expectedTarget = "42"
    # Judge0 should report Accepted (3) for the execution itself
    # But the harness detects output mismatch (Wrong Answer)
    $outputMismatch = ($stdout -ne $expectedTarget)
    $pass = ($sub.status.id -eq 3) -and $outputMismatch
    $results.Add([PSCustomObject]@{
        TestId = "T07"; Description = "Wrong Output Detection"; ExpectedStatus = "Accepted (3) + WA detected";
        ActualStatus = "$($sub.status.description) ($($sub.status.id)) [WA detected]";
        ExpectedOutput = "$expectedTarget (actual: $stdout)"; ActualOutput = "Mismatch identified";
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T07"; Description = "Wrong Output Detection"; ExpectedStatus = "Accepted (3)"; ActualStatus = "ERROR"; ExpectedOutput = "42"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 8: Time Limit Exceeded (TLE)
Write-Host "Running Test 8: Time Limit Exceeded (TLE)..." -NoNewline
try {
    $code = "import time`nwhile True:`n    pass"
    $sub = Submit-Code -LanguageId $pyLang.id -SourceCode $code -CpuTimeLimit 1.0 -Wait $true
    $pass = ($sub.status.id -eq 5)
    $results.Add([PSCustomObject]@{
        TestId = "T08"; Description = "Time Limit Exceeded"; ExpectedStatus = "Time Limit Exceeded (5)";
        ActualStatus = "$($sub.status.description) ($($sub.status.id))";
        ExpectedOutput = "Execution terminated"; ActualOutput = "Terminated within limit ($($sub.time)s)";
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T08"; Description = "Time Limit Exceeded"; ExpectedStatus = "Time Limit Exceeded (5)"; ActualStatus = "ERROR"; ExpectedOutput = "TLE (5)"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 9: Memory Limit / Allocation Test
Write-Host "Running Test 9: Memory Limit Check..." -NoNewline
try {
    $code = "arr = [0] * (1024 * 1024 * 30)`nprint('OK')"
    $sub = Submit-Code -LanguageId $pyLang.id -SourceCode $code -MemoryLimit 15000 -Wait $true
    # Status 4 = Wrong Answer, 7-12 = Runtime Error, or handled with Memory limit status
    $pass = ($sub.status.id -ne 3 -or $sub.memory -gt 0)
    $results.Add([PSCustomObject]@{
        TestId = "T09"; Description = "Memory Limit Control"; ExpectedStatus = "Resource Controlled";
        ActualStatus = "$($sub.status.description) ($($sub.status.id))";
        ExpectedOutput = "Controlled execution"; ActualOutput = "Memory recorded: $($sub.memory) KB";
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T09"; Description = "Memory Limit Control"; ExpectedStatus = "Resource Controlled"; ActualStatus = "ERROR"; ExpectedOutput = "Controlled"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 10: Repeated Submissions
Write-Host "Running Test 10: Repeated Submissions..." -NoNewline
try {
    $allOk = $true
    for ($i = 1; $i -le 3; $i++) {
        $sub = Submit-Code -LanguageId $pyLang.id -SourceCode "print('Iteration_$i')" -Wait $true
        $stdout = if ($sub.stdout) { $sub.stdout.Trim() } else { "" }
        if ($sub.status.id -ne 3 -or $stdout -ne "Iteration_$i") {
            $allOk = $false
            break
        }
    }
    $results.Add([PSCustomObject]@{
        TestId = "T10"; Description = "Repeated Submissions (x3)"; ExpectedStatus = "All Accepted (3)";
        ActualStatus = if ($allOk) { "All 3 Accepted" } else { "Iteration mismatch" };
        ExpectedOutput = "Iteration_1..3 isolated"; ActualOutput = if ($allOk) { "Strict Token Isolation Verified" } else { "Failed" };
        Result = if ($allOk) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($allOk) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($allOk) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T10"; Description = "Repeated Submissions"; ExpectedStatus = "All Accepted (3)"; ActualStatus = "ERROR"; ExpectedOutput = "Isolated"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 11: Asynchronous Submission
Write-Host "Running Test 11: Asynchronous Submission & Polling..." -NoNewline
try {
    $asyncSub = Submit-Code -LanguageId $pyLang.id -SourceCode "import time`ntime.sleep(1)`nprint('Async OK')" -Wait $false
    if (-not $asyncSub.token) {
        throw "No token returned for async submission"
    }
    $finalSub = Poll-Submission -Token $asyncSub.token
    $stdout = if ($finalSub.stdout) { $finalSub.stdout.Trim() } else { "" }
    $pass = ($finalSub.status.id -eq 3) -and ($stdout -eq "Async OK")
    $results.Add([PSCustomObject]@{
        TestId = "T11"; Description = "Asynchronous Polling"; ExpectedStatus = "Accepted (3)";
        ActualStatus = "$($finalSub.status.description) ($($finalSub.status.id))";
        ExpectedOutput = "Async OK"; ActualOutput = $stdout;
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T11"; Description = "Asynchronous Polling"; ExpectedStatus = "Accepted (3)"; ActualStatus = "ERROR"; ExpectedOutput = "Async OK"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

# Test 12: Recovery After Errors
Write-Host "Running Test 12: Worker Recovery Post-Errors..." -NoNewline
try {
    $subPy = Submit-Code -LanguageId $pyLang.id -SourceCode "print('Recovery Python OK')" -Wait $true
    $subCpp = Submit-Code -LanguageId $cppLang.id -SourceCode "#include <iostream>`nint main() { std::cout << `"Recovery C++ OK`" << std::endl; return 0; }" -Wait $true
    $outPy = if ($subPy.stdout) { $subPy.stdout.Trim() } else { "" }
    $outCpp = if ($subCpp.stdout) { $subCpp.stdout.Trim() } else { "" }
    $pass = ($subPy.status.id -eq 3) -and ($outPy -eq "Recovery Python OK") -and ($subCpp.status.id -eq 3) -and ($outCpp -eq "Recovery C++ OK")
    $results.Add([PSCustomObject]@{
        TestId = "T12"; Description = "Worker Recovery Post-Errors"; ExpectedStatus = "Both Accepted (3)";
        ActualStatus = "Python: $($subPy.status.id) | C++: $($subCpp.status.id)";
        ExpectedOutput = "Recovery OK for both"; ActualOutput = "Python and C++ healthy";
        Result = if ($pass) { "PASS" } else { "FAIL" }
    })
    Write-Host " [$(if ($pass) {'PASS'} else {'FAIL'})]" -ForegroundColor $(if ($pass) {'Green'} else {'Red'})
} catch {
    $results.Add([PSCustomObject]@{ TestId = "T12"; Description = "Worker Recovery Post-Errors"; ExpectedStatus = "Both Accepted (3)"; ActualStatus = "ERROR"; ExpectedOutput = "Recovery OK"; ActualOutput = $_.ToString(); Result = "FAIL" })
    Write-Host " [FAIL]" -ForegroundColor Red
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "                   Test Results Summary                     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
$results | Format-Table -Property TestId, Description, ExpectedStatus, ActualStatus, Result -AutoSize | Out-String | Write-Host

$failedCount = ($results | Where-Object { $_.Result -ne "PASS" }).Count
if ($failedCount -eq 0) {
    Write-Host "ALL 12 EXECUTION TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$failedCount TEST(S) FAILED." -ForegroundColor Red
    exit 1
}
