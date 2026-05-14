# Fake API audit

Project: Nexa WebApp  
Team: Vultures Devs  
Date: 2026-05-14

## 1. Hardcoded business data result

Result: No hardcoded business data remains in Angular components or services after this pass.

Angular business data now comes from `server/db.json` through `/api/v1/*` resources, or from the static review fallback under `public/api/v1/*.json` for hosted GET views.

## 2. Feature data source table

| Feature | Angular files checked | Data source | Status | Notes |
|---|---|---|---|---|
| IAM/Auth | `src/app/iam/infrastructure/auth-api.ts`, `src/app/iam/presentation/views/login.page.ts`, `src/app/iam/application/iam.store.ts` | `/api/v1/users` | OK | Quick access profiles come from users endpoint. Password fallback literal removed. |
| Dashboard | `src/app/dashboard/infrastructure/dashboard-api.ts`, `src/app/dashboard/presentation/views/dashboard.page.ts` | `/api/v1/orders`, `/api/v1/products`, `/api/v1/dispatches`, `/api/v1/alerts`, `/api/v1/activity-log`, `/api/v1/clients`, `/api/v1/inventory-lots` | OK | KPIs are computed from API responses. |
| Product catalog | `src/app/catalog/infrastructure/products-api.ts`, `src/app/catalog/presentation/views/products.page.ts` | `/api/v1/products`, `/api/v1/categories` | OK | Category filters and details derive from product payload. |
| Clients | `src/app/clients/infrastructure/clients-api.ts`, `src/app/clients/presentation/views/clients.page.ts` | `/api/v1/clients` | OK | Client rows come from Fake API. |
| Orders | `src/app/ordering/infrastructure/orders-api.ts`, `src/app/ordering/presentation/views/orders.page.ts`, `src/app/ordering/presentation/views/order-detail.page.ts` | `/api/v1/orders`, `/api/v1/products`, `/api/v1/clients` | OK | Detail page resolves order by id from the orders collection so hosted static fallback also works. |
| Create order | `src/app/ordering/presentation/views/order-new.page.ts`, `src/app/ordering/infrastructure/orders-api.ts` | GET `/api/v1/clients`, GET `/api/v1/products`, GET/POST `/api/v1/orders` | OK | Browser smoke created one order through Fake API; test record was removed after validation. |
| Inventory | `src/app/inventory/infrastructure/inventory-api.ts`, `src/app/inventory/presentation/views/inventory.page.ts` | `/api/v1/warehouses`, `/api/v1/products`, `/api/v1/inventory-lots` | OK | Stock, lots, and warehouse labels come from API resources. |
| Lots | `src/app/inventory/presentation/views/lots.page.ts` | `/api/v1/inventory-lots`, `/api/v1/products` | OK | Product names are joined from products endpoint. |
| Stock movements | `src/app/inventory/presentation/views/stock-movements.page.ts` | `/api/v1/stock-movements`, `/api/v1/products` | OK | Movement rows come from Fake API. |
| Dispatch | `src/app/dispatch/infrastructure/dispatches-api.ts`, `src/app/dispatch/presentation/views/dispatches.page.ts`, `src/app/dispatch/presentation/views/dispatch-detail.page.ts` | `/api/v1/dispatches`, `/api/v1/clients`, `/api/v1/orders` | OK | Detail page resolves dispatch by id from the dispatch collection so hosted static fallback also works. |
| Analytics/Reports | `src/app/analytics/application/analytics.store.ts`, `src/app/analytics/presentation/views/analytics.page.ts`, `src/app/analytics/presentation/views/reports.page.ts` | Derived from `/api/v1/orders`, `/api/v1/products`, `/api/v1/inventory-lots`, `/api/v1/dispatches` | OK | Report metrics are computed from API responses. |
| Portal | `src/app/portal/application/portal.store.ts`, `src/app/portal/presentation/views/portal.page.ts` | `/api/v1/users`, `/api/v1/products`, `/api/v1/orders`, `/api/v1/clients` scoped by `clientId` | OK | Buyer scope is filtered by session `clientId`. |
| Alerts | `src/app/dashboard/infrastructure/dashboard-api.ts` | `/api/v1/alerts` | OK | Dashboard alerts come from Fake API. |
| Activity | `src/app/dashboard/infrastructure/dashboard-api.ts` | `/api/v1/activity-log` | OK | Recent activity comes from Fake API. |

## 3. Hardcoded findings

| File | Pattern | Classification | Fix applied |
|---|---|---|---|
| `src/app/iam/presentation/views/login.page.ts` | fallback password literal in quick profile picker | Problem: hardcoded demo credential fallback | Removed fallback; selected profile password now comes only from `/api/v1/users`. |
| `src/app/ordering/presentation/views/order-new.page.ts` | order id prefix and regex | Allowed UI/domain id formatter | No change. It derives next id from existing `/api/v1/orders`. |
| `src/app/shared/infrastructure/services/i18n.service.ts` | RUC, route, role, status, and UI text dictionaries | Allowed UI/static labels | No change. |
| Feature pages and API adapters | `clientId`, `productId`, `warehouse`, `dispatch`, `activityLog` fields | Allowed data binding/model fields | No change. Values come from API payloads. |

## 4. Endpoint verification

| Endpoint | Result | Notes |
|---|---|---|
| `/api/v1/users` | 200, 3 records | OK |
| `/api/v1/products` | 200, 12 records | OK |
| `/api/v1/categories` | 200, 6 records | OK |
| `/api/v1/warehouses` | 200, 2 records | OK |
| `/api/v1/inventory-lots` | 200, 11 records | OK |
| `/api/v1/stock-movements` | 200, 6 records | OK |
| `/api/v1/clients` | 200, 6 records | OK |
| `/api/v1/orders` | 200, 11 records | OK |
| `/api/v1/dispatches` | 200, 3 records | OK |
| `/api/v1/alerts` | 200, 5 records | OK |
| `/api/v1/activity-log` | 200, 6 records | OK |
| `/api/v1/orders/ORD-2026-0412` | 200 | Detail route OK in local JSON Server. |
| `/api/v1/dispatches/DSP-2026-0089` | 200 | Detail route OK in local JSON Server. |

Kebab-case mappings verified in `server/routes.json`:

| Public route | JSON Server resource |
|---|---|
| `/api/v1/inventory-lots` | `/inventoryLots` |
| `/api/v1/stock-movements` | `/stockMovements` |
| `/api/v1/activity-log` | `/activityLog` |

## 5. Build result

`npm install`: completed. Existing dependency advisory count reported by npm was not changed.  
`npm run build`: passed. Angular output written at `dist/nexa-webapp`.

Note: local Node was `v25.2.1`, and Angular printed the standard odd-numbered Node warning.

## 6. Runtime smoke result

`npm run dev:all`: passed. Angular dev server ran on `http://localhost:5173/`; JSON Server ran on `http://localhost:3000/`.

Browser smoke covered:

| Area | Route/result |
|---|---|
| Login | `/login` commercial login OK |
| Dashboard | `/dashboard` OK |
| Catalog | `/products` OK |
| Clients | `/clients` OK |
| Orders | `/orders` OK |
| Create order page | `/orders/new` OK |
| Order detail | `/orders/ORD-2026-0412` OK |
| Inventory | `/inventory` OK with logistics session |
| Lots | `/inventory/lots` OK with logistics session |
| Stock movements | `/stock-movements` OK with logistics session |
| Dispatch | `/dispatches` OK with logistics session |
| Dispatch detail | `/dispatches/DSP-2026-0089` OK with logistics session |
| Analytics | `/analytics` OK |
| Reports | `/reports` OK |
| Buyer portal | `/portal` OK with buyer session |

Browser console error check: 0 errors.  
Kebab-case 404 check: none observed during app smoke.

## 7. Create order test result

Create order flow passed through browser UI:

1. Selected client from `/api/v1/clients`.
2. Selected product from `/api/v1/products`.
3. Submitted POST to `/api/v1/orders`.
4. JSON Server returned `201`.
5. App navigated to the new order detail route.

The temporary test order was removed from `server/db.json` after validation.

## 8. Remaining risks

| Risk | Impact | Status |
|---|---|---|
| Hosted static fallback supports GET views only. | Create/update flows need local JSON Server or another writable API process. | Expected TB1 limitation. |
| JSON Server returned 500 for manual DELETE cleanup of the temporary order. | Cleanup had to be done by removing the local test record. App create flow itself returned 201. | Local tooling limitation, documented. |
| `npm install` reports dependency advisories. | Not part of Fake API integration scope. | Left unchanged. |
