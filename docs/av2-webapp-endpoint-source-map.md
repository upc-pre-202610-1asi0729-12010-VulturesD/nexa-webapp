# AV2 WebApp Endpoint Source Map

This document describes the API source mapping and endpoint architecture for the local execution of the Nexa WebApp. The application functions in a hybrid mode, routing traffic to either the real backend platform or a local mock server based on whether the module is supported.

## Local Services
- **Real Backend**: `http://localhost:5068/api/v1`
- **Mock API**: `http://127.0.0.1:3000/api/v1`
- **WebApp**: `http://localhost:5173`

---

## Real Backend Modules
These modules are backed by the database-backed ASP.NET Core platform and must always route to the real backend. They will fail visibly if the backend is down, preserving system integrity.

| Module | Endpoint Prefix | Source |
|---|---|---|
| authentication | `/api/v1/authentication` | Real Backend |
| categories | `/api/v1/categories` | Real Backend |
| brands | `/api/v1/brands` | Real Backend |
| catalog-items | `/api/v1/catalog-items` | Real Backend |
| warehouses | `/api/v1/warehouses` | Real Backend |
| inventory-items | `/api/v1/inventory-items` | Real Backend |
| orders | `/api/v1/orders` | Real Backend |
| shipments | `/api/v1/shipments` | Real Backend |
| invoices | `/api/v1/invoices` | Real Backend |
| payments | `/api/v1/payments` | Real Backend |

---

## Mock API Modules
These modules represent unsupported or future capabilities and are backed by the mock JSON Server. Kebab-case semantic paths are mapped to camelCase resource keys on the server.

| Module | Semantic Route Prefix | Mock Resource |
|---|---|---|
| clients | `/api/v1/clients` | `clients` |
| client-contacts | `/api/v1/client-contacts` | `clientContacts` |
| delivery-addresses | `/api/v1/delivery-addresses` | `deliveryAddresses` |
| purchase-requests | `/api/v1/purchase-requests` | `purchaseRequests` |
| request-items | `/api/v1/request-items` | `requestItems` |
| promotions | `/api/v1/promotions` | `promotions` |
| customer-portals | `/api/v1/customer-portals` | `customerPortals` |
| portal-requirements | `/api/v1/portal-requirements` | `portalRequirements` |
| portal-upload-tasks | `/api/v1/portal-upload-tasks` | `portalUploadTasks` |
| company-admin-users | `/api/v1/company-admin-users` | `companyAdminUsers` |
| subscriptions | `/api/v1/subscriptions` | `subscriptions` |
| payment-methods | `/api/v1/payment-methods` | `paymentMethods` |
| credit-requests | `/api/v1/credit-requests` | `creditRequests` |
| credit-payments | `/api/v1/credit-payments` | `creditPayments` |
| chat-threads | `/api/v1/chat-threads` | `chatThreads` |
| messages | `/api/v1/messages` | `messages` |
| notifications | `/api/v1/notifications` | `notifications` |
| support-conversations | `/api/v1/support-conversations` | `supportConversations` |
| alerts | `/api/v1/alerts` | `alerts` |
| activity-log | `/api/v1/activity-log` | `activityLog` |
| temperature-logs | `/api/v1/temperature-logs` | `temperatureLogs` |
| stock-movements | `/api/v1/stock-movements` | `stockMovements` |
| delivery-events | `/api/v1/delivery-events` | `deliveryEvents` |
| order-timeline-events | `/api/v1/order-timeline-events` | `orderTimelineEvents` |
| proof-of-delivery-uploads | `/api/v1/proof-of-delivery-uploads` | `proofOfDeliveryUploads` |
| premium-previews | `/api/v1/premium-previews` | `premiumPreviews` |

---

## Rules
1. **Source Integrity**: Real backend modules must not use the mock API. If the core backend is disabled or down, requests must fail explicitly.
2. **Semantic Paths**: The WebApp only references kebab-case paths. The mock server routes map these to camelCase keys under the hood.
3. **Mock Scope**: The mock server is restricted only to unsupported modules and does not seed fake data for real backend resources.
