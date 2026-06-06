# Core Backend Integration

This webapp can use the local Nexa Platform backend for the AV2 core flows while keeping json-server as fallback for modules that are not migrated yet.

## Local Environment

Use these values for local development:

```env
VITE_NEXA_API_BASE_URL=https://localhost:7001/api/v1
VITE_ENABLE_MOCK_API_FALLBACK=true
VITE_CORE_BACKEND_ENABLED=true
```

If the local HTTPS certificate is not trusted, use the backend HTTP profile and set:

```env
VITE_NEXA_API_BASE_URL=http://localhost:5000/api/v1
```

`VITE_CORE_BACKEND_ENABLED=false` keeps the old mock paths for validation sessions that do not run the backend.

## Core Endpoints

The following resources now use Nexa Platform first:

| Frontend flow | Backend endpoint | Mock fallback |
|---|---|---|
| Catalog products | `/catalog-items` | `/products` |
| Inventory lots view | `/inventory-items` | `/inventory-lots` |
| Purchase orders | `/orders` | `/purchase-orders` |

The central `data.store` no longer loads `products`, `inventoryLots`, `orders`, `purchaseOrders`, or `orderItems` through the generic mock endpoint map. Those collections are loaded through their bounded-context application services.

## Catalog Images

Product assets from the ICISA catalog zip are served from:

```txt
public/catalog-items/
```

Backend seed records store image URLs such as:

```txt
/catalog-items/Cavour_SALAME_MILANO_100G.jpeg
```

Vite serves those files directly from the public directory during local development and production builds.

## Current Boundary

Mock data remains enabled for non-core modules such as clients, promotions, documents, dispatch, payments, notifications, alerts, and portal support flows.

Render deployment is intentionally not configured in this release. The integration target is local validation against Nexa Platform plus mock fallback.
