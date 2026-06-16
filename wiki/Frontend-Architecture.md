# Frontend Architecture & DDD

Nexa WebApp follows a Bounded-Context frontend layout over Vue 3, Vite, Pinia, Vue Router, PrimeVue, and the Nexa Platform REST API. The design applies Clean Architecture and Domain-Driven Design (DDD) principles to the frontend presentation layer.

---

## Bounded Context Boundaries

The client codebase is structured strictly around **Bounded Contexts**, aligning directly with the backend subdomains and business domains:

| Context | Type | Frontend Bounded Context Folder |
|---|---|---|
| **Catalog Management** | Core Subdomain | `src/catalog-management/` |
| **Sales** | Core Subdomain | `src/sales/` |
| **Logistics** | Supporting Subdomain | `src/logistics/` |
| **Warehouse** | Core Subdomain | `src/warehouse/` |
| **Invoicing** | Generic Subdomain | `src/invoicing/` |
| **IAM** | Application Context | `src/iam/` |
| **Shared** | Shared Kernel | `src/shared/` |

---

## Clean Architecture Layers

Inside each Bounded Context, code is separated into four layers to decouple user interface mechanisms from core business rules:

```txt
src/<context>/
├── domain/            # Entities, Value Objects, and Domain Repository interfaces
├── application/       # Pinia stores, orchestrators, and application services
├── infrastructure/    # API clients, DTOs (Data Transfer Objects), and adapters
└── presentation/      # Context routes, views, widgets, and UI components
```

### 1. Domain Layer (`domain/`)
- Contains local read models, entities, and value objects representing the client-side domain rules and invariants.
- Establishes the contracts for remote servers or store operations.
- Avoids dependencies on UI frameworks or HTTP network wrappers.

### 2. Application Layer (`application/`)
- Orchestrates context use cases by coordinating actions and state transitions.
- Utilizes localized **Pinia stores** to manage client state and cache data collections.

### 3. Infrastructure Layer (`infrastructure/`)
- Handles database/network details, defining the Axios API classes that inherit from `BaseEndpoint` or `BaseApi`.
- Converts raw network payloads (DTOs) into clean domain model structures via translators or assemblers.

### 4. Presentation Layer (`presentation/`)
- Composes standard Vue 3 Composition API components (views, routing configuration, widgets).
- Focuses entirely on presentation concern, data binding, and PrimeVue UI composition.

---

## Frontend DDD Patterns

### 1. Ubiquitous Language Integration
To maintain semantic alignment across the entire product ecosystem, terminology is shared between the C# backend and Vue 3 frontend:
- Avoid generic terms like "product" or "bill". Use the explicit aggregates: `CatalogItem`, `Order`, `InventoryItem`, `Invoice`, `Shipment`, and `Payment`.

### 2. Anti-Corruption Layer (ACL) for In-Memory Fallbacks
For contexts not yet integrated with live backend services (e.g., promotions, purchase requests, support messages), the local data manager in `src/app/application/stores/data.store.js` acts as an **Anti-Corruption Layer (ACL)**:
- It intercepts infrastructure repository calls and clones static records (`src/shared/data/initial-data.json`) in-memory.
- By translating raw mock states into valid domain aggregates, it isolates presentation modules from changes in the backend integration status, suppressing 404 connection errors.

### 3. Separation of Domain Entities and View DTOs
- Models representing core aggregates reside under the context-level `domain/model/` (e.g. `product.entity.js`, `dispatch.entity.js`).
- This prevents network DTO schema changes from directly breaking presentation data binding.

---

<p align="center">
  [Home](Home.md) · [Project Overview](Project-Overview.md) · [Architecture](Frontend-Architecture.md) · [Development Workflow](Branching-and-Commits.md) · [Quality & Security](Quality-and-Security.md)
</p>
