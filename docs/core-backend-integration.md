# Backend Integration

Nexa WebApp consumes Nexa Platform through RESTful endpoints under `/api/v1`.

## Local Environment

Local API base URL:

```text
http://localhost:8080/api/v1
```

Production API base URL:

```text
https://nexa-platform.onrender.com/api/v1
```

## Core Endpoints

| Frontend flow | Backend endpoint |
| --- | --- |
| Authentication | `/auth/login` |
| Workspace users | `/users`, `/users/me` |
| Catalog products | `/products`, `/catalog-items` |
| Categories | `/categories` |
| Customers | `/customers` |
| Purchase requests | `/purchase-requests` |
| Orders | `/orders` |
| Inventory | `/inventory`, `/inventory/movements`, `/inventory/alerts` |
| Warehouses | `/warehouses` |
| Dispatch | `/shipments`, `/driver-checklists` |
| Documents and payments | `/invoices`, `/business-documents`, `/payments` |

HTTP calls must remain in infrastructure adapters. Presentation views should delegate to stores/facades.
