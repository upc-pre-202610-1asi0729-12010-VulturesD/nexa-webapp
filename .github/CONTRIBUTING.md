# Contributing to Nexa WebApp

Thank you for your interest in contributing to Nexa WebApp! This document outlines the standards, guidelines, and workflows for contributing to our Vue 3 / Vite B2B cold-chain operations application.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md) at all times.

## Architectural Guidelines

The Nexa WebApp frontend is structured modularly. When adding or modifying code, please respect the boundaries of each Bounded Context:

1. **State & Local Data (Pinia):**
   - Keep global application cache in `src/app/application/stores/data.store.js`.
   - Never query or mutate the global store directly from presentation layers; utilize designated actions.
   - For modules without live backend endpoints, always ensure that data.store.js uses deep clones of the static `initial-data.json` to manage in-memory CRUD operations safely.

2. **Presentation Components (Vue 3 / PrimeVue 4):**
   - Follow the Vue 3 Composition API style utilizing `<script setup>`.
   - Use layout rules defined in `src/assets/styles/ops.css` and utility classes for layout changes. Do not inject ad-hoc custom styles into component code unless absolutely necessary.
   - Ensure all layouts are responsive and function correctly on smaller screens. Maintain flexible grid layouts (`repeat(auto-fit, minmax(N, 1fr))`) and avoid hardcoded widths that break the viewport.

3. **HTTP Client & REST APIs (Axios):**
   - Inherit API class endpoints from `BaseEndpoint` or `BaseApi`.
   - All network configurations reside under `src/shared/infrastructure/http.js`. Do not define custom Axios instances inline in components.
   - Clean up credentials and configurations: never hardcode passwords, session keys, or mentions of "fakeapi" or mock routing configurations in backend API connections.

## Git & Development Workflow

We use a standard GitFlow workflow for planning, developing, and releasing software.

### Branch Strategy

- `main`: Houses stable, production-ready releases.
- `develop`: The primary branch for integrating completed feature branches.
- `feature/*`: Work branches for individual features or bug fixes. Always branch off `develop`.
- `hotfix/*`: Quick corrections directly targeting critical bugs in `main`.

### Commit Message Format

Every commit must follow this structured multiline format:

```txt
<type>(<scope>): <short action summary>

Context:
- What area, milestone or branch this commit belongs to.

Changes:
- What was changed.
- What was added, corrected or normalized.

Reason:
- Why the change was necessary.

Validation:
- What was reviewed or checked before committing.
```

#### Commit Types:
- `feat`: A new user-facing feature.
- `fix`: A bug fix.
- `docs`: Documentation edits.
- `style`: Formatting, layout padding tweaks, style corrections.
- `refactor`: Code restructuring without user-facing behavior changes.

#### Example Commit:
```txt
feat(sales): add commercial orders list component

Context:
- Sales Context, commercial verification milestone, branch feature/sales-orders.

Changes:
- Added OrdersDataTable component in sales presentation.
- Connected search filters to catalog items.

Reason:
- Needed to let operators verify incoming buyer orders on small monitors.

Validation:
- Tested responsive table width rendering down to 480px.
- Verified compilation via npm run build.
```

---

## Pull Request Guidelines

Before opening a pull request, please complete the following verification checklist:

1. **Clean Code**: Ensure there are no leftover debug comments, console logs, or references to placeholder systems.
2. **Build Success**: Verify that compiling the project succeeds locally:
   ```bash
   npm run build
   ```
3. **No Garbage Files**: Do not commit build directories (`dist/`), packages (`node_modules/`), local env files (`.env.local`), IDE settings, or OS-specific cache files (`.DS_Store`).
