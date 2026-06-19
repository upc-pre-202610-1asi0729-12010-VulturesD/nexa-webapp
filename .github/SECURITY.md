# Security Policy

## Scope

This repository contains the Nexa Angular WebApp.

| Area | Status |
|---|---|
| Angular UI and routing | In scope |
| API base URL configuration | In scope |
| Client-side session handling | In scope |
| Render Static Site deployment | In scope |
| Backend vulnerabilities | Report in `nexa-platform` |
| Landing website issues | Report in `nexa-website` |

## Reporting A Vulnerability

Do not open a public issue for vulnerabilities. Contact maintainers privately with:

- affected route or file,
- reproduction steps,
- expected impact,
- suggested fix if available.

## Secure Coding Practices

- Do not commit secrets, tokens, or `.env` files.
- Keep API URLs in Angular environment files.
- Do not hardcode credentials in presentation components.
- Run `npm audit` when reviewing dependency risk.

---

Team Nexa · Course 1ASI0729 · 2026-10
