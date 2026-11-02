# NUMU Phase 4A — API Contracts & Endpoint Specifications

## 1. Executive Summary

This document specifies the REST API contracts for Phase 4: Code Submissions and Execution. It adheres to the established NestJS conventions in `apps/api` (global prefix `/api/v1`, `class-validator` DTOs, Swagger documentation, and HttpOnly cookie / Bearer JWT authorization).

---

## 2. API Conventions & Standards

1. **Base URL**: `/api/v1/submissions`
2. **Authentication**: Handled by `JwtAuthGuard`. Accepts either the `Authorization: Bearer <token>` header or the HttpOnly `numu_access_token` cookie.
3. **Payload Formats**: All request and response bodies use `application/json`.
4. **Validation**: Enforced via NestJS `ValidationPipe`:
   ```typescript
   new ValidationPipe({
     whitelist: true,
     transform: true,
     forbidNonWhitelisted: true,
   })
   ```
5. **Standard Error Responses**:
   - `400 Bad Request`: Validation failure or malformed payload.
   - `401 Unauthorized`: Missing or invalid authentication token.
   - `403 Forbidden`: Cross-user access or insufficient role.
   - `404 Not Found`: Problem or submission does not exist.
   - `429 Too Many Requests`: Rate limit exceeded via `@nestjs/throttler`.

---

## 3. Proposed Endpoints

### 3.1 `POST /api/v1/submissions/run` (Ephemeral Code Run)
- **Purpose**: Runs code against problem examples or custom user inputs. Does not persist a permanent submission record.
- **Authentication**: Required (`JwtAuthGuard`). Any authenticated user.
- **Rate Limit**: Max 10 runs per minute per user (`@Throttle({ default: { limit: 10, ttl: 60000 } })`).

#### Request Body (`RunCodeDto`)
```json
{
  "problemSlug": "two-sum",
  "language": "python",
  "code": "class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]",
  "customInput": "nums = [2,7,11,15], target = 9"
}
```

#### Validation Rules (`RunCodeDto`)
- `problemSlug`: `string` (`@IsNotEmpty()`, `@IsString()`)
- `language`: `string` (`@IsEnum(['python', 'javascript', 'typescript', 'cpp', 'java'])`)
- `code`: `string` (`@IsNotEmpty()`, `@MaxLength(65535)`)
- `customInput`: optional `string` (`@IsOptional()`, `@MaxLength(10000)`)

#### Response Body (`200 OK`)
```json
{
  "status": "COMPLETED",
  "verdict": "ACCEPTED",
  "runtimeMs": 35,
  "memoryKb": 14200,
  "stdout": "[0, 1]\n",
  "stderr": null,
  "compileError": null,
  "expectedOutput": "[0, 1]",
  "userOutput": "[0, 1]",
  "isMatch": true
}
```

---

### 3.2 `POST /api/v1/submissions` (Formal Code Submission)
- **Purpose**: Submits code for comprehensive evaluation against all problem test cases (sample and hidden). Creates a persistent `Submission` record with `QUEUED` status and triggers execution.
- **Authentication**: Required (`JwtAuthGuard`). Any authenticated user.
- **Rate Limit**: Max 5 submissions per minute per user.

#### Request Body (`SubmitCodeDto`)
```json
{
  "problemSlug": "two-sum",
  "language": "python",
  "code": "class Solution:\n    def twoSum(self, nums, target):\n        lookup = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in lookup:\n                return [lookup[diff], i]\n            lookup[n] = i\n        return []"
}
```

#### Validation Rules (`SubmitCodeDto`)
- `problemSlug`: `string` (`@IsNotEmpty()`, `@IsString()`)
- `language`: `string` (`@IsEnum(['python', 'javascript', 'typescript', 'cpp', 'java'])`)
- `code`: `string` (`@IsNotEmpty()`, `@MaxLength(65535)`)

#### Response Body (`201 Created`)
```json
{
  "id": "sub_cm7a1bc8f0001...",
  "problemSlug": "two-sum",
  "language": "python",
  "status": "QUEUED",
  "verdict": "PENDING",
  "createdAt": "2026-10-16T12:00:00.000Z"
}
```

---

### 3.3 `GET /api/v1/submissions/:id` (Submission Status & Result)
- **Purpose**: Retrieves current execution state and terminal verdict for a specific submission. Polled by frontend until status is `COMPLETED` or `FAILED`.
- **Authentication**: Required (`JwtAuthGuard`).
- **Authorization**:
  - `submission.userId === currentUser.id` (Owner) OR `currentUser.role === 'PLATFORM_ADMIN'` / `'TRAINER'`.
  - Non-owners receive `403 Forbidden` if attempting to view private source code or error logs.

#### Response Body (`200 OK`) — When Processing
```json
{
  "id": "sub_cm7a1bc8f0001...",
  "problemSlug": "two-sum",
  "language": "python",
  "status": "PROCESSING",
  "verdict": "PENDING",
  "testsPassed": 12,
  "totalTests": 24,
  "createdAt": "2026-10-16T12:00:00.000Z"
}
```

#### Response Body (`200 OK`) — When Terminal
```json
{
  "id": "sub_cm7a1bc8f0001...",
  "problemSlug": "two-sum",
  "language": "python",
  "status": "COMPLETED",
  "verdict": "ACCEPTED",
  "runtimeMs": 42,
  "memoryKb": 16400,
  "testsPassed": 24,
  "totalTests": 24,
  "compileError": null,
  "createdAt": "2026-10-16T12:00:00.000Z",
  "updatedAt": "2026-10-16T12:00:02.000Z"
}
```

#### Response Body (`200 OK`) — Compilation Error Example
```json
{
  "id": "sub_cm7a1bc8f0002...",
  "problemSlug": "two-sum",
  "language": "cpp",
  "status": "COMPLETED",
  "verdict": "COMPILATION_ERROR",
  "runtimeMs": null,
  "memoryKb": null,
  "testsPassed": 0,
  "totalTests": 24,
  "compileError": "solution.cpp: In member function 'twoSum':\nsolution.cpp:5:10: error: 'target' was not declared in this scope",
  "createdAt": "2026-10-16T12:05:00.000Z"
}
```

---

### 3.4 `GET /api/v1/submissions` (User Submission History)
- **Purpose**: Lists submissions made by the currently authenticated user with filtering and pagination.
- **Authentication**: Required (`JwtAuthGuard`).
- **Query Parameters**:
  - `page`: optional integer (default `1`)
  - `limit`: optional integer (default `20`, max `50`)
  - `problemSlug`: optional string filter
  - `verdict`: optional verdict filter (`ACCEPTED`, `WRONG_ANSWER`, etc.)

#### Response Body (`200 OK`)
```json
{
  "items": [
    {
      "id": "sub_cm7a1bc8f0001...",
      "problemSlug": "two-sum",
      "problemTitle": "Two Sum",
      "language": "python",
      "status": "COMPLETED",
      "verdict": "ACCEPTED",
      "runtimeMs": 42,
      "memoryKb": 16400,
      "testsPassed": 24,
      "totalTests": 24,
      "createdAt": "2026-10-16T12:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

---

### 3.5 `GET /api/v1/problems/:slug/submissions` (Problem-Specific Submissions)
- **Purpose**: Lists the current user's past submission attempts for the specific problem open in the workspace.
- **Authentication**: Required (`JwtAuthGuard`).
- **Response**: Array of submission summary items matching the user and problem slug.

---

## 4. Status Codes & Error Specifications

| Status Code | Scenario | Response Example |
|---|---|---|
| `400 Bad Request` | Code size > 64KB or invalid language | `{"statusCode": 400, "message": ["code must be shorter than or equal to 65535 characters"], "error": "Bad Request"}` |
| `401 Unauthorized` | Missing authentication cookie / header | `{"statusCode": 401, "message": "Authentication credentials missing"}` |
| `403 Forbidden` | Accessing another student's source code | `{"statusCode": 403, "message": "Forbidden resource"}` |
| `404 Not Found` | Problem slug or submission ID not found | `{"statusCode": 404, "message": "Problem with slug 'unknown' not found"}` |
| `429 Too Many Requests` | Rapid submission spamming | `{"statusCode": 429, "message": "ThrottlerException: Too Many Requests"}` |
