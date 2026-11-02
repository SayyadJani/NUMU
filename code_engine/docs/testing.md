# Judge0 CE Testing Specification & Test Suite

This document defines the 12 execution test cases used to validate local Judge0 CE reliability, sandbox isolation, limit enforcement, and error recovery.

## 1. Test Suite Architecture

The test suite is automated via `code_engine/scripts/test-execution.ps1`.
- **Dynamic Language Discovery**: Queries `/languages` at runtime to match Python 3 and C++ (GCC) IDs without hardcoding.
- **Payload Protocol**: Submits requests over REST to `POST /submissions?base64_encoded=false&wait=true` (or `wait=false` with polling).
- **Assertion Engine**: Evaluates HTTP status, Judge0 status ID, stdout, stderr, compile output, and execution timings.

---

## 2. Test Cases Matrix

| Test ID | Name | Language | Input / Parameters | Expected Status | Validation Criteria |
|---------|------|----------|-------------------|-----------------|---------------------|
| **T01** | Python Hello World | Python 3 | None | Accepted (3) | `stdout == "Hello from NUMU"` |
| **T02** | Python Arithmetic | Python 3 | `a = 10, b = 20` | Accepted (3) | `stdout == "30"` |
| **T03** | Python Stdin | Python 3 | `stdin = "21"` | Accepted (3) | `stdout == "42"` |
| **T04** | C++ Basic | C++ (GCC) | `stdin = "10 20"` | Accepted (3) | `stdout == "30"`, compilation succeeded |
| **T05** | Compilation Error | C++ (GCC) | Invalid syntax | Compilation Error (6) | `status.id == 6`, compiler diagnostics present |
| **T06** | Runtime Error | Python 3 | Division by zero | Runtime Error (11) | `status.id in [7..12]`, exception trace in `stderr` |
| **T07** | Wrong Output Detection | Python 3 | Prints `40` (target `42`) | Accepted (3) | Judge0 executes successfully; test harness flags output mismatch (WA) |
| **T08** | Time Limit Exceeded | Python 3 | Infinite loop (`cpu_time_limit: 1.0s`) | Time Limit Exceeded (5) | Process killed within limit, host healthy |
| **T09** | Memory Limit Check | Python 3 | Large allocation (`memory_limit: 15MB`) | Controlled Status | Resource controlled, no host exhaustion |
| **T10** | Repeated Submissions | Python 3 | 3 consecutive runs | Accepted (3) | Token isolation verified, no crosstalk |
| **T11** | Asynchronous Submissions | Python 3 | `wait=false` + sleep | Accepted (3) | Token returned, polled to terminal state |
| **T12** | Worker Recovery | Python 3 & C++ | Clean code post-errors | Accepted (3) | Both execute cleanly after CE/RE errors |

---

## 3. Separation of Concerns: Judge0 vs. NUMU Judging

In NUMU's problem-solving architecture:
- **Judge0's Responsibility**: Execute untrusted code safely within resource boundaries, measure memory and time, and capture process exit state (`stdout`, `stderr`, `status`).
- **NUMU's Responsibility**: Compare Judge0's actual `stdout` against hidden problem test cases to assign final verdicts (`Accepted`, `Wrong Answer`, `Presentation Error`). Test case T07 proves this boundary: Judge0 returns `Accepted (3)` because the program executed without runtime faults, while the judging harness identifies the output mismatch.
