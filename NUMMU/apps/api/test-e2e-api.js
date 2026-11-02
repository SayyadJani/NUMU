const BASE_URL = 'http://localhost:4000/api/v1';

async function runTests() {
  console.log('🧪 Starting NUMU Phase 2 End-to-End API Security & Integration Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // ─── TEST 1: Health Check ───
  console.log('1. System & Health Check');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200, 'Health check returns 200');
  assert(healthData.database === 'ok', 'Database connectivity status is "ok"');

  // ─── TEST 2: Registration Validation & Security ───
  console.log('\n2. User Registration Security');
  const weakPasswordRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'badpass@numu.io', password: '123' }),
  });
  assert(weakPasswordRes.status === 400, 'Rejects weak password (<8 chars) with 400');

  const testUserEmail = `learner.${Date.now()}@numu.io`;
  const testUsername = `learner_${Date.now()}`;
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUserEmail,
      username: testUsername,
      name: 'New Learner',
      password: 'StrongPassword123!',
      college: 'Vellore Institute of Technology',
      gradYear: 2026,
    }),
  });
  const registerData = await registerRes.json();
  assert(registerRes.status === 201, 'Registers new user with 201 Created');
  assert(registerData.data.user.role === 'STUDENT', 'Enforces default role STUDENT');
  assert(registerData.data.user.passwordHash === undefined, 'Never exposes passwordHash in response');

  // Check Set-Cookie headers
  const setCookies = registerRes.headers.get('set-cookie') || '';
  assert(setCookies.includes('numu_access_token'), 'Sets numu_access_token cookie');
  assert(setCookies.includes('numu_refresh_token'), 'Sets numu_refresh_token cookie');
  assert(setCookies.includes('HttpOnly'), 'Enforces HttpOnly flag on cookies');

  // Duplicate email registration
  const duplicateEmailRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUserEmail,
      password: 'StrongPassword123!',
    }),
  });
  assert(duplicateEmailRes.status === 409, 'Rejects duplicate email with 409 Conflict');

  // ─── TEST 3: Login & Credential Verification ───
  console.log('\n3. Login & Credential Verification');
  const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testUserEmail, password: 'WrongPassword999!' }),
  });
  assert(badLoginRes.status === 401, 'Rejects invalid password with 401');

  const unknownLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'nonexistent@numu.io', password: 'WrongPassword999!' }),
  });
  const unknownLoginData = await unknownLoginRes.json();
  assert(unknownLoginRes.status === 401, 'Rejects unknown account with 401');
  assert(
    unknownLoginData.message === 'Invalid email/username or password',
    'Uses constant generic message without leaking account existence',
  );

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testUserEmail, password: 'StrongPassword123!' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Authenticates with correct credentials');
  const accessToken = loginData.data.accessToken;
  const refreshTokenCookie = loginRes.headers.get('set-cookie');

  // ─── TEST 4: Authenticated Identity & Profile ───
  console.log('\n4. Authenticated /auth/me & Profile');
  const unauthMeRes = await fetch(`${BASE_URL}/auth/me`);
  assert(unauthMeRes.status === 401, 'Unauthenticated /auth/me returns 401');

  const authMeRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const meData = await authMeRes.json();
  assert(authMeRes.status === 200, 'Authenticated /auth/me returns 200');
  assert(meData.data.email === testUserEmail, 'Returns correct current user profile');

  // Public Profile
  const publicProfileRes = await fetch(`${BASE_URL}/users/by-username/${testUsername}`);
  const publicProfileData = await publicProfileRes.json();
  assert(publicProfileRes.status === 200, 'Public profile endpoint returns 200');
  assert(publicProfileData.email === undefined, 'Public profile strips private email');
  assert(publicProfileData.username === testUsername, 'Public profile includes username handle');

  // Profile Update
  const updateProfileRes = await fetch(`${BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      headline: 'Fullstack Student Developer',
      bio: 'Studying hard for campus placements',
      skills: ['TypeScript', 'NestJS', 'Next.js'],
    }),
  });
  const updatedData = await updateProfileRes.json();
  assert(updateProfileRes.status === 200, 'PATCH /users/me updates profile');
  assert(updatedData.profile.headline === 'Fullstack Student Developer', 'Persists profile headline');

  // ─── TEST 5: Refresh Token Rotation & Reuse Detection ───
  console.log('\n5. Refresh Token Rotation & Reuse Detection');
  // Extract refresh token from cookie
  let rawRefreshToken = '';
  if (refreshTokenCookie) {
    const match = refreshTokenCookie.match(/numu_refresh_token=([^;]+)/);
    if (match) rawRefreshToken = match[1];
  }

  // 1st Refresh: valid rotation
  const refresh1Res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `numu_refresh_token=${rawRefreshToken}`,
    },
    body: JSON.stringify({ refreshToken: rawRefreshToken }),
  });
  const refresh1Data = await refresh1Res.json();
  assert(refresh1Res.status === 200, '1st Token refresh succeeds');
  const newAccessToken = refresh1Data.data.accessToken;
  assert(newAccessToken !== accessToken, 'Rotated access token is newly issued');

  // Extract new refresh token
  const refresh1Cookies = refresh1Res.headers.get('set-cookie') || '';
  let rotatedRefreshToken = '';
  const match2 = refresh1Cookies.match(/numu_refresh_token=([^;]+)/);
  if (match2) rotatedRefreshToken = match2[1];

  // 2nd Refresh with OLD token -> MUST trigger reuse detection!
  const reuseRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `numu_refresh_token=${rawRefreshToken}`,
    },
    body: JSON.stringify({ refreshToken: rawRefreshToken }),
  });
  assert(reuseRes.status === 401, 'Reused old refresh token is rejected with 401');

  // Subsequent refresh with the rotated token should now also fail because the family was revoked!
  const familyRevokedRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `numu_refresh_token=${rotatedRefreshToken}`,
    },
    body: JSON.stringify({ refreshToken: rotatedRefreshToken }),
  });
  assert(
    familyRevokedRes.status === 401,
    'Reuse detection invalidated entire token family (family revocation verified)',
  );

  // ─── TEST 6: Password Recovery Lifecycle ───
  console.log('\n6. Password Reset Lifecycle');
  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserEmail }),
  });
  const forgotData = await forgotRes.json();
  assert(forgotRes.status === 200, 'Forgot password returns 200');
  const devResetToken = forgotData.data.devResetToken;
  assert(Boolean(devResetToken), 'Generates development recovery token');

  // Reset password
  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: devResetToken,
      newPassword: 'BrandNewPassword456!',
    }),
  });
  assert(resetRes.status === 200, 'Resets password with valid single-use token');

  // Verify old password fails
  const oldLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testUserEmail, password: 'StrongPassword123!' }),
  });
  assert(oldLoginRes.status === 401, 'Old password rejected after reset');

  // Verify new password succeeds
  const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testUserEmail, password: 'BrandNewPassword456!' }),
  });
  assert(newLoginRes.status === 200, 'New password authenticates successfully');
  const freshLoginData = await newLoginRes.json();
  const freshAccessToken = freshLoginData.data.accessToken;

  // Single-use token check: Re-submitting the same token must fail
  const reuseTokenRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: devResetToken,
      newPassword: 'AnotherPassword789!',
    }),
  });
  assert(reuseTokenRes.status === 400, 'Already-used reset token rejected with 400 (single-use enforced)');

  // ─── TEST 7: Role Authorization & Organizations ───
  console.log('\n7. Role Authorization & Organization Isolation');
  // Student should NOT be able to list all users (requires Trainer/Admin)
  const studentListUsersRes = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${freshAccessToken}` },
  });
  assert(
    studentListUsersRes.status === 403,
    'Student role cannot access administrative user list (403 Forbidden)',
  );

  // Platform admin login
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'alex.rivera@numu.io', password: 'Password123!' }),
  });
  const adminData = await adminLoginRes.json();
  const adminAccessToken = adminData.data.accessToken;

  // Admin CAN list all users
  const adminListUsersRes = await fetch(`${BASE_URL}/users?limit=5`, {
    headers: { Authorization: `Bearer ${adminAccessToken}` },
  });
  const adminListData = await adminListUsersRes.json();
  assert(adminListUsersRes.status === 200, 'Platform Admin accesses user list');
  assert(Array.isArray(adminListData.data), 'User list is paginated array');

  // Organizations: Create Org
  const newOrgSlug = `cs-dept-${Date.now()}`;
  const createOrgRes = await fetch(`${BASE_URL}/organizations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${freshAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'CS Department Guild',
      slug: newOrgSlug,
      description: 'Autonomous student development guild',
    }),
  });
  const orgData = await createOrgRes.json();
  assert(createOrgRes.status === 201, 'Creates new organization');
  const createdOrgId = orgData.id;

  // Tenant Isolation: Another user (e.g. David Kim) cannot view private organization details
  const davidLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'david.kim@numu.io', password: 'Password123!' }),
  });
  const davidData = await davidLoginRes.json();
  const davidAccessToken = davidData.data.accessToken;

  const davidAccessOrgRes = await fetch(`${BASE_URL}/organizations/${createdOrgId}`, {
    headers: { Authorization: `Bearer ${davidAccessToken}` },
  });
  assert(
    davidAccessOrgRes.status === 403,
    'Non-member denied access to private organization (Tenant Isolation enforced with 403)',
  );

  // Creator CAN access organization
  const creatorAccessOrgRes = await fetch(`${BASE_URL}/organizations/${createdOrgId}`, {
    headers: { Authorization: `Bearer ${freshAccessToken}` },
  });
  assert(creatorAccessOrgRes.status === 200, 'Organization owner accesses organization details');

  // ─── TEST 8: Logout ───
  console.log('\n8. Logout & Cookie Cleared');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${freshAccessToken}` },
  });
  assert(logoutRes.status === 200, 'Logout succeeds with 200 OK');
  const logoutCookies = typeof logoutRes.headers.getSetCookie === 'function'
    ? logoutRes.headers.getSetCookie().join(' ')
    : (logoutRes.headers.get('set-cookie') || '');
  assert(
    logoutCookies.includes('Max-Age=0') || logoutCookies.includes('1970') || logoutCookies.includes('numu_access_token=;'),
    'Clears authentication cookies on logout',
  );

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
