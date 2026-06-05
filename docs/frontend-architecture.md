# Frontend Architecture

Nexa WebApp follows a bounded-context frontend layout over Vue 3, Vite, Pinia, Vue Router, PrimeVue, and a temporary json-server mock fallback.

## Official Contexts

| Context | Type | Frontend folder |
|---|---|---|
| Catalog Management | Business BC | `src/catalog-management/` |
| Sales | Business BC | `src/sales/` |
| Logistics | Business BC | `src/logistics/` |
| Warehouse | Business BC | `src/warehouse/` |
| Invoicing | Business BC | `src/invoicing/` |
| IAM | Application context | `src/iam/` |
| Shared | Shared/application support | `src/shared/` |

`src/app/`, `src/assets/`, `src/i18n/`, `src/router/`, and `src/main.js` are global application support areas, not business bounded contexts.

## Folder Mapping

| Former root folder | New location |
|---|---|
| `product-catalog/` | `catalog-management/` |
| `promotions/` | `catalog-management/` |
| `purchase-orders/` | `sales/` |
| `purchase-requests/` | `sales/` |
| `commercial-validation/` | `sales/` |
| `clients/` | `sales/` |
| `buyer-portal/` | `sales/` |
| `dispatch-orders/` | `logistics/` |
| `delivery-tracking/` | `logistics/` |
| `cold-chain-monitoring/` | `logistics/` |
| `customer-portals/` | `logistics/` |
| `inventory-control/` | `warehouse/` |
| `business-documents/` | `invoicing/` |
| `subscriptions/` | `invoicing/` |
| `analytics/` | `shared/` |
| `communications/` | `shared/` |

## Context Layers

```txt
src/<context>/
├── application/       Pinia stores and application orchestration
├── domain/            Entities, value objects, events, and repository contracts
├── infrastructure/    API clients, assemblers, resource DTOs, and mock adapters
└── presentation/      Context route module, views, and UI components
```

Large contexts keep feature folders inside each layer, for example `src/sales/application/purchase-orders/` and `src/logistics/infrastructure/dispatch-orders/`. Domain model files stay inside the context-level `domain/model/` so central business concepts are not spread across root feature folders.

## Route Modules

The app shell composes context routes from:

- `src/catalog-management/presentation/catalog-management.routes.js`
- `src/sales/presentation/sales.routes.js`
- `src/logistics/presentation/logistics.routes.js`
- `src/warehouse/presentation/warehouse.routes.js`
- `src/invoicing/presentation/invoicing.routes.js`
- `src/iam/presentation/iam.routes.js`
- `src/shared/presentation/shared.routes.js`

Public route paths remain stable under `/ops/...` and `/portal/...`. The refactor changes internal module ownership, not navigation URLs.

## Stores And APIs

Pinia stores remain feature-sized instead of one store per context. Examples:

- `src/sales/application/purchase-orders/purchase-orders.store.js`
- `src/sales/application/purchase-requests/purchase-requests.store.js`
- `src/catalog-management/application/product-catalog/product-catalog.store.js`

Infrastructure APIs are also feature-sized so future backend endpoints can be introduced per resource without changing context boundaries.

## Mock API Boundary

`server/db.json` and json-server remain as a mock API fallback used only until backend endpoints are available. Frontend infrastructure should treat it as temporary validation data, not as the production backend contract.

Expected future backend groups include `/api/v1/products`, `/api/v1/promotions`, `/api/v1/orders`, `/api/v1/purchase-requests`, `/api/v1/clients`, `/api/v1/dispatch-orders`, `/api/v1/deliveries`, `/api/v1/cold-chain-events`, `/api/v1/inventory-items`, `/api/v1/business-documents`, `/api/v1/subscriptions`, `/api/v1/invoices`, `/api/v1/authentication`, and `/api/v1/users`.

## Import Rules

Imports must use the bounded-context folder, not the former feature root. Examples:

- Use `@/sales/...`, not `@/purchase-orders/...`.
- Use `@/catalog-management/...`, not `@/product-catalog/...`.
- Use `@/logistics/...`, not `@/dispatch-orders/...`.
- Keep cross-cutting utilities under `@/shared/...`.
