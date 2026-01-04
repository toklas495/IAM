
---

# 📁 README.md — **Auth_1**

```md
# Auth_1 – From Passwords to OpenID Connect

Auth_1 is a **complete backend authentication system** that evolves step-by-step from:

> **Username & Password → Sessions → JWT → OAuth 2.0 → OpenID Connect**

This project was built to **understand identity deeply**, not to just “log users in”.

---

## 🎯 Goal of Auth_1

To answer one question properly:

> **How does a user actually become authenticated — securely — in modern systems?**

Auth_1 demonstrates:
- How identity is created
- How trust is established
- How tokens represent identity
- How third-party providers authenticate users

---

## ⏱️ Timeline

- **Total time:** ~15 days
- **Approach:** Build → test → harden → document
- **Focus:** Backend logic & protocol correctness

---

## 🧠 What This Project Covers

### 1️⃣ Local Authentication (Username & Password)

- Secure password hashing
  - bcrypt
  - Argon2
- Password strength validation
- Email uniqueness & normalization
- Account verification
- Password reset flow
- Brute-force protection

**Why this matters:**  
Passwords are the weakest link. This phase focuses on minimizing damage.

---

### 2️⃣ Session-Based Authentication

- Server-side sessions
- Secure cookies
  - `httpOnly`
  - `secure`
  - `sameSite`
- CSRF protection
- Session expiration & renewal
- Logout & session invalidation

**Why this matters:**  
Sessions are still the safest option for many web apps.

---

### 3️⃣ JWT-Based Authentication

- JWT structure & validation
- Access tokens vs refresh tokens
- Token expiration strategies
- Token rotation
- Token revocation & blacklisting
- `jti`, `iss`, `aud`, `exp` handling
- Key rotation concepts

**Why this matters:**  
Stateless auth is powerful but dangerous if misunderstood.

---

### 4️⃣ OAuth 2.0 (Authorization Layer)

- OAuth roles:
  - Resource Owner
  - Client
  - Authorization Server
  - Resource Server
- Authorization Code Flow
- Authorization Code + PKCE
- `state` parameter (CSRF protection)
- Scope validation
- Secure redirect handling

**Why this matters:**  
OAuth is authorization, not authentication — misunderstanding this causes bugs.

---

### 5️⃣ OpenID Connect (Authentication Layer)

- ID Tokens vs Access Tokens
- Claims & scopes
- Nonce validation
- UserInfo endpoint
- Discovery document
- Identity verification from OAuth

**Why this matters:**  
OIDC is what actually proves *who the user is*.

---

### 6️⃣ Social Login (OIDC in Practice)

- Google Login
- GitHub Login
- Account linking (local + social)
- User identity normalization
- Provider-agnostic identity model

**Why this matters:**  
Real systems support multiple identity providers.

---

## 🏗️ Architecture Overview

```text
Client
  ↓
Auth API
  ├── Local Auth (Password)
  ├── Session Manager
  ├── Token Service (JWT)
  ├── OAuth Client
  ├── OIDC Validation
  └── User Identity Store
