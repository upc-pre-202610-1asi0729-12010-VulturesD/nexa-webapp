# Frontend Architecture

Nexa WebApp follows a bounded-context frontend layout over Vue 3, Vite, Pinia, Vue Router, PrimeVue, the Nexa Platform REST API, and an optional local mock API for unsupported AV2 modules.

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
├── infrastructure/    API clients, assemblers, resource DTOs, and adapters
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

Buyer Portal support flows remain constrained by available backend contracts. Advanced guided support should be enabled only after an official endpoint is exposed.

## Backend Boundary

Supported modules consume Nexa Platform through `VITE_NEXA_API_BASE_URL`. Unsupported modules may consume the optional mock API through `VITE_NEXA_MOCK_API_BASE_URL`.

Catalog, inventory, warehouses, purchase orders, shipments, invoices, payments, categories, brands, and authentication consume Nexa Platform endpoints. Clients, purchase requests, promotions, customer portals, editable payment methods, support conversations, temperature logs, and stock-movement supplements use isolated mock resources. See `docs/av2-webapp-data-source-map.md` for ownership by screen.

Expected future backend groups include `/api/v1/promotions`, `/api/v1/purchase-requests`, `/api/v1/clients`, `/api/v1/deliveries`, `/api/v1/cold-chain-events`, `/api/v1/subscriptions`, `/api/v1/payment-methods`, and profile administration endpoints.

## Import Rules

Imports must use the bounded-context folder, not the former feature root. Examples:

- Use `@/sales/...`, not `@/purchase-orders/...`.
- Use `@/catalog-management/...`, not `@/product-catalog/...`.
- Use `@/logistics/...`, not `@/dispatch-orders/...`.
- Keep cross-cutting utilities under `@/shared/...`.
- Keep filenames in kebab-case, including entity and repository files such as `product.entity.js`, `dispatch.entity.js`, and `repository.js`.
- Avoid case-only filename differences because Linux CI and deployment hosts are case-sensitive.
