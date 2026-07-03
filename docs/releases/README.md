# Nexa WebApp Releases

This folder documents release notes for the Angular WebApp used in the Open Source delivery.

## Policy

- Tags follow SemVer: `vMAJOR.MINOR.PATCH`.
- Generated `dist/` bundles are not committed.
- Release notes must describe Angular frontend scope, API integration, and validation evidence.

## Releases

| Version | Scope |
| --- | --- |
| [v2.0.1](./v2.0.1.md) | Open Source audit alignment and production integration verification |
| `v2.0.0` | Open Source delivery baseline: Angular, Render Static Site, Spring Boot API integration |

Current validation:

```bash
npm ci
npm run build
```
