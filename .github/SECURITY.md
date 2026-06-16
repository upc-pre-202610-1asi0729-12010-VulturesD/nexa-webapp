# Security Policy

We are committed to securing the Nexa WebApp B2B platform. This document outlines active versions, reporting mechanisms, and the secure development standards expected from contributors.

## Supported Versions

Only the latest active release branch is patched for security vulnerabilities. Academic tags are preserved for evaluation history and do not receive updates.

| Version | Supported | Security Patches |
|---|---|---|
| `v1.7.x` |  Yes | Active |
| `< v1.7.0` |  No | Terminated |

---

## Reporting a Vulnerability

> [!IMPORTANT]
> Do **NOT** disclose vulnerabilities or post private keys/credentials in public GitHub issues.

If you discover a security issue:
1. **Private Reporting**: Submit the details via a private email to the project maintainers or utilize the **GitHub Security Advisories** private reporting tool.
2. **Details to Include**: Provide a brief description, steps to reproduce, browser version, and a proof of concept if applicable.
3. **Response Timeline**: The team will review findings within 48 hours and coordinate a patch release in a dedicated feature/hotfix branch.

---

## Secure Coding Practices & Scope

Our security posture covers the following key boundaries inside each Bounded Context:

### 1. Credentials & Secret Management
- **No Hardcoded Secrets**: Secrets, local passwords, API tokens, and JWT configurations must never be committed to the repository.
- **Environment Isolation**: Always use `.env.development` or `.env.production` for URL endpoint parameters and ensure local credential overlays are git-ignored.

### 2. UI Injection & Data Sanitization
- **XSS Prevention**: Vue 3's template interpolation (`{{ }}`) automatically escapes HTML. Avoid using `v-html` unless the data source is explicitly sanitized.
- **Data Validation**: The Anti-Corruption Layer (ACL) in Pinia must validate model attributes before mutating local storage arrays to prevent state corruption.

### 3. Dependency Security
- Before opening a pull request, run:
  ```bash
  npm audit
  ```
- Any critical vulnerability in npm packages must be addressed by updating package dependencies in `package.json` and regenerating the lockfile.
