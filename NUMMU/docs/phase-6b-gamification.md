# Phase 6B: Gamification — XP, Levels, Streaks & Badges

## 1. Executive Summary

Phase 6B introduces an auditable, secure, concurrency-resilient gamification system for the NUMU developer-learning platform.
All rewards are strictly governed by backend-trusted events: **accepted code submissions persisted in PostgreSQL via Judge0 CE execution serve as the authoritative trigger for coding rewards**. Client requests cannot grant XP, alter levels, claim arbitrary streaks, or self-award badges.

All requirements for Phase 6B have been implemented, tested, and verified across backend, shared types, database migrations, and frontend components. Leaderboards (Phase 6C) and Assessments/Contests (Phase 5) were strictly excluded from scope.

---

## 2. Architecture & Reward Policy

### 2.1 Centralized Policy Configuration
Reward rules and level curves are centralized in `apps/api/src/modules/gamification/gamification.constants.ts`. They are never hardcoded in controllers or client-facing components.

```typescript
export const GAMIFICATION_POLICY = {
  VERSION: '1.0',
  SOLVE_XP: {
    EASY: 10,
    MEDIUM: 20,
    HARD: 30,
  },
  DAILY_ACTIVITY_BONUS: 0,
  BADGE_AWARD_BONUS: 0,
} as const;
```

### 2.2 Qualifying Event Lifecycle
1. Student submits code via `POST /api/v1/submissions`.
2. Backend persists `Submission` in `QUEUED` state, transitions to `PROCESSING`, and dispatches test suites to Judge0.
3. Upon completion, backend calculates terminal verdict.
4. **Trusted Reward Boundary**: When and only when `verdict === SubmissionVerdict.ACCEPTED`, `SubmissionsService` invokes `GamificationService.awardSolveReward(...)`.
5. `GamificationService` creates an atomic ledger record in `XpTransaction` using a deterministic idempotency key (`solve:${userId}:${problemId}`).
6. If the student has already been rewarded for solving this problem, database unique constraints reject duplicate records (`P2002`), returning an idempotent response without inflating XP.
7. Upon a successful first solve, `GamificationService.evaluateAndAwardBadges(userId)` evaluates active badge criteria and awards any newly unlocked achievements.

---

## 3. Database Schema Changes & Migration

A forward-only migration was created and applied:
`packages/database/prisma/migrations/20261019180000_add_gamification_ledger_and_badges/migration.sql`

### Models Added

#### 1. `XpTransaction` (`xp_transactions`)
- `id String @id @default(cuid())`
- `userId String`: references `User.id` (ON DELETE CASCADE)
- `amount Int`: signed integer XP delta
- `eventType String`: e.g. `'PROBLEM_SOLVED'`
- `sourceType String`: e.g. `'PROBLEM'`
- `sourceId String`: problem ID
- `idempotencyKey String @unique`: e.g. `'solve:{userId}:{problemId}'`
- `policyVersion String @default("1.0")`
- `createdAt DateTime @default(now())`
- **Constraints & Indexes**:
  - `@@unique([userId, sourceType, sourceId, eventType])` (guarantees a student is only rewarded once per problem solve)
  - `@@index([userId, createdAt])` (optimizes paginated XP history)

#### 2. `BadgeDefinition` (`badge_definitions`)
- `id String @id @default(cuid())`
- `slug String @unique`: e.g. `'first-solve'`, `'problem-solver'`, `'streak-warrior'`, `'dsa-explorer'`
- `name String`
- `description String`
- `icon String`
- `category String @default("Milestone")` (`Milestone` | `Streak` | `Topic`)
- `rarity String @default("Common")` (`Common` | `Rare` | `Epic` | `Legendary`)
- `criteriaType String` (`PROBLEMS_SOLVED` | `TOPICS_COVERED` | `STREAK_DAYS`)
- `criteriaThreshold Int`
- `isActive Boolean @default(true)`
- `createdAt DateTime @default(now())`

#### 3. `UserBadge` (`user_badges`)
- `id String @id @default(cuid())`
- `userId String`: references `User.id` (ON DELETE CASCADE)
- `badgeId String`: references `BadgeDefinition.id` (ON DELETE CASCADE)
- `awardedAt DateTime @default(now())`
- **Constraints & Indexes**:
  - `@@unique([userId, badgeId])` (guarantees a badge is awarded only once)
  - `@@index([userId, awardedAt])` (optimizes user badge retrieval)

---

## 4. Level Progression

Level progression is pure and deterministic. It is calculated directly from accumulated ledger XP without requiring database write locks on every level transition.

### Progression Curve
| Level | XP Required | Span to Next |
|---|---:|---:|
| 1 | 0 | 100 |
| 2 | 100 | 150 |
| 3 | 250 | 200 |
| 4 | 450 | 250 |
| 5 | 700 | 300 |
| 6 | 1000 | 400 |
| 7 | 1400 | 500 |
| 8 | 1900 | 600 |
| 9 | 2500 | 700 |
| 10 (Max) | 3200 | — |

- **Edge Cases Handled**:
  - `0 XP`: Level 1, 0% progress, 100 XP remaining.
  - `Negative XP`: Clamped to 0 XP.
  - `Threshold Boundaries`: Exact threshold lands on the new level at 0% progress; one XP below lands on previous level at high percentage.
  - `Max Level`: Level 10 returns `isMaxLevel: true`, `progressPercentage: 100`, `xpRemaining: 0` without division by zero.

---

## 5. Daily Activity & Streaks

Streak tracking reuses Phase 6A `ProgressService.getActivitySummary` to guarantee consistency across analytics, heatmap, and gamification:
- Calendar days are computed with user-configurable or browser timezone offsets (`tzOffsetMinutes`), avoiding server machine local timezone bias.
- An active day requires at least one persisted submission or accepted solve.
- `currentStreak`: consecutive active days counting backward from today (or yesterday if today's activity is pending).
- `longestStreak`: historical maximum consecutive active days.
- `activeToday`: true if the user has recorded activity on the current calendar day.

---

## 6. Seeded Badge Definitions

| Slug | Name | Category | Rarity | Criteria Type | Threshold |
|---|---|---|---|---|---:|
| `first-solve` | First Problem | Milestone | Common | `PROBLEMS_SOLVED` | 1 |
| `problem-solver` | 10 Problems Solver | Milestone | Rare | `PROBLEMS_SOLVED` | 10 |
| `dedicated-coder` | Dedicated Coder | Milestone | Epic | `PROBLEMS_SOLVED` | 25 |
| `streak-warrior` | 7-Day Streak Warrior | Streak | Rare | `STREAK_DAYS` | 7 |
| `centurion-streak` | Centurion Streak (30 Days) | Streak | Legendary | `STREAK_DAYS` | 30 |
| `dsa-explorer` | DSA Explorer | Topic | Rare | `TOPICS_COVERED` | 3 |

---

## 7. API Endpoints

All endpoints are hosted under `/api/v1/gamification` and protected by `JwtAuthGuard`.

### 1. `GET /api/v1/gamification/summary`
Retrieves total XP, level progress, streak status, and recent badges.
Query Parameters:
- `tzOffsetMinutes` (optional, integer): timezone offset in minutes from UTC (e.g., `-330` for IST).

```json
{
  "xp": {
    "total": 450
  },
  "level": {
    "current": 4,
    "currentLevelXp": 450,
    "nextLevelXp": 700,
    "xpIntoLevel": 0,
    "xpRemaining": 250,
    "progressPercentage": 0,
    "isMaxLevel": false
  },
  "streak": {
    "current": 5,
    "longest": 12,
    "lastActivityDate": "2026-10-19",
    "activeToday": true
  },
  "badgesSummary": {
    "totalEarned": 2,
    "totalAvailable": 6,
    "recentBadges": [
      {
        "id": "clx...",
        "slug": "first-solve",
        "name": "First Problem",
        "description": "Submitted and accepted your very first problem solution.",
        "icon": "🛡️",
        "category": "Milestone",
        "rarity": "Common",
        "earned": true,
        "awardedAt": "2026-10-19T10:00:00.000Z",
        "progress": 1,
        "maxProgress": 1
      }
    ]
  }
}
```

### 2. `GET /api/v1/gamification/badges`
Retrieves paginated list of earned badges for the authenticated user.
Query Parameters:
- `page` (optional, default 1)
- `limit` (optional, default 20)

### 3. `GET /api/v1/gamification/badges/available`
Retrieves active badge definitions with the authenticated user's earned status and criteria progress.
Query Parameters:
- `page` (optional, default 1)
- `limit` (optional, default 20)

### 4. `GET /api/v1/gamification/xp-history`
Retrieves paginated audit ledger of the authenticated user's XP transactions.
Query Parameters:
- `page` (optional, default 1)
- `limit` (optional, default 20)

---

## 8. Verification & Test Results

### Backend Unit Tests
- `apps/api/src/modules/gamification/gamification.service.spec.ts`:
  - Deterministic level progression (0 XP, exact thresholds, one above, one below, max level).
  - Solve XP awarding (10, 20, 30 XP for Easy, Medium, Hard).
  - Database-enforced idempotency (`P2002` uniqueness conflict handled gracefully).
  - Badge qualification for `PROBLEMS_SOLVED`, `TOPICS_COVERED`, and `STREAK_DAYS`.
- `apps/api/src/modules/gamification/gamification.controller.spec.ts`:
  - User scoping across all 4 endpoints.
- `apps/api/src/modules/submissions/submissions.service.spec.ts`:
  - Verified reward invocation on accepted submissions.

**Result**: 10/10 test suites passed (82/82 tests).

### Type Checking & Builds
- `pnpm typecheck`: Passed cleanly across all 6 packages (`@numu/api`, `@numu/web`, `@numu/types`, `@numu/database`, `@numu/config-eslint`, `@numu/config-typescript`).
- `pnpm --filter @numu/api build`: Production build succeeded (`nest build`).
