# NUMU Role-Based Access Control (RBAC) & Authorization Matrix

**Specification Version**: 1.0.0  
**Scope**: `@numu/api`, `@numu/web`, `@numu/database`

---

## 1. Supported Roles

NUMU defines four distinct, immutable roles within the PostgreSQL database enum `Role`:

1. **`STUDENT`**: Default role assigned upon self-service registration. Can view published learning materials, practice DSA problems, participate in weekly assessments, submit code solutions, track personal metrics, and view leaderboards.
2. **`TRAINER`**: Technical instructor or course mentor. Has student capabilities plus authoring problems, creating weekly tests, and viewing student cohort performance.
3. **`COLLEGE_ADMIN`**: Institutional representative. Can manage college student rosters, view university-specific batch progress, and export assessment reports.
4. **`PLATFORM_ADMIN`**: Superuser administrative authority. Full access to platform configuration, role management, problem publishing, test scheduling, and user moderation.

---

## 2. Resource Permissions & Authorization Matrix

| Resource Domain | Operation | Endpoint | STUDENT | TRAINER | COLLEGE_ADMIN | PLATFORM_ADMIN | Enforcement Mechanism |
|---|---|---|:---:|:---:|:---:|:---:|---|
| **Auth** | Register | `POST /auth/register` | ✅ | ✅ | ✅ | ✅ | Public |
| **Auth** | Login | `POST /auth/login` | ✅ | ✅ | ✅ | ✅ | Public |
| **Auth** | Refresh Token | `POST /auth/refresh` | ✅ | ✅ | ✅ | ✅ | Public (Token-bound) |
| **Auth** | View Current Profile | `GET /auth/me` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` |
| **Auth** | List Active Sessions | `GET /auth/sessions` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` (Own sessions) |
| **Auth** | Revoke Session | `DELETE /auth/sessions/:id` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` (Ownership check) |
| **Auth** | Logout All Devices | `POST /auth/logout-all` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` |
| **Problems** | Browse Catalog | `GET /problems` | ✅ | ✅ | ✅ | ✅ | Public / Optional Auth |
| **Problems** | View Problem Details | `GET /problems/:slug` | ✅ | ✅ | ✅ | ✅ | Public / Optional Auth |
| **Problems** | Run Ephemeral Code | `POST /submissions/run` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` |
| **Problems** | Submit Solution | `POST /submissions` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` |
| **Problems** | Create Problem | `POST /problems` | ❌ | ✅ | ❌ | ✅ | `JwtAuthGuard` + `RolesGuard(TRAINER, PLATFORM_ADMIN)` |
| **Problems** | Update Problem | `PATCH /problems/:id` | ❌ | ✅ (Author) | ❌ | ✅ | `JwtAuthGuard` + `RolesGuard` + Ownership |
| **Problems** | Delete Problem | `DELETE /problems/:id` | ❌ | ❌ | ❌ | ✅ | `JwtAuthGuard` + `RolesGuard(PLATFORM_ADMIN)` |
| **Tests** | View Published Tests | `GET /tests` | ✅ | ✅ | ✅ | ✅ | Optional Auth |
| **Tests** | Start / Resume Attempt | `POST /tests/:slug/attempt` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` |
| **Tests** | Autosave Draft Code | `PATCH /tests/:slug/attempt/:id/autosave` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` + Attempt Ownership |
| **Tests** | Run Sample Test Code | `POST /tests/:slug/attempt/:id/run` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` + Attempt Ownership |
| **Tests** | Submit Test Question | `POST /tests/:slug/attempt/:id/submit-question` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` + Attempt Ownership |
| **Tests** | Finalize Test Attempt | `POST /tests/:slug/attempt/:id/finalize` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` + Attempt Ownership |
| **Tests** | View Attempt Results | `GET /tests/:slug/results` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` + Attempt Ownership |
| **Admin Tests** | Create Test | `POST /admin/tests` | ❌ | ✅ | ❌ | ✅ | `JwtAuthGuard` + `RolesGuard(TRAINER, PLATFORM_ADMIN)` |
| **Admin Tests** | Assign Problems | `POST /admin/tests/:id/questions` | ❌ | ✅ | ❌ | ✅ | `JwtAuthGuard` + `RolesGuard(TRAINER, PLATFORM_ADMIN)` |
| **Admin Tests** | Publish / Close Test | `PATCH /admin/tests/:id/status` | ❌ | ✅ | ❌ | ✅ | `JwtAuthGuard` + `RolesGuard(TRAINER, PLATFORM_ADMIN)` |
| **Users** | Update Own Profile | `PATCH /profile/me` | ✅ | ✅ | ✅ | ✅ | `JwtAuthGuard` (Own profile) |
| **Users** | Change User Role | `PATCH /admin/users/:id/role` | ❌ | ❌ | ❌ | ✅ | `JwtAuthGuard` + `RolesGuard(PLATFORM_ADMIN)` |
| **Users** | Deactivate User | `PATCH /admin/users/:id/status` | ❌ | ❌ | ❌ | ✅ | `JwtAuthGuard` + `RolesGuard(PLATFORM_ADMIN)` |

---

## 3. Ownership Verification Invariants

1. **Test Attempt Ownership**: A candidate can only read, execute code within, autosave, or submit their own `TestAttempt` records. The `TestsService` strictly compares `attempt.userId === currentUser.id`.
2. **Profile Ownership**: A user can only mutate their own profile details (`/profile/me`). Public profile views (`/profile/:username`) expose only sanitized public statistics.
3. **Privilege Escalation Defense**:
   - `RegisterDto` strictly forbids `role` input.
   - `RolesGuard` evaluates assigned database roles extracted from the validated access token or verified database record.
   - `PLATFORM_ADMIN` is the sole role capable of mutating user roles.
