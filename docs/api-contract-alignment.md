# API Contract Alignment

## Scope

This note records WebApp contract checks for the buyer portal and operational modules.

## WebApp Endpoints

- IAM reads `/api/v1/users` through the configured API path and uses bundled data when the service is unavailable.
- Catalog reads `/api/v1/products` and `/api/v1/categories`.
- Sales reads `/api/v1/orders`.
- Client-facing commercial views keep the WebApp domain name `clients`; the adapter also accepts the platform customer endpoint.
- Warehouse reads inventory, warehouse and movement resources through the API path with bundled data fallbacks.
- Logistics reads dispatch resources through the API path with bundled data fallbacks.
- Analytics reads orders, products, inventory lots and dispatches with bundled data fallbacks.
- Buyer Portal composes orders, products, clients, requests, documents, payment methods and promotions from the existing WebApp domain data.

## Platform Endpoint Bridge

The platform currently exposes customers as `/api/v1/customers`, while the WebApp domain uses the buyer-facing term `clients`. The WebApp client adapter now tries the existing WebApp endpoint first, then adapts platform customers, then falls back to bundled review data.

## Known Follow-Up

- Dispatch and shipment naming still need a platform-side contract decision before removing WebApp fallback data.
- Inventory lots and stock movements remain WebApp review data unless matching platform resources are expanded.
- Buyer Portal request, document and payment workflows are read-only review flows until dedicated platform endpoints are added.
