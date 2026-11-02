# NUMU Authentication & Security — Automated Verification & Testing Plan

**Specification Version**: 1.0.0  
**Scope**: Unit, Integration, and End-to-End Automated Testing

---

## 1. Test Suite Structure

The NUMU authentication security test suite is organized into the following automated test suites:

### 1.1 Unit & Service Tests (`apps/api/src/modules/auth/`)
- **`PasswordService` (Argon2id)**:
  - Hashing complexity, OWASP memory/time parameters.
  - Password verification against valid and invalid hashes.
  - Password complexity rule validation (min 8 chars, numbers, letters).
- **`TokenService` (JWT & Cryptographic Randomness)**:
  - Signing access tokens with `HS256` and claims (`sub`, `email`, `role`, `sid`).
  - Verifying valid access tokens.
  - Rejecting expired, tampered, or invalid tokens.
  - Hashing tokens using SHA-256 for database persistence.
- **`AuthService` (Lifecycle & Replay Detection)**:
  - User registration with default `STUDENT` role.
  - Duplicate email and username conflict handling (`409 Conflict`).
  - Login credential verification.
  - Timing attack defense via constant-time dummy verification.
  - Account deactivation rejection (`401 Unauthorized`).
  - Refresh token rotation with atomic invalidation.
  - Refresh token replay attack detection and family invalidation.
  - Session listing and identification of `isCurrent`.
  - Individual session revocation and `logoutAll` device termination.

### 1.2 Authorization & Guard Tests
- **`JwtAuthGuard`**:
  - Allows public endpoints marked with `@Public()`.
  - Extracts token from `numu_access_token` cookie or `Authorization: Bearer` header.
  - Rejects missing credentials with `401 Unauthorized: Authentication credentials missing`.
  - Rejects deactivated or nonexistent users.
- **`RolesGuard`**:
  - Allows platform admin access across all routes.
  - Validates required roles (e.g., `TRAINER`, `PLATFORM_ADMIN`).
  - Denies unauthorized access with `403 Forbidden`.

### 1.3 Frontend Integration & Route Guard Tests
- Next.js middleware intercepting `/dashboard/*`, `/tests/*/attempt`, and redirecting to `/login?callbackUrl=...`.
- `ApiClient` request queue avoiding concurrent refresh race conditions.
- Smooth redirect on session expiration.

---

## 2. Test Execution Commands

```bash
# 1. Run database schema validation & generation
pnpm --filter @numu/database db:generate

# 2. Run API auth unit & service test suites
pnpm --filter @numu/api test -- src/modules/auth/auth.service.spec.ts

# 3. Run full API build to verify type safety and compilation
pnpm --filter @numu/api build

# 4. Run frontend build to verify route types and client components
pnpm --filter @numu/web build
```

---

## 3. Security Regression Checklist

- [x] Passwords hashed with Argon2id; zero plaintext passwords.
- [x] Timing attack mitigation with dummy hash verification.
- [x] Refresh tokens stored only as SHA-256 digests.
- [x] Token reuse triggers revocation of the entire family.
- [x] Sessions support individual and global revocation.
- [x] Short-lived access tokens (`15m`).
- [x] Single-origin Next.js proxying eliminates cross-origin cookie dropping.
- [x] Server-side route middleware protects private pages.
