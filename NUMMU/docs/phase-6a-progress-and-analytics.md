# Phase 6A: Progress Tracking & Analytics Specification & Implementation Guide

## 1. Overview

Phase 6A implements student coding progress tracking and analytics for the NUMU developer platform. The system computes and exposes real-time statistics from persisted submission records and problem catalog metadata, powering student dashboards, skill analytics, and progress heatmaps without duplicating progress state.

---

## 2. Core Progress Calculation Rules

### A. Accepted Verdict & Solved Definition
- **Accepted Verdict Definition:** A submission is formally accepted when:
  ```ts
  status === 'COMPLETED' && verdict === 'ACCEPTED'
  ```
- **Unique Solved Rule:** A problem is counted as solved by a user if and only if there is at least one submission with `userId = currentUserId` and `verdict = 'ACCEPTED'`.
- **Deduplication:** Repeated accepted submissions for the same problem are deduplicated and counted at most once per user.
- **Failures Excluded:** Submissions with `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, `MEMORY_LIMIT_EXCEEDED`, `COMPILATION_ERROR`, `RUNTIME_ERROR`, `INTERNAL_ERROR`, or transient states (`QUEUED`, `PROCESSING`, `PENDING`) never count as solved.
- **Content Scope:** Aggregate progress metrics (overall and topics) evaluate against published problems (`status = ContentStatus.PUBLISHED`).

### B. Difficulty Statistics & Reconciliation
- Categorized according to the Prisma schema `Difficulty` enum (`EASY`, `MEDIUM`, `HARD`).
- Total unique solved problems mathematically reconciles with the difficulty breakdown:
  ```
  totalProblemsSolved = difficulty.easy + difficulty.medium + difficulty.hard
  ```
- Unknown or missing difficulties are handled safely without silent misclassification.

### C. Topic & Pattern Aggregation
- **Topic Progress:**
  - `totalProblems`: Published problems associated with the topic via `ProblemTopic`.
  - `solvedProblems`: Distinct published problems in this topic with at least 1 accepted submission by the user.
  - `remainingProblems`: `Math.max(0, totalProblems - solvedProblems)`.
  - `percentage`: `totalProblems > 0 ? Math.min(100, Math.round((solvedProblems / totalProblems) * 100)) : 0`.
  - Bounded strictly between 0% and 100%; division by zero is safely prevented when topics have 0 problems.
- **Pattern Progress:**
  - The current schema does not contain an independent `Pattern` entity. Topics serve as the primary curriculum syllabus. The endpoint `GET /api/v1/progress/by-pattern` returns an empty array with an explicit explanation conforming to Section 3.C.

### D. Daily Activity & Timezone Policy
- **First Accepted Attribution:** A problem is counted as newly solved on calendar date $D$ if and only if the student's *earliest* accepted submission (`MIN(createdAt)`) occurred on date $D$. Subsequent accepted resubmissions do NOT increment the newly solved problem count on later days.
- **Timezone Adjustment:** Dates are compared in UTC by default. Clients may provide `tzOffsetMinutes` (e.g. `-330` for IST) to align timestamps with local midnight boundaries.
- **Date Range Limit:** Maximum allowable range is 365 days; requests exceeding this limit are rejected with HTTP 400 Bad Request.

---

## 3. API Endpoints Contract

Base URL: `/api/v1`

### 1. Progress Overview
- **Endpoint:** `GET /progress/overview`
- **Auth:** Bearer JWT required (scoped to authenticated user)
- **Response:**
  ```json
  {
    "totalProblemsSolved": 45,
    "difficulty": {
      "easy": 20,
      "medium": 18,
      "hard": 7
    },
    "totalAvailable": {
      "easy": 50,
      "medium": 60,
      "hard": 30,
      "total": 140
    },
    "totalSubmissions": 120,
    "acceptedSubmissions": 55,
    "acceptanceRate": "45.8%"
  }
  ```

### 2. Topic Progress
- **Endpoint:** `GET /progress/by-topic`
- **Auth:** Bearer JWT required
- **Response:**
  ```json
  {
    "topics": [
      {
        "id": "top_cl...",
        "name": "Arrays & Hashing",
        "slug": "arrays-and-hashing",
        "order": 1,
        "totalProblems": 15,
        "solvedProblems": 8,
        "remainingProblems": 7,
        "percentage": 53
      }
    ],
    "totalTopics": 8
  }
  ```

### 3. Pattern Progress
- **Endpoint:** `GET /progress/by-pattern`
- **Auth:** Bearer JWT required
- **Response:**
  ```json
  {
    "patterns": [],
    "message": "Patterns are not modeled separately in the current catalog; topics represent the primary curriculum groupings."
  }
  ```

### 4. Solved Problems
- **Endpoint:** `GET /progress/solved-problems`
- **Auth:** Bearer JWT required
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `difficulty` (`EASY` | `MEDIUM` | `HARD`, optional)
  - `topic` (string, topic slug, optional)
- **Response:**
  ```json
  {
    "items": [
      {
        "id": "prob_...",
        "slug": "two-sum",
        "title": "Two Sum",
        "difficulty": "EASY",
        "solvedAt": "2026-10-18T10:00:00.000Z",
        "primaryTopic": { "slug": "arrays-and-hashing", "name": "Arrays & Hashing" },
        "topics": [{ "slug": "arrays-and-hashing", "name": "Arrays & Hashing" }],
        "totalSubmissions": 3,
        "acceptedSubmissions": 1
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
  ```

### 5. Submission History
- **Endpoint:** `GET /progress/submission-history`
- **Auth:** Bearer JWT required
- **Query Parameters:** `page`, `limit`, `problemSlug`, `verdict`
- **Security:** Private source code, test cases, and Judge0 internal tokens are strictly omitted.

### 6. Daily Activity Summary
- **Endpoint:** `GET /progress/activity`
- **Auth:** Bearer JWT required
- **Query Parameters:**
  - `startDate` (ISO 8601 or YYYY-MM-DD, optional, default: 90 days ago)
  - `endDate` (ISO 8601 or YYYY-MM-DD, optional, default: today)
  - `tzOffsetMinutes` (integer minutes offset, optional, default: 0)
- **Response:**
  ```json
  {
    "startDate": "2026-07-21",
    "endDate": "2026-10-19",
    "totalDays": 91,
    "activeDays": 25,
    "totalSubmissions": 120,
    "totalUniqueSolved": 45,
    "currentStreak": 5,
    "longestStreak": 14,
    "dailyActivity": [
      {
        "date": "2026-10-18",
        "submissionCount": 4,
        "uniqueSolvedCount": 2
      }
    ]
  }
  ```

---

## 4. Database Optimizations & Migrations

### Migration `20261019160000_add_progress_tracking_indexes`
Applied non-destructively to PostgreSQL:
```sql
CREATE INDEX "submissions_user_id_verdict_idx" ON "submissions"("user_id", "verdict");
CREATE INDEX "submissions_user_id_created_at_idx" ON "submissions"("user_id", "created_at");
```
- **Rationale:** Progress queries frequently filter on `WHERE user_id = $1 AND verdict = 'ACCEPTED'` (for unique solved problem counts and topic mastery) and `WHERE user_id = $1 AND created_at BETWEEN $2 AND $3` (for daily activity). The composite indexes enable direct index scans rather than sequential filtering on submissions.

---

## 5. Security & Authorization

- All endpoints extract user context strictly from the verified JWT via the `@CurrentUser()` decorator.
- Client-provided user IDs are rejected and ignored.
- Submissions and solved problems never expose hidden test cases, source code, or Judge0 execution tokens.

---

## 6. Known Limitations & Future Considerations

- **Patterns:** When problem patterns (e.g., Sliding Window, Monotonic Stack) are introduced as a distinct relation in future phases, the schema can be updated with a `Pattern` model and mapped into `/progress/by-pattern`.
- **Timezone Preferences:** Currently accepts an optional `tzOffsetMinutes` parameter from client headers or query strings; future user profile preferences can persist student home timezones.
- **Phase 5 & Future Gamification:** Contests, assessments, XP reward ledgers, badges, and streaks remain out of scope for Phase 6A and will be handled in subsequent phases.
