# Judge0 Test Suite Cases

This directory contains test cases designed to validate Judge0 CE local execution:

| File | Language | Purpose | Expected Status |
|------|----------|---------|-----------------|
| `python-hello.py` | Python 3 | Basic stdout verification | Accepted (3) |
| `python-arithmetic.py` | Python 3 | Basic computation | Accepted (3) |
| `python-stdin.py` | Python 3 | Standard input handling | Accepted (3) |
| `cpp-basic.cpp` | C++ (GCC) | C++ compilation & stdin/stdout | Accepted (3) |
| `cpp-ce.cpp` | C++ (GCC) | Deliberate compilation error | Compilation Error (6) |
| `python-re.py` | Python 3 | Deliberate exception | Runtime Error (NZEC / 11) |
| `python-tle.py` | Python 3 | Nonterminating loop with CPU limit | Time Limit Exceeded (5) |
| `python-mle.py` | Python 3 | Large memory allocation | Memory Limit / Controlled |

All test cases are invoked automatically by `scripts/test-execution.ps1`.
