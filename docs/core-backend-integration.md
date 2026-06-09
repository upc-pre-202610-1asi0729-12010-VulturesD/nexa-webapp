# Backend Integration

This webapp consumes the local Nexa Platform backend for supported AV2 flows and uses an optional local mock API for unsupported presentation modules.

## Local Environment

Use these values for local development:

```env
VITE_NEXA_API_BASE_URL=http://localhost:5068/api/v1
VITE_NEXA_MOCK_API_BASE_URL=http://127.0.0.1:3000
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

Optional mock resources are used for clients, promotions, purchase request workflow, customer portals, account administration, editable buyer profile display, payment method management, temperature logs, stock movements, support conversations, and proof-of-delivery upload display.

The integration target is local validation against Nexa Platform plus an isolated mock server for unsupported modules. Supported backend modules must not call the mock server.
