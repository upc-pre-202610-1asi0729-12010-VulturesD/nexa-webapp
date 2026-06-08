# Backend Integration

This webapp consumes the local Nexa Platform backend for supported AV2 flows. Modules without an exposed backend endpoint stay in a pending-support state instead of using local replacement data.

## Local Environment

Use these values for local development:

```env
VITE_NEXA_API_BASE_URL=http://localhost:5068/api/v1
VITE_ENABLE_MOCK_API_FALLBACK=false
VITE_CORE_BACKEND_ENABLED=true
```

Swagger is available at `http://localhost:5068/swagger` when the backend is running locally.

## Core Endpoints

The following resources consume Nexa Platform endpoints:

| Frontend flow | Backend endpoint |
|---|---|
| Catalog products | `/catalog-items` |
| Product categories | `/categories` |
| Product brands | `/brands` |
| Inventory lots view | `/inventory-items` |
| Warehouses | `/warehouses` |
| Purchase orders | `/orders` |
| Dispatch orders | `/shipments` |
| Business documents | `/invoices`, `/payments` |
| Authentication | `/authentication/sign-in` |

The central `data.store` loads supported collections through bounded-context application services and infrastructure adapters.

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

Backend support is still pending for clients, promotions, purchase request workflow, customer portals, advanced analytics, account administration, editable buyer profiles, payment method management, proof-of-delivery upload, and order/dispatch status mutations.

The integration target is local validation against Nexa Platform. Unsupported modules should show a professional pending state until their backend contracts are available.
