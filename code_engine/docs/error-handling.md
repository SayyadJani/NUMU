# Error Handling & Reliability Engineering

**Document Version:** 1.0.0  
**Phase:** Phase 4D — Integration Readiness  
**Target:** NUMU NestJS Integration Layer & Fault Tolerance  

---

## 1. Resilience Architecture Overview

External execution engines are subject to network partitions, queue saturation, sandbox timeouts, and container crashes. The NUMU backend must be resilient against all failure modes without leaving submissions in perpetual zombie states or exhausting server resources.

```
+--------------------------------------------------------------------------------------------------+
|                                  ERROR CLASSIFICATION STRATEGY                                   |
|                                                                                                  |
|  1. CLIENT FAULTS (4xx):                                                                         |
|     - Invalid schema, code size too large, unsupported language, rate limit breached.            |
|     - ACTION: Reject immediately with descriptive error; no engine calls made.                   |
|                                                                                                  |
|  2. TRANSIENT INFRASTRUCTURE FAULTS:                                                             |
|     - Brief network blips, HTTP 502/503/504, Redis queue momentarily full.                     |
|     - ACTION: Bounded retry with exponential backoff and jitter (Max 3 attempts).                |
|                                                                                                  |
|  3. PERMANENT ENGINE FAULTS:                                                                     |
|     - Misconfigured credentials (401), invalid JSON syntax (400), sandbox internal crash (13).   |
|     - ACTION: Fail fast, mark submission SYSTEM_ERROR, alert operations team.                    |
|                                                                                                  |
|  4. EXECUTION TIMEOUTS:                                                                          |
|     - User code infinite loop, worker deadlock, polling deadline exceeded.                       |
|     - ACTION: Bounded polling deadline halts loop; marks submission POLLING_TIMEOUT or TLE.       |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Failure Modes & Recovery Matrix

| Failure Mode | Root Cause | Observable Symptom | NUMU Handling & Recovery Strategy |
| :--- | :--- | :--- | :--- |
| **Connection Refused (`ECONNREFUSED`)** | Docker container stopped or restarting. | Outgoing HTTP call throws `connect ECONNREFUSED 127.0.0.1:2358`. | Retry twice with 500ms delay. If still failing, mark submission `SYSTEM_ERROR` with message `"Execution service temporarily unavailable"`. Alert on-call. |
| **Dispatch Timeout** | High host load; Judge0 API server slow to respond. | HTTP request exceeds 5,000ms `AbortSignal`. | Do **NOT** blindly resubmit. Mark submission `DISPATCH_TIMEOUT`. Wait 5s before permitting client-side retry to prevent duplicate queue flooding. |
| **Authentication Failure (HTTP 401/403)** | `AUTH_TOKEN` mismatch between NestJS and Judge0. | HTTP 401 Unauthorized response. | Permanent failure. Log fatal configuration error with high-priority alert. Do **not** retry. |
| **Validation Error (HTTP 400/422)** | Unsupported `language_id` or malformed body. | HTTP 422 `{ "error": "..." }`. | Mark submission `VALIDATION_FAILED`. Log error payload for diagnostic review. |
| **Queue Full (HTTP 429 / 503)** | High concurrent traffic; Redis queue or workers saturated. | HTTP 429 Too Many Requests or 503 Service Unavailable. | Apply exponential backoff with jitter (e.g. 1s, 2s, 4s). If still full after 3 retries, return `429 System Busy` to client. |
| **Missing / Null Token in Response** | Malformed JSON or upstream proxy error. | Response 201 but `data.token` is undefined. | Mark submission `SYSTEM_ERROR`. Capture response body in debug log for audit. |
| **Polling Timeout (Zombie Prevention)** | Worker crashed or execution stuck in unkillable kernel sleep. | Status remains `1` or `2` after 60 poll iterations (30s). | **Halt polling loop.** Update submission status to `POLLING_TIMEOUT`. Release worker resources. Do not hang frontend request. |
| **Worker Crash During Execution** | Out of Memory killer terminated `judge0-workers-1`. | Status remains `2` (Processing) indefinitely. | Recovered by background sweep service checking all submissions stuck in `PROCESSING` for > 3 minutes. Marks them `SYSTEM_ERROR`. |
| **Database Crash After Dispatch** | NestJS DB connection drops after Judge0 accepts submission. | Judge0 token created but cannot be written to NUMU DB. | Log token and submissionId to high-priority fallback log file. Reconciliation cron matches orphaned tokens on DB reconnect. |
| **Null Output on Accepted Status** | Program produced no stdout (e.g. empty print). | `stdout` field is `null` or `""`. | Correctly treat as empty string `""`. Do not throw null pointer exception; comparator compares `""` against expected output. |

---

## 3. Polling & Retry Best Practices

### Recommended Bounded Polling Algorithm
```typescript
async function pollSubmissionWithDeadline(
  judge0Client: Judge0Client,
  token: string,
  maxAttempts = 60,
  intervalMs = 500
): Promise<Judge0SubmissionResult> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await judge0Client.getSubmission(token);
    
    // Status ID >= 3 indicates a terminal state (Accepted, CE, RE, TLE, etc.)
    if (result.status.id >= 3) {
      return result;
    }
    
    // Status is still 1 (In Queue) or 2 (Processing)
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  
  throw new ExecutionTimeoutException(
    `Submission ${token} exceeded maximum polling deadline of ${maxAttempts * intervalMs}ms`
  );
}
```

### Critical Rules
- **No Unbounded Polling:** Polling loops must have a hard stop (`maxAttempts`).
- **Structured Correlation IDs:** Every log entry must include `submissionId`, `userId`, `problemId`, and `judge0Token` to allow easy tracing across logs.
- **Redaction of User Code & Secrets:** Debug logs must never log raw authentication tokens. User source code should be truncated or hashed in production error logs.
