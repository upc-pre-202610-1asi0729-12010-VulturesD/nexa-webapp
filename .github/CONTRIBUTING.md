# Contributing to Nexa WebApp

This repository contains the Angular WebApp for Nexa.

## Architecture Rules

- Preserve bounded contexts under `src/app`.
- Keep HTTP calls in infrastructure adapters, not presentation views.
- Keep application state and orchestration in application stores/facades.
- Keep domain models free of Angular Material, DOM, and HTTP concerns.
- Keep UI changes consistent with the existing Angular Material and Nexa design system.
- Do not change API endpoint contracts without updating `nexa-platform` and documentation.

## Local Validation

```bash
npm ci
npm run build
```

Local development:

```bash
npm start
```

The local API base URL is configured in `src/environments/environment.ts`.

## Branches And Commits

- Use GitFlow-style branches: `feature/*`, `fix/*`, `docs/*`, `refactor/*`, `chore/*`.
- Use Conventional Commits when possible:
  - `feat(portal): add buyer request detail view`
  - `fix(api): prevent duplicate api base path`
  - `docs(render): document static site deployment`

## Pull Request Checklist

- [ ] `npm run build` succeeds.
- [ ] No generated directories such as `dist/`, `.angular/`, or `node_modules/` are committed.
- [ ] No secrets or local `.env` files are committed.
- [ ] UI changes remain responsive.
- [ ] Visible content remains aligned with Nexa cold-chain B2B domain language.
