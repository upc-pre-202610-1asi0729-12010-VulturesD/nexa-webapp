# AV2 WebApp Final Local Verification

## Local Services

- Backend: `http://localhost:5068/api/v1` was not reachable during this local pass.
- WebApp: `http://localhost:5173` responded successfully.
- Optional mock server: `http://127.0.0.1:3000` responded successfully for unsupported module resources.

## Supported Real Backend Modules

- Authentication: configured for Nexa Platform sign-in.
- Categories: configured through `VITE_NEXA_API_BASE_URL`.
- Brands: configured through `VITE_NEXA_API_BASE_URL`.
- Catalog items: configured through `VITE_NEXA_API_BASE_URL`.
- Warehouses: configured through `VITE_NEXA_API_BASE_URL`.
- Inventory items: configured through `VITE_NEXA_API_BASE_URL`.
- Orders: configured through `VITE_NEXA_API_BASE_URL`.
- Shipments: configured through `VITE_NEXA_API_BASE_URL`.
- Invoices: configured through `VITE_NEXA_API_BASE_URL`.
- Payments: configured through `VITE_NEXA_API_BASE_URL`.

## Mock/Local Demo Modules

- B2B clients: optional mock API.
- Purchase requests and request items: optional mock API.
- Promotions: optional mock API.
- Customer portals and upload tasks: optional mock API.
- Company users and subscription settings: optional mock API.
- Editable payment methods: optional mock API.
- Temperature logs and stock-movement supplements: optional mock API.
- Support conversations and buyer messages: optional mock API.

## Responsive Verification

- Auth shell checked at 390px, 768px, and 1280px with no horizontal overflow.
- Inventory styles now keep temperature badges readable and warehouse cards on responsive grid tracks.
- Product images use contained object fit instead of cropped image fills.
- Mobile filter bars use horizontal scrolling chips instead of tall stacked controls.
- Portal bottom navigation uses five direct destinations and no duplicate menu button.
- Operations mobile layout includes a top full menu and logout action.

## i18n Verification

- Navbar, menus, common actions, dispatch search placeholder, and buyer request notes placeholder use locale keys.
- EN/ES locale files parse successfully.
- Remaining hardcoded domain values are mostly data labels, product/status values, or scoped operational copy.

## Build Result

- `npm install`: completed, 3 audit vulnerabilities reported by npm.
- `npm run build`: passed.
- `npm run`: confirmed `dev`, `build`, `preview`, `server`, and `mock:api`.

## Remaining Local Risks

- Real backend runtime verification is pending because `http://localhost:5068` was not reachable.
- Authenticated module browser checks are pending until backend sign-in is available.
- Optional mock URL uses `127.0.0.1:3000` to avoid local IPv6 loopback collisions with other development services on port 3000.
