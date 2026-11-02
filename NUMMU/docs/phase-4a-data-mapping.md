# NUMU Phase 4A — End-to-End Data Mapping & Entity Relationship Map

## 1. Executive Summary

This document specifies the end-to-end data lifecycle for Phase 4: Code Submissions and Execution. It traces data flow from user interaction in the frontend coding workspace through network transfer, NestJS DTO validation, service processing, and database persistence in PostgreSQL, concluding with asynchronous execution via the Judge0 execution provider.

---

## 2. End-to-End Field Traceability Matrix

The table below traces every data attribute across the execution pipeline:

`UI Component → Frontend Type → API Client → HTTP Endpoint → Controller → DTO/Validation → Service → Prisma Model → PostgreSQL Column`

| Domain Field | UI Component & State | Frontend Type (`@numu/types`) | API Client Method | HTTP Endpoint | DTO & Validation Rules | Backend Service Action | Prisma Model & Field | Database Column & Type | Visibility Classification |
|---|---|---|---|---|---|---|---|---|---|
| **Problem Slug** | Navigation params (`params.slug`) | `string` | `submitCode(slug, ...)` | `POST /api/v1/submissions` | `slug: string` (`@IsString()`) | Resolves problem ID & test cases | `Problem.slug` | `problems.slug VARCHAR(150)` | **Public** |
| **Problem ID** | Hidden from UI / derived | `string` (UUID) | Internal parameter | N/A (URL / DTO) | Validated UUID format | Foreign key association | `Submission.problemId` | `submissions.problem_id TEXT (FK)` | **Public** |
| **User ID** | Authenticated session | Extracted from cookie/JWT | N/A (Header/Cookie) | Injected via `@CurrentUser()` | Authenticated via `JwtAuthGuard` | Sets submission ownership | `Submission.userId` | `submissions.user_id TEXT (FK)` | **Private (Owner/Admin)** |
| **Programming Language** | Language dropdown selector | `SupportedLanguage` (`'python' \| 'javascript' \| 'typescript' \| 'cpp' \| 'java'`) | Request body `language` | `POST /api/v1/submissions` | `language: string` (`@IsEnum()`) | Maps to Judge0 Language ID | `Submission.language` | `submissions.language VARCHAR(30)` | **Public** |
| **Judge0 Language ID** | Internal runtime mapping | `number` | Derived on server | N/A (internal payload) | Server-side lookup table | Passed to Judge0 API | `Submission.judge0LanguageId` (optional) | `submissions.judge0_language_id INT` | **Internal** |
| **Submitted Code** | Monaco editor / textarea (`userCode`) | `string` | Request body `code` | `POST /api/v1/submissions` | `code: string` (`@IsNotEmpty()`, `@MaxLength(65535)`) | Persisted in DB; sent to Judge0 | `Submission.code` | `submissions.code TEXT` | **Private (Owner/Admin)** |
| **Custom Test Input** | Custom input drawer tab | `string \| undefined` | Request body `customInput` | `POST /api/v1/submissions/run` | `customInput?: string` (`@IsOptional()`, `@MaxLength(10000)`) | Used for ad-hoc execution; not saved | N/A (Ephemeral for Run) | N/A | **Private (User Only)** |
| **Submission ID** | Returned on creation | `string` | Response payload `id` | `POST /api/v1/submissions` / `GET .../:id` | UUID string | Generated via `@default(cuid())` | `Submission.id` | `submissions.id TEXT (PK)` | **Public / Private** |
| **Submission Status** | Status badge & spinner | `SubmissionStatus` (`'QUEUED' \| 'PROCESSING' \| 'COMPLETED' \| 'FAILED'`) | Response payload `status` | `GET /api/v1/submissions/:id` | Enum string | Updated as worker processes job | `Submission.status` | `submissions.status VARCHAR(30)` | **Public** |
| **Execution Verdict** | Verdict chip (`Accepted`, `WA`, etc.) | `SubmissionVerdict` (`'ACCEPTED' \| 'WRONG_ANSWER' \| ...`) | Response payload `verdict` | `GET /api/v1/submissions/:id` | Enum string | Determined by grading test outputs | `Submission.verdict` | `submissions.verdict VARCHAR(40)` | **Public** |
| **Execution Time** | "Runtime: 38 ms" indicator | `number \| null` (ms) | Response payload `runtimeMs` | `GET /api/v1/submissions/:id` | Integer or float | Max or sum time across test cases | `Submission.runtimeMs` | `submissions.runtime_ms INT` | **Public** |
| **Memory Consumption** | "Memory: 16.2 MB" indicator | `number \| null` (KB) | Response payload `memoryKb` | `GET /api/v1/submissions/:id` | Integer (KB) | Max memory used across test cases | `Submission.memoryKb` | `submissions.memory_kb INT` | **Public** |
| **Compile Errors** | Console error drawer | `string \| null` | Response payload `compileError` | `GET /api/v1/submissions/:id` | Sanitized error string | Captured from Judge0 `compile_output` | `Submission.compileError` | `submissions.compile_error TEXT` | **Private (Owner/Admin)** |
| **Standard Output** | Console stdout drawer | `string \| null` | Response payload `stdout` | `POST /api/v1/submissions/run` | Sanitized output string | Truncated to 4KB max | Ephemeral / `Submission.stdout` | `submissions.stdout TEXT` | **Private (Owner/Admin)** |
| **Standard Error** | Console stderr drawer | `string \| null` | Response payload `stderr` | `POST /api/v1/submissions/run` | Sanitized stderr string | Truncated to 4KB max | Ephemeral / `Submission.stderr` | `submissions.stderr TEXT` | **Private (Owner/Admin)** |
| **Tests Passed Count** | "24 / 24 test cases passed" | `number` | Response payload `testsPassed` | `GET /api/v1/submissions/:id` | Integer | Counter incremented on match | `Submission.testsPassed` | `submissions.tests_passed INT` | **Public** |
| **Total Test Count** | Total test cases in problem | `number` | Response payload `totalTests` | `GET /api/v1/submissions/:id` | Integer | Evaluated test cases count | `Submission.totalTests` | `submissions.total_tests INT` | **Public** |
| **Submission Timestamp** | Time ago ("2 mins ago") | `string \| Date` | Response payload `createdAt` | `GET /api/v1/submissions` | ISO Date String | Database timestamp | `Submission.createdAt` | `submissions.created_at TIMESTAMP` | **Public** |

---

## 3. Existing Models and Relationships (Verified)

### 3.1 `User` (`users` table)
- **Primary Key**: `id` (`TEXT`, `@default(cuid())`)
- **Key Fields**: `email` (unique), `username` (unique), `role` (`STUDENT`, `TRAINER`, `COLLEGE_ADMIN`, `PLATFORM_ADMIN`), `isActive`.
- **Existing Relations**: `authoredProblems`, `profile`, `refreshTokens`, `organizationMembers`.

### 3.2 `Problem` (`problems` table)
- **Primary Key**: `id` (`TEXT`, `@default(cuid())`)
- **Key Fields**: `slug` (unique), `title`, `difficulty` (`EASY`, `MEDIUM`, `HARD`), `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `description`, `constraints`, `hints`, `boilerplate` (JSON), `acceptanceRate`, `authorId`.
- **Existing Relations**: `author` (User), `topics` (ProblemTopic), `examples` (ProblemExample).

### 3.3 `ProblemExample` (`problem_examples` table)
- **Primary Key**: `id` (`TEXT`, `@default(cuid())`)
- **Key Fields**: `problemId` (FK -> `problems.id`), `input`, `output`, `explanation`, `order`.
- **Intended Purpose**: Illustrative examples shown in the problem description. **Not suitable for grading secret edge cases**.

---

## 4. Proposed Database Models for Phase 4 (Proposed)

To support code submissions and grading without corrupting public problem statements, the following models are proposed for addition in `schema.prisma` during Phase 4B:

### 4.1 `Submission` (`submissions` table)
Stores the record of a formal code submission.

```prisma
model Submission {
  id             String            @id @default(cuid())
  problemId      String            @map("problem_id")
  problem        Problem           @relation(fields: [problemId], references: [id], onDelete: Cascade)
  userId         String            @map("user_id")
  user           User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  language       String            @map("language") // 'python' | 'typescript' | 'cpp' | 'java' | etc.
  code           String            @db.Text
  status         SubmissionStatus  @default(QUEUED)
  verdict        SubmissionVerdict @default(PENDING)
  runtimeMs      Int?              @map("runtime_ms")
  memoryKb       Int?              @map("memory_kb")
  testsPassed    Int               @default(0) @map("tests_passed")
  totalTests     Int               @default(0) @map("total_tests")
  compileError   String?           @map("compile_error") @db.Text
  stdout         String?           @db.Text
  stderr         String?           @db.Text
  judge0Tokens   String[]          @default([]) @map("judge0_tokens")
  createdAt      DateTime          @default(now()) @map("created_at")
  updatedAt      DateTime          @updatedAt @map("updated_at")

  @@index([userId, problemId, createdAt(sort: Desc)])
  @@index([problemId, verdict])
  @@index([status])
  @@map("submissions")
}

enum SubmissionStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
}

enum SubmissionVerdict {
  PENDING
  ACCEPTED
  WRONG_ANSWER
  TIME_LIMIT_EXCEEDED
  MEMORY_LIMIT_EXCEEDED
  COMPILATION_ERROR
  RUNTIME_ERROR
  INTERNAL_ERROR
}
```

### 4.2 `ProblemTestCase` (`problem_test_cases` table)
Stores the test suites used by Judge0 to evaluate solutions.

```prisma
model ProblemTestCase {
  id             String   @id @default(cuid())
  problemId      String   @map("problem_id")
  problem        Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  input          String   @db.Text
  expectedOutput String   @map("expected_output") @db.Text
  isHidden       Boolean  @default(true) @map("is_hidden")
  orderIndex     Int      @default(0) @map("order_index")
  timeLimitMs    Int      @default(2000) @map("time_limit_ms")
  memoryLimitKb  Int      @default(262144) @map("memory_limit_kb") // 256MB default
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@index([problemId, isHidden, orderIndex])
  @@map("problem_test_cases")
}
```

### 4.3 Deletion and Retention Behavior
1. **User Deletion**: `User` ➔ `Submission` has `onDelete: Cascade`. If a user account is deleted, their personal submissions are purged.
2. **Problem Deletion**: `Problem` ➔ `Submission` and `ProblemTestCase` have `onDelete: Cascade`. Deleting a problem removes all associated test cases and submission records.
3. **Data Retention**: Ephemeral "Run Code" results are **never written** to `submissions`. Only formal "Submit" attempts are persisted.

---

## 5. Public, Private, and Internal Data Classification

To prevent security leaks, all execution-related fields are strictly categorized:

| Classification | Fields / Entities | Access Rules |
|---|---|---|
| **Public** | Problem title, problem slug, difficulty, acceptance rate, `ProblemExample` inputs/outputs, user submission verdict (`ACCEPTED`, etc.), submission timestamp, runtime, memory, tests passed count. | Anyone can view. Available on problem page, leaderboard, and public profile. |
| **Private (Owner / Admin)** | Submitted source code (`Submission.code`), compiler error logs (`compileError`), stdout/stderr, custom testcase inputs. | Only the author of the submission (`submission.userId === currentUser.id`) or a `PLATFORM_ADMIN` / `TRAINER` can view. |
| **Internal (Server-Only)** | `ProblemTestCase.input` (for hidden cases), `ProblemTestCase.expectedOutput` (for hidden cases), Judge0 submission tokens (`judge0Tokens`), Judge0 API credentials (`JUDGE0_API_KEY`). | **Never sent over public APIs**. Server-side workers and Judge0 adapters use these exclusively. |
