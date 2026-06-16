# AV2 WebApp Data Source Map

## Local Execution

- Backend: `http://localhost:5068/api/v1`
- WebApp: `npm run dev`

## Data Sources

| Module/Screen | Source | Endpoint or Local Data Key | Notes |
|---|---|---|---|
| Authentication | Real backend | `POST /authentication/sign-in` | Supported by Nexa Platform. |
| Product Catalog | Real backend | `GET /catalog-items`, `/categories`, `/brands` | Backend exposes catalog data and product assets. |
| Buyer Catalog | Real backend | `GET /catalog-items`, `/categories`, `/brands` | Same catalog contract, buyer presentation. |
| Inventory Control | Real backend | `GET /inventory-items`, `/warehouses` | Backend exposes stock and warehouse records. |
| Purchase Orders | Real backend | `GET /orders` | Backend exposes seeded orders and order items. |
| Buyer Orders | Real backend | `GET /orders` | Buyer view filters backend orders by client. |
| Dispatch Orders | Real backend | `GET /shipments` | Shipments are adapted to dispatch board cards. |
| Proof of Delivery display | Real backend + local display state | `GET /shipments` | Shipment display is supported; upload mutation is not. |
| Business Documents | Real backend | `GET /invoices`, `/payments` | Invoices and payments are backend-backed. |
| Buyer Business Documents | Real backend | `GET /invoices`, `/payments` | Buyer view filters backend document records. |
| B2B Clients | In-memory local data | `clients`, `clientContacts`, `deliveryAddresses` | Client endpoints are not exposed yet. |
| Purchase Requests | In-memory local data | `purchaseRequests`, `requestItems`, `messages` | Request workflow endpoint is not exposed yet. |
| Request Builder | In-memory local data | `purchaseRequests`, `requestItems` | Request mutation is local workspace support for presentation. |
| Commercial Validation | In-memory local data | `purchaseRequests`, `requestItems`, `creditRequests` | Validation workflow for requests is not exposed yet. |
| Promotions | In-memory local data | `promotions` | Promotion endpoint is not exposed yet. |
| Customer Portals | In-memory local data | `customerPortals`, `portalRequirements`, `portalUploadTasks` | External portal configuration is not exposed yet. |
| Company Administration | In-memory local data | `users`, `subscriptions` | Company management endpoints are not exposed yet. |
| Editable Profile Areas | Local/session + in-memory data | session user, `clients`, `clientContacts` | Authentication is real; profile update endpoint is not exposed yet. |
| Payment Method Management | Real backend + in-memory data | `/payments`, `paymentMethods`, `creditPayments` | Payment records are real; saved method management is not exposed yet. |
| Operational Analytics | Real backend + in-memory data | backend orders/shipments/inventory, `temperatureLogs`, `stockMovements` | Core metrics use real data; supplemental operational logs are local. |
| Support Conversations | In-memory local data | `supportConversations`, `messages` | Support workflow endpoint is not exposed yet. |

## Real Backend Modules

- Authentication
- Categories
- Brands
- Catalog items
- Warehouses
- Inventory items
- Orders
- Shipments
- Invoices
- Payments

## In-Memory Local Modules

- B2B clients
- Purchase requests and request items
- Promotions
- Customer portals and upload tasks
- Company users and subscription settings
- Payment methods and credit requests
- Temperature logs and stock movements
- Support conversations and buyer messages

## Notes

- Static initial data is used only for WebApp areas not yet exposed by backend endpoints.
- Real backend modules do not use any fallback.
- `npm run dev` starts the WebApp.

