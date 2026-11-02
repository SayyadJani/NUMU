# Judge0 CE API Contract Specification

**Document Version:** 1.0.0  
**Judge0 Target Version:** Community Edition (CE) v1.13.1  
**Official API Reference:** [https://ce.judge0.com/](https://ce.judge0.com/)  
**Local Baseline Endpoint:** `http://127.0.0.1:2358`  
**Payload Encoding Standard:** Base64 Encoded (`base64_encoded=true`)  

---

## 1. Overview & Transport Protocol

Judge0 exposes a standard RESTful HTTP interface. 

### Encoding Protocol Standard: Base64
In Phase 4C testing, GCC and Clang compilers generated Unicode quotes (such as curved single quotes `‘` and `’`) in error diagnostics. Standard non-base64 requests caused Ruby on Rails UTF-8 serialization errors.
**Standard for NUMU Integration:** All submission requests and result queries **MUST** pass `?base64_encoded=true`.
- NestJS must encode `source_code` and `stdin` as Base64 strings.
- NestJS must decode `stdout`, `stderr`, and `compile_output` from Base64 into UTF-8 strings upon retrieval.

---

## 2. API Endpoints Specification

### 2.1 Language Discovery & Health Probe

#### `GET /languages`
Discovers all supported language runtimes, their compiler toolchains, and runtime IDs on the target Judge0 installation.

- **URL:** `http://127.0.0.1:2358/languages`
- **Method:** `GET`
- **Headers:** `Accept: application/json`
- **Authentication:** None (Local Dev) / `X-Auth-Token` (Production)

#### Response: `200 OK`
```json
[
  {
    "id": 71,
    "name": "Python (3.8.1)"
  },
  {
    "id": 52,
    "name": "C++ (GCC 7.4.0)"
  },
  {
    "id": 54,
    "name": "C++ (GCC 9.2.0)"
  },
  {
    "id": 62,
    "name": "Java (OpenJDK 13.0.1)"
  },
  {
    "id": 63,
    "name": "JavaScript (Node.js 12.14.0)"
  },
  {
    "id": 74,
    "name": "TypeScript (3.7.4)"
  }
]
```

#### Key Integration Rules:
1. **Dynamic Verification:** Language IDs are **not** guaranteed to be stable across major Judge0 releases. NUMU must verify the mapping on backend initialization or deployment.
2. **Health Probe:** A successful `200 OK` from `/languages` is used by NUMU as a heartbeat to verify execution engine reachability.

---

### 2.2 Create Submission (Asynchronous Dispatch)

#### `POST /submissions?base64_encoded=true&wait=false`
Submits source code for compilation and sandboxed execution.

- **URL:** `http://127.0.0.1:2358/submissions?base64_encoded=true&wait=false`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

#### Request Payload Specification

| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `language_id` | Integer | **Yes** | — | Unique ID of the execution environment (e.g. `71`). |
| `source_code` | String | **Yes** | — | Base64-encoded user code string. |
| `stdin` | String | No | `""` | Base64-encoded standard input string. |
| `expected_output` | String | No | `null` | Base64-encoded expected stdout (Omitted in NUMU; NUMU handles evaluation). |
| `cpu_time_limit` | Float | No | `5.0` | Maximum CPU time in seconds before SIGXCPU / TLE. |
| `cpu_extra_time` | Float | No | `1.0` | Grace time in seconds before SIGKILL. |
| `wall_time_limit` | Float | No | `10.0` | Total wall-clock time limit in seconds. |
| `memory_limit` | Integer | No | `128000` | Maximum memory limit in Kilobytes (KB). |
| `stack_limit` | Integer | No | `64000` | Maximum stack size in Kilobytes (KB). |
| `max_processes_and_or_threads` | Integer | No | `60` | Maximum concurrent threads or processes. |
| `enable_per_process_and_thread_time_limit` | Boolean | No | `true` | Enforces POSIX setrlimit time containment. |
| `enable_per_process_and_thread_memory_limit` | Boolean | No | `true` | Enforces POSIX setrlimit memory containment. |
| `max_file_size` | Integer | No | `1024` | Maximum file output size in Kilobytes (KB). |
| `compiler_options` | String | No | `null` | Custom compiler flags (restricted by NUMU backend). |
| `command_line_arguments` | String | No | `null` | Command line arguments passed to the program. |

#### Example Request Body
```json
{
  "language_id": 71,
  "source_code": "cHJpbnQoIkhlbGxvIGZyb20gTlVNVSIp",
  "stdin": "",
  "cpu_time_limit": 2.0,
  "memory_limit": 128000
}
```

#### Success Response: `201 Created`
```json
{
  "token": "7b09bf9e-bf33-4f51-b072-463d1bc81d6f"
}
```

#### Error Responses
- **`400 Bad Request`:** Missing required parameter or invalid JSON syntax.
  ```json
  { "error": "language_id is required" }
  ```
- **`422 Unprocessable Entity`:** Unsupported `language_id` or invalid parameter constraints.
  ```json
  { "error": "language_id 999 does not exist" }
  ```
- **`429 / 503 Service Unavailable`:** Redis queue is saturated or worker thread pool exhausted.
- **`500 Internal Server Error`:** Unhandled Rails exception.

#### Production Warning: Avoid `wait=true`
> [!WARNING]
> In production, `wait=true` causes the client HTTP request to hang open until compilation and execution finish. This quickly exhausts NestJS connection pools and creates head-of-line blocking. The asynchronous token pattern (`wait=false`) is **mandatory** for high-volume execution.

---

### 2.3 Retrieve Submission Result

#### `GET /submissions/{token}?base64_encoded=true`
Fetches the status and results of a previously created submission.

- **URL:** `http://127.0.0.1:2358/submissions/:token?base64_encoded=true`
- **Method:** `GET`
- **Path Parameter:** `token` (UUID string returned by submission creation)

#### Response Specification (Terminal State)
```json
{
  "token": "7b09bf9e-bf33-4f51-b072-463d1bc81d6f",
  "status_id": 3,
  "status": {
    "id": 3,
    "description": "Accepted"
  },
  "stdout": "SGVsbG8gZnJvbSBOVU1VCg==",
  "stderr": null,
  "compile_output": null,
  "message": null,
  "exit_code": 0,
  "exit_signal": null,
  "time": "0.082",
  "wall_time": "0.114",
  "memory": 7892,
  "created_at": "2026-10-17T12:00:00.000Z",
  "finished_at": "2026-10-17T12:00:00.120Z"
}
```

#### Field State Transitions (Pending vs Terminal)

| Field Name | Type | In Queue (1) / Processing (2) | Terminal States (>= 3) |
| :--- | :--- | :--- | :--- |
| `token` | String | Present (UUID) | Present (UUID) |
| `status_id` | Integer | `1` or `2` | `3` through `14` |
| `status.description` | String | `"In Queue"` or `"Processing"` | Terminal description string |
| `stdout` | String \| null | `null` | Base64 string or `null` |
| `stderr` | String \| null | `null` | Base64 string or `null` |
| `compile_output` | String \| null | `null` | Base64 string or `null` |
| `exit_code` | Integer \| null | `null` | Process return code (e.g. `0`, `1`) |
| `time` | String \| null | `null` | CPU time in seconds (e.g. `"0.045"`) |
| `memory` | Integer \| null| `null` | Peak memory in Kilobytes (KB) |
| `finished_at` | String \| null | `null` | ISO-8601 completion timestamp |

---

## 3. Status Code Reference Table

Judge0 categorizes execution progress and final outcomes via numerical `status.id`:

| Status ID | Status Description | Processing Category | NUMU Normalized Interpretation |
| :---: | :--- | :---: | :--- |
| **1** | `In Queue` | Non-Terminal | Submission waiting for worker pickup. Continue polling. |
| **2** | `Processing` | Non-Terminal | Worker is compiling/executing code. Continue polling. |
| **3** | `Accepted` | **Terminal** | Process exited 0 within limits. Evaluate output in NUMU. |
| **4** | `Wrong Answer` | **Terminal** | Internal Judge0 comparator failure (Bypassed by NUMU). |
| **5** | `Time Limit Exceeded` | **Terminal** | Program exceeded `cpu_time_limit` or `wall_time_limit`. |
| **6** | `Compilation Error` | **Terminal** | Compiler exited non-zero. Check `compile_output`. |
| **7** | `Runtime Error (SIGSEGV)` | **Terminal** | Segmentation fault (Invalid memory access). |
| **8** | `Runtime Error (SIGXFSZ)` | **Terminal** | File size limit exceeded. |
| **9** | `Runtime Error (SIGFPE)` | **Terminal** | Floating point exception (Divide by zero). |
| **10** | `Runtime Error (SIGABRT)` | **Terminal** | Process aborted (e.g. assertion failure). |
| **11** | `Runtime Error (NZEC)` | **Terminal** | Non-zero exit code (e.g. unhandled Python exception). |
| **12** | `Runtime Error (Other)` | **Terminal** | Miscellaneous runtime fault. |
| **13** | `Internal Error` | **Terminal** | Sandbox failure, cgroup error, or engine failure. |
| **14** | `Exec Format Error` | **Terminal** | Binary incompatible with sandbox architecture. |

---

## 4. Authentication & Security Contract

### Local Development
- Currently unauthenticated over host loopback (`http://127.0.0.1:2358`).
- Safe because the port is explicitly bound to `127.0.0.1` and unreachable outside the machine.

### Future Production Configuration
- **Header Token:** When `AUTH_TOKEN` is configured in `judge0.conf`, all requests must supply:
  ```http
  X-Auth-Token: <SECURE_HIGH_ENTROPY_TOKEN>
  ```
- **Reverse Proxy Protection:** In cloud deployments, Judge0 should sit behind an NGINX or Envoy sidecar enforcing mTLS and rate limits.
- **Credential Storage:** Secrets must be stored in NestJS environment variables or cloud secret managers (AWS Secrets Manager / Vault), never hardcoded.
