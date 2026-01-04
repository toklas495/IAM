# IAM – Identity & Access Management Playground

IAM is a **backend-focused Identity & Access Management (IAM) engineering repository**.

This repository is **not a tutorial**, **not a boilerplate**, and **not a framework**.

It is a **collection of real authentication & authorization systems**, each built as an **independent, production-style backend project**, to deeply understand **how identity actually works in the real world**.

> Authentication is not “login”.
> Authentication is **cryptography, state, trust, identity, and threat modeling**.

---

## 🎯 Purpose of This Repository

This repository exists to:

- Build **authentication systems from scratch**
- Understand **why** protocols exist, not just **how to use them**
- Simulate **real enterprise IAM problems**
- Create a **portfolio that proves IAM expertise**, not buzzwords

This is the backend brain behind any serious product.

---

## 🧠 What IAM Covers

IAM (Identity & Access Management) is broader than OAuth or JWT.

This repository focuses on:

- Identity lifecycle (create → verify → authenticate → authorize → revoke)
- Session & token security
- Federation & Single Sign-On (SSO)
- Enterprise identity integration
- Authorization models (RBAC, ABAC, policies)

---

## 🧱 Repository Structure

```text
IAM/
├── Auth_1/          # Password → JWT → OAuth → OIDC (COMPLETED)
├── Auth_2/          # SSO, SAML, Enterprise Federation (PLANNED)
├── Auth_3/          # MFA, Passwordless, Passkeys (PLANNED)
├── Auth_4/          # Authorization: RBAC, ABAC, Multi-tenant (PLANNED)
└── docs/            # Architecture notes & deep explanations
