# Frontend Architecture

Nexa WebApp follows a bounded-context frontend layout over Vue 3, Vite, Pinia, Vue Router, PrimeVue, and a json-server Fake API.

## Main Layers

```txt
src/<context>/
├── application/       Pinia stores and application orchestration
├── domain/            Entities, value objects, events, repository contracts
├── infrastructure/    API clients, assemblers, resource DTOs
└── presentation/      Routes, views, and UI components
```

## Application Shell

- `src/app/presentation/app-routes.js` composes Ops and Portal route trees.
- `src/router/index.js` applies hash-based routing and scope guards.
- `src/app/application/stores/data.store.js` centralizes Fake API data loading and runtime state mutations.

## Shared Infrastructure

- `src/shared/infrastructure/base-endpoint.js` wraps resource endpoint access.
- `src/shared/status.js` centralizes status labels and badge mapping.
- `src/assets/styles/ops.css` contains operational layout, table, badge, card, empty-state, and responsive styles.

## Scope Boundary

The current frontend validates flows with simulated API data. It does not claim production authentication, production telemetry, or real backend persistence.
