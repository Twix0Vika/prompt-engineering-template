# TimeCapsule — Authentication & Access Control Module BRD

## 1. Executive Summary & Objectives
The Authentication and Access Control module governs user registration, credential verification, JWT token issuance, protected route access, and capsule data tenancy.
- **Primary Goal**: Ensure private access so that capsule memories are accessible strictly by their designated owner or authorized recipient.

## 2. Functional Requirements

### 2.1 User Registration & Login (FR-1.1)
- **Registration (`POST /api/auth/register`)**:
  - Accepts `email` (valid email string) and `password` (minimum 6 characters).
  - Validates uniqueness of `email`. Returns `400 Bad Request` if email is already taken.
  - Generates a UUID for `user_id`.
  - Hashes passwords using bcrypt with a 72-byte safe truncation constraint (`password.encode('utf-8')[:72]`).
- **Login & Token Issuance (`POST /api/auth/token`)**:
  - Uses OAuth2 Password Request Form (`username` as email, `password`).
  - Verifies credentials against stored hashed passwords.
  - Generates signed JWT bearer tokens (`HS256`, 7-day expiration).
- **Current User Profile (`GET /api/auth/me`)**:
  - Returns authenticated user details (`id`, `email`).

### 2.2 Private Access & Tenancy (FR-1.2)
- **Protected Endpoints**:
  - FastAPI dependency `get_current_user` extracts and decodes the JWT bearer token.
  - Injected into all capsule endpoints to restrict queries (`capsule.owner_id == current_user.id`).
- **Frontend Route Protection**:
  - `ProtectedRoute` component wraps authenticated views (`/dashboard`, `/create`, `/edit/:id`, `/capsule/:id`).
  - Unauthenticated visits automatically redirect to `/login`.

## 3. Development Setup & Auth Bypass (`VITE_DEV_AUTH_BYPASS`)

To accelerate rapid UI prototyping and automated testing, the application includes a dedicated development auth bypass mechanism:

### 3.1 Frontend Bypass Configuration
- **Variable**: `VITE_DEV_AUTH_BYPASS` in frontend environment (`.env` or Vite runtime).
- **Behavior**:
  - Governed by `isDevAuthBypassEnabled` in `features/auth/frontend/config.ts`.
  - When enabled in development mode (`import.meta.env.DEV`), the Redux store initializes with mock credentials:
    - **Token**: `dev-only-mock-token`
    - **User**: `{ id: 'dev-user', email: 'dev@example.test' }`
  - `ProtectedRoute` bypasses login redirection and permits immediate navigation to `/dashboard`.

### 3.2 Backend Bypass Integration
- In `features/auth/backend/dependencies.py`:
  - When the incoming request contains `Authorization: Bearer dev-only-mock-token`, the dependency resolves immediately to `UserResponse(id="dev-user", email="dev@example.test")` without requiring a valid JWT signature or database lookup.

## 4. Security & Cryptographic Standards
- **Password Length Limit (Bcrypt 72-byte limit)**:
  - Raw passwords must be truncated to 72 bytes before passing to Passlib's `CryptContext` to prevent `ValueError: password cannot be longer than 72 bytes`.
  - Truncation function: `password.encode('utf-8')[:72].decode('utf-8', errors='ignore')`.
- **JWT Storage**:
  - Stored in browser `localStorage` and synchronized with Redux Toolkit `authSlice`.
- **Transport Security**:
  - Production deployments require HTTPS for token and credential transmission.

## 5. Technical Implementation Details
- **Backend**:
  - Router: `features/auth/backend/routers.py` (`/api/auth/`)
  - Service: `features/auth/backend/services.py`
  - Security Utilities: `features/auth/backend/security.py`
  - Repository: `features/auth/backend/repository.py` (`backend/data/users.json`)
  - Dependencies: `features/auth/backend/dependencies.py`
- **Frontend**:
  - API: `features/auth/frontend/api/authApi.ts`
  - Slice: `features/auth/frontend/api/authSlice.ts`
  - Configuration: `features/auth/frontend/config.ts`
  - Components: `LoginForm.tsx`, `RegisterForm.tsx`, `ProtectedRoute.tsx`
  - Pages: `AuthPage.tsx`

