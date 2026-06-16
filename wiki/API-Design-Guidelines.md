# API Design Guidelines

The WebApp connects to the backend REST API layer.

## 1. Endpoint Architecture
- All API services inherit from the `BaseEndpoint` or `BaseApi` classes in `src/shared/infrastructure/`.
- Services encapsulate HTTP methods (GET, POST, PUT, DELETE) using a clean, asynchronous Axios client wrapper.
- All requests target the base url defined under `VITE_NEXA_API_BASE_URL` in environment files.

## 2. In-Memory Static Data Fallbacks
- For features that operate locally or lack active backend endpoints in this version, the application deep-clones a structured `initial-data.json` file inside `src/app/application/stores/data.store.js`.
- Mutating actions (adding orders, client parameters, or setting mock logs) update the Pinia store state directly and return immediately. This prevents console connection errors and maintains user experience consistency.

---

<p align="center">
  [Home](Home.md) · [Project Overview](Project-Overview.md) · [Architecture](Frontend-Architecture.md) · [Development Workflow](Branching-and-Commits.md) · [Quality & Security](Quality-and-Security.md)
</p>
