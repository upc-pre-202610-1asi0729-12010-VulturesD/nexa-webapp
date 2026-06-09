# AV2 WebApp Data Source Map

## Local Execution

- Backend: `http://localhost:5068/api/v1`
- Optional mock API: `http://127.0.0.1:3000`
- WebApp: `npm run dev`
- Optional mock server: `npm run server`

## Data Sources

| Module/Screen | Source | Endpoint or Mock Resource | Notes |
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
| B2B Clients | Optional mock API | `clients`, `clientContacts`, `deliveryAddresses` | Client endpoints are not exposed yet. |
| Purchase Requests | Optional mock API | `purchaseRequests`, `requestItems`, `messages` | Request workflow endpoint is not exposed yet. |
| Request Builder | Optional mock API/local store | `purchaseRequests`, `requestItems` | Request mutation is local workspace support for presentation. |
| Commercial Validation | Optional mock API | `purchaseRequests`, `requestItems`, `creditRequests` | Validation workflow for requests is not exposed yet. |
| Promotions | Optional mock API | `promotions` | Promotion endpoint is not exposed yet. |
| Customer Portals | Optional mock API | `customerPortals`, `portalRequirements`, `portalUploadTasks` | External portal configuration is not exposed yet. |
| Company Administration | Optional mock API | `users`, `subscriptions` | Company management endpoints are not exposed yet. |
| Editable Profile Areas | Local/session + optional mock API | session user, `clients`, `clientContacts` | Authentication is real; profile update endpoint is not exposed yet. |
| Payment Method Management | Real backend + optional mock API | `/payments`, `paymentMethods`, `creditPayments` | Payment records are real; saved method management is not exposed yet. |
| Operational Analytics | Real backend + optional mock API | backend orders/shipments/inventory, `temperatureLogs`, `stockMovements` | Core metrics use real data; supplemental operational logs are local. |
| Support Conversations | Optional mock API | `supportConversations`, `messages` | Support workflow endpoint is not exposed yet. |

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

## Mock/Local Demo Modules

- B2B clients
- Purchase requests and request items
- Promotions
- Customer portals and upload tasks
- Company users and subscription settings
- Payment methods and credit requests
- Temperature logs and stock movements
- Support conversations and buyer messages

## Notes

- Mock data is used only for WebApp areas not yet exposed by backend endpoints.
- Real backend modules do not use mock fallback.
- `npm run dev` starts only the WebApp.
- `npm run server` starts only the optional mock API for unsupported modules.
