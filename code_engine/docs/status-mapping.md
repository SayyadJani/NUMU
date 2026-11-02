# Status & Verdict Normalization Mapping

**Document Version:** 1.0.0  
**Phase:** Phase 4D — Integration Readiness  
**Target:** NUMU NestJS Evaluation & Result Normalization Layer  

---

## 1. Three-Tiered Verdict Architecture

To prevent architectural confusion, NUMU divides status handling into three distinct abstraction tiers:

```
+--------------------------------------------------------------------------------------------------+
|                                  THREE STATUS EVALUATION TIERS                                   |
|                                                                                                  |
|  TIER 1: Judge0 Execution Status (Process Level)                                                  |
|    Did the compiler and sandbox complete execution without faulting?                             |
|    Examples: Accepted (3), Time Limit Exceeded (5), Compilation Error (6), NZEC (11)             |
|                                                                                                  |
|  TIER 2: NUMU Test-Case Verdict (Single Test Evaluation)                                         |
|    Did the execution output match the expected output for Test Case #k?                          |
|    Examples: PASSED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR                            |
|                                                                                                  |
|  TIER 3: NUMU Final Problem Verdict (Aggregate Submission Result)                                |
|    Did the user solve the entire problem across all public and hidden test cases?               |
|    Examples: ACCEPTED, WRONG_ANSWER, COMPILATION_ERROR, TIME_LIMIT_EXCEEDED                      |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Judge0 Status ID to NUMU Status Mapping Table

The following table provides the exact normalization logic between Judge0 CE v1.13.1 status codes and NUMU internal status enums:

| Judge0 Status ID | Judge0 Description | Category | NUMU Normalized Execution Status | NUMU Test-Case Verdict | NUMU Action / Handling |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **1** | `In Queue` | Non-Terminal | `IN_QUEUE` | *N/A (Pending)* | Continue asynchronous polling loop. |
| **2** | `Processing` | Non-Terminal | `PROCESSING` | *N/A (Pending)* | Continue asynchronous polling loop. |
| **3** | `Accepted` | **Terminal** | `EXECUTION_SUCCESS` | **`PASSED` or `WRONG_ANSWER`** | Compare stdout against expected output. |
| **4** | `Wrong Answer` | **Terminal** | `WRONG_ANSWER` | `WRONG_ANSWER` | Unused in NUMU; NUMU evaluates outputs. |
| **5** | `Time Limit Exceeded` | **Terminal** | `TIME_LIMIT_EXCEEDED` | `TIME_LIMIT_EXCEEDED` | Program killed by CPU or wall watchdog. |
| **6** | `Compilation Error` | **Terminal** | `COMPILATION_ERROR` | `COMPILATION_ERROR` | Compiler failed; capture `compile_output`. |
| **7** | `Runtime Error (SIGSEGV)` | **Terminal** | `RUNTIME_ERROR` | `RUNTIME_ERROR` | Invalid memory address / null pointer. |
| **8** | `Runtime Error (SIGXFSZ)` | **Terminal** | `RUNTIME_ERROR` | `RUNTIME_ERROR` | File size output limit exceeded. |
| **9** | `Runtime Error (SIGFPE)` | **Terminal** | `RUNTIME_ERROR` | `RUNTIME_ERROR` | Division by zero / arithmetic fault. |
| **10**| `Runtime Error (SIGABRT)` | **Terminal** | `RUNTIME_ERROR` | `RUNTIME_ERROR` | `abort()` called / assertion failed. |
| **11**| `Runtime Error (NZEC)` | **Terminal** | `RUNTIME_ERROR` | `RUNTIME_ERROR` | Non-zero exit code (e.g. Python exception). |
| **12**| `Runtime Error (Other)` | **Terminal** | `RUNTIME_ERROR` | `RUNTIME_ERROR` | Other unhandled Linux signals. |
| **13**| `Internal Error` | **Terminal** | `SYSTEM_ERROR` | `SYSTEM_ERROR` | Sandbox/isolate failure on host; alert ops. |
| **14**| `Exec Format Error` | **Terminal** | `COMPILATION_ERROR` | `COMPILATION_ERROR` | Binary format unexecutable. |

---

## 3. Run Mode vs. Submit Mode Workflow Details

| Feature / Behavior | Run Mode | Submit Mode |
| :--- | :--- | :--- |
| **User Objective** | Experimentation, debugging, fast custom input testing. | Official evaluation against problem requirements. |
| **Input Source** | Custom `stdin` provided by the user in the UI. | Official test suite (Public samples + Hidden test cases). |
| **Execution Count** | Exactly 1 execution dispatch. | $N$ executions (one per test case, sequential or batch). |
| **Execution Output** | Full `stdout`, `stderr`, and `compile_output` returned. | Sanitized summary; hidden inputs/outputs **never** leaked. |
| **Judging Logic** | None. Displays raw stdout/stderr as returned by engine. | Comparator checks actual stdout against expected output. |
| **Problem Statistics** | Does not alter user solved statistics or leaderboard. | Updates user solved count, submission history, profile stats. |
| **Completion Criteria**| Returns execution details regardless of program correctness. | Awards `ACCEPTED` only if **100% of test cases** pass. |

---

## 4. Test Case Comparator Specifications

When Judge0 returns `Accepted (Status 3)`, NUMU's evaluation engine executes the output comparison algorithm:

### Normalization Rules:
1. **Line Ending Agnostic:** Normalizes Windows CRLF (`\r\n`) and Linux LF (`\n`) to uniform `\n`.
2. **Trailing Whitespace Trimming:** Trims trailing spaces on each line and trailing blank lines at the end of output unless the problem explicitly enforces strict formatting.
3. **Floating Point Tolerance:** For mathematical problems with floating-point outputs, compares numerical difference against problem-specified epsilon (e.g. $|actual - expected| < 10^{-6}$).
4. **Short-Circuit Policy (Fail-Fast):**
   - By default, in Submit Mode, evaluation halts upon encountering the first failed test case (`WRONG_ANSWER`, `TLE`, or `RE`). This conserves Judge0 compute resources.
   - For educational feedback, NUMU can optionally execute all public sample cases before halting.
