# API Design Guidelines

The WebApp connects to the backend REST API layer.

## 1. Endpoint Architecture
- All API services inherit from the `BaseEndpoint` or `BaseApi` classes in `src/app/shared/infrastructure/`.
- Services encapsulate HTTP methods (GET, POST, PUT, DELETE) using a clean, asynchronous Angular HttpClient client wrapper.
- All requests target the base url defined under `environment.apiBaseUrl` in environment files.

## 2. In-Memory Static Data Fallbacks
- For features that operate locally or lack active backend endpoints in this version, the application deep-clones a structured `public/api/v1 fallback assets` file inside `src/app/application/stores/context application stores`.
- Mutating actions (adding orders, client parameters, or setting mock logs) update the Angular application stores store state directly and return immediately. This prevents console connection errors and maintains user experience consistency.

---

[Home](Home.md) | [Project Overview](Project-Overview.md) | [Architecture](Frontend-Architecture.md) | [Development Workflow](Branching-and-Commits.md) | [Quality & Security](Quality-and-Security.md)
