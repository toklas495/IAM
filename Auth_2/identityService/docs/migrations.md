Below is a **corrected, final, production-grade migration design** in **Markdown**, aligned with everything we discussed:

* clear trust boundaries
* no contradictions
* supports password, OAuth, OTP, notifications
* avoids over-engineering
* “Uncle Bob clean architecture” compliant

I’ll **fix**, **rename**, and **remove** what should not be there, and add **what is missing**.

---

# Identity System Migrations

**(Professional / Secure / Real-World Boundaries)**

---

## 1. Users Table (Internal Identity)

```text
Purpose:
Represents a person inside your system.
Authoritative source for profile + contactability.
```

| Column         | Data Type | Notes                         |
| -------------- | --------- | ----------------------------- |
| id             | uuid      | PK, internal identifier       |
| email          | string    | Nullable, unique when present |
| email_verified | boolean   | Default false                 |
| username       | string    | Unique, optional              |
| full_name      | string    | Optional display name         |
| bio            | string    | Optional                      |
| avatar_url     | string    | Optional                      |
| is_active      | boolean   | Soft delete / suspension      |
| created_at     | datetime  |                               |
| updated_at     | datetime  |                               |

> **Notes**

* `users.email` is **your system’s email**
* OAuth emails may populate this, but remain `email_verified = false`
* Notifications depend on `email_verified`
* No passwords, tokens, or provider secrets here

---

## 2. Credentials Table (Password Boundary – First-Party)

```text
Purpose:
Stores long-term secrets owned and verified by your system.
Used ONLY for password-based auth.
```

| Column        | Data Type | Notes                  |
| ------------- | --------- | ---------------------- |
| id            | uuid      | PK                     |
| user_id       | uuid      | FK → users(id), unique |
| password_hash | string    | Argon2 / bcrypt        |
| last_used_at  | datetime  | Last successful login  |
| created_at    | datetime  |                        |
| updated_at    | datetime  |                        |

> **Notes**

* Exactly **one credential per user**
* No OAuth, no OTP, no passkeys here
* Clean separation of secret material

---

## 3. Accounts Table (External Identity Boundary)

```text
Purpose:
Maps external identities (OAuth, SAML, OTP, Passkeys) to internal users.
```

| Column            | Data Type | Notes                                                    |
| ----------------- | --------- | -------------------------------------------------------- |
| id                | uuid      | PK                                                       |
| user_id           | uuid      | FK → users(id)                                           |
| provider          | string    | 'google', 'github', 'email_otp', 'phone_otp', 'webauthn' |
| provider_user_id  | string    | External subject (sub, id, phone, email)                 |
| provider_email    | string    | Optional, non-authoritative                              |
| provider_metadata | jsonb     | Optional (profile, issuer, flags)                        |
| created_at        | datetime  |                                                          |
| updated_at        | datetime  |                                                          |

**Constraints**

* `(provider, provider_user_id)` UNIQUE

> **Notes**

* This is the **account linking backbone**
* `provider_email` is **never** used for notifications
* Password login does **not** create an account row

---

## 4. Sessions Table (Session Boundary)

```text
Purpose:
Represents active authenticated sessions.
```

| Column        | Data Type | Notes          |
| ------------- | --------- | -------------- |
| id            | uuid      | PK             |
| user_id       | uuid      | FK → users(id) |
| session_token | string    | Hashed         |
| user_agent    | string    | Optional       |
| ip_address    | string    | Optional       |
| device_id     | string    | Optional       |
| device_info   | string    | Optional       |
| expires_at    | datetime  |                |
| revoked       | boolean   | Default false  |
| created_at    | datetime  |                |
| updated_at    | datetime  |                |

> **Notes**

* Stateless auth (JWT) can skip this
* Session revocation is explicit and auditable

---

## 5. Refresh Tokens Table (Rotation Boundary)

```text
Purpose:
Secure long-lived authentication via rotation.
```

| Column         | Data Type | Notes             |
| -------------- | --------- | ----------------- |
| id             | uuid      | PK                |
| session_id     | uuid      | FK → sessions(id) |
| token_hash     | string    | Always hashed     |
| expires_at     | datetime  |                   |
| revoked        | boolean   | Default false     |
| rotation_count | integer   | Anti-replay       |
| created_at     | datetime  |                   |
| updated_at     | datetime  |                   |

> **Notes**

* Supports refresh token rotation
* Easy global logout via session revocation

---

## 6. OAuth Clients Table (If You Are an OAuth Provider)

```text
Purpose:
Registers applications that authenticate against your system.
```

| Column        | Data Type | Notes                      |
| ------------- | --------- | -------------------------- |
| id            | uuid      | PK                         |
| client_name   | string    | Human-readable             |
| client_id     | string    | Public identifier          |
| client_secret | string    | Encrypted, nullable (PKCE) |
| redirect_uris | jsonb     | Allowed callbacks          |
| created_at    | datetime  |                            |
| updated_at    | datetime  |                            |

---

## 7. Scopes Table (Authorization Boundary)

```text
Purpose:
Defines permissions a client or token may request.
```

| Column      | Data Type | Notes                        |
| ----------- | --------- | ---------------------------- |
| id          | uuid      | PK                           |
| name        | string    | 'profile', 'email', 'openid' |
| description | string    | Optional                     |
| created_at  | datetime  |                              |
| updated_at  | datetime  |                              |

---

## 8. User Scopes Table (Grants)

```text
Purpose:
Records granted permissions.
```

| Column     | Data Type | Notes           |
| ---------- | --------- | --------------- |
| id         | uuid      | PK              |
| user_id    | uuid      | FK → users(id)  |
| scope_id   | uuid      | FK → scopes(id) |
| granted_at | datetime  |                 |

---

## ❌ 9. AccountLinks Table — REMOVED

**Reason:**
You already model linking correctly via:

```
accounts.user_id → users.id
```

Having a separate `AccountLinks` table introduces:

* duplication
* ambiguity
* broken invariants

> **One user ← many accounts**
> That is enough.

---

## 10. (Optional but Recommended) Notification Channels

```text
Purpose:
Decouple authentication from communication.
```

| Column     | Data Type | Notes                  |
| ---------- | --------- | ---------------------- |
| id         | uuid      | PK                     |
| user_id    | uuid      | FK → users(id)         |
| type       | string    | 'email', 'sms', 'push' |
| address    | string    | email / phone / token  |
| verified   | boolean   | Default false          |
| created_at | datetime  |                        |
| updated_at | datetime  |                        |

> **Notes**

* Future-proof
* Allows multiple channels safely
* Clean consent boundary

---

## Final System Rules (Authoritative)

* **Users** = internal identity
* **Credentials** = first-party secrets
* **Accounts** = external identities
* **Email for notifications** = only verified user/channel email
* **Providers authenticate, services decide**

---

## One-line Uncle Bob Summary

> *Identity is internal. Authentication is pluggable. Communication is explicit.*

This schema is **clean**, **safe**, and **scales**.

If you want next:

* walk through **password vs GitHub login with this schema**
* or design **OTP tables cleanly**
* or review **security edge cases**

Say what you want.
