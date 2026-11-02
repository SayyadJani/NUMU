# NUMU Authentication & Session Management — API Contracts

**Base URL**: `/api/v1/auth`  
**API Specification**: OpenAPI 3.0 / Swagger accessible at `/api/docs`  
**Authentication Scheme**: Bearer JWT (`Authorization: Bearer <token>`) OR HttpOnly Cookie (`numu_access_token`)

---

## 1. Authentication Endpoints

### 1.1 Register Account
Creates a new candidate account with default `STUDENT` role and initializes user profile.

- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Auth Required**: No (Public)
- **Rate Limit**: 5 requests / min
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "student@numu.io",
    "password": "Password123!",
    "username": "studentuser",
    "name": "Jane Doe",
    "college": "MIT",
    "gradYear": 2026
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "cmv1234560000vhrgfrv04x18",
        "email": "student@numu.io",
        "username": "studentuser",
        "name": "Jane Doe",
        "role": "STUDENT",
        "isActive": true,
        "isEmailVerified": false,
        "createdAt": "2026-10-27T10:00:00.000Z",
        "profile": {
          "bio": null,
          "headline": null,
          "avatarUrl": null,
          "college": "MIT",
          "gradYear": 2026,
          "location": null,
          "skills": []
        }
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 900
    }
  }
  ```
- **Cookies Set**:
  - `numu_access_token`: `<jwt_access_token>`, HttpOnly, SameSite=Lax, Path=/, Max-Age=900s
  - `numu_refresh_token`: `<raw_refresh_token>`, HttpOnly, SameSite=Lax, Path=/api/v1/auth, Max-Age=7d

---

### 1.2 Authenticate / Login
Authenticates user credentials and establishes a persistent session.

- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Auth Required**: No (Public)
- **Rate Limit**: 10 requests / min
- **Request Body**:
  ```json
  {
    "identifier": "student@numu.io",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**: Same payload structure as Register.
- **Error Responses**:
  - `401 Unauthorized`: `{"success": false, "statusCode": 401, "message": "Invalid email/username or password"}`
  - `401 Unauthorized`: `{"success": false, "statusCode": 401, "message": "This account has been deactivated. Please contact support."}`

---

### 1.3 Refresh Token Rotation
Rotates current refresh token and issues a new access token.

- **Method**: `POST`
- **Path**: `/api/v1/auth/refresh`
- **Auth Required**: No (Token provided via Cookie or fallback body)
- **Request Body (Optional Fallback)**:
  ```json
  {
    "refreshToken": "optional_raw_hex_token_if_cookie_missing"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { ... },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 900
    }
  }
  ```

---

### 1.4 Get Current User Profile
Retrieves authenticated user identity, verified role, and profile details.

- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Auth Required**: Yes (`Bearer` token or `numu_access_token` cookie)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "cmv1234560000vhrgfrv04x18",
      "email": "student@numu.io",
      "username": "studentuser",
      "name": "Jane Doe",
      "role": "STUDENT",
      "isActive": true,
      "isEmailVerified": false,
      "profile": { ... }
    }
  }
  ```

---

### 1.5 Logout Current Session
Revokes active refresh token and clears browser authentication cookies.

- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "message": "Logged out successfully" }
  }
  ```
- **Cookies Cleared**: `numu_access_token`, `numu_refresh_token` set to `Max-Age=0`.

---

## 2. Session Management Endpoints

### 2.1 List Active Sessions
Lists all active persistent sessions for the authenticated user, identifying device metadata and current session.

- **Method**: `GET`
- **Path**: `/api/v1/auth/sessions`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "sess_cmv12345abc",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
        "ipAddress": "127.0.0.1",
        "createdAt": "2026-10-27T09:00:00.000Z",
        "lastActivityAt": "2026-10-27T09:30:00.000Z",
        "expiresAt": "2026-11-03T09:00:00.000Z",
        "isCurrent": true
      }
    ]
  }
  ```

---

### 2.2 Revoke Single Session
Terminates a specific session remotely (e.g. lost device or remote signout).

- **Method**: `DELETE`
- **Path**: `/api/v1/auth/sessions/:sessionId`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "message": "Session successfully revoked" }
  }
  ```

---

### 2.3 Logout From All Sessions
Terminates all active sessions for the authenticated account across all devices.

- **Method**: `POST`
- **Path**: `/api/v1/auth/logout-all`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "message": "All active sessions have been terminated" }
  }
  ```

---

## 3. Account Recovery Endpoints

### 3.1 Forgot Password Request
Initiates password reset workflow. Always returns a generic success response to prevent user enumeration attacks.

- **Method**: `POST`
- **Path**: `/api/v1/auth/forgot-password`
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "If an account with this email address exists, password reset instructions have been sent."
    }
  }
  ```

---

### 3.2 Reset Password
Resets user account password using the single-use recovery token.

- **Method**: `POST`
- **Path**: `/api/v1/auth/reset-password`
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "token": "64_character_hex_recovery_token",
    "newPassword": "NewStrongPassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "message": "Password has been successfully reset. You may now log in with your new credentials." }
  }
  ```
