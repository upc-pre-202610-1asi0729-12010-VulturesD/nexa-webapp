<div align="center">

<br/>

<img src="public/assets/img/nexa.svg" alt="Nexa" width="200"/>

<br/><br/>

# Nexa — WebApp

**Angular WebApp for B2B refrigerated and frozen food distribution operations**

<br/>

![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JSON Server](https://img.shields.io/badge/Fake%20API-JSON%20Server-0a2540?style=for-the-badge)

<br/>

![Course](https://img.shields.io/badge/Course-1ASI0729%20Desarrollo%20de%20Aplicaciones%20Open%20Source-0a2540?style=flat-square)
![Cycle](https://img.shields.io/badge/Cycle-2026--10-0a2540?style=flat-square)
![University](https://img.shields.io/badge/University-UPC-0a2540?style=flat-square)
![Team](https://img.shields.io/badge/Team-Vultures%20Devs-2a67d9?style=flat-square)
![Status](https://img.shields.io/badge/Status-TB1%20Frontend%20Validation-f59e0b?style=flat-square)

<br/>

</div>

---

## Product overview

Nexa WebApp is the operational frontend for Nexa. It supports commercial and logistics users who coordinate B2B cold-chain orders, inventory, dispatches, and reports from one web interface.

The TB1 scope validates the frontend experience with Angular and a local Fake API. The application does not claim a production backend in this repository.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Angular 18 |
| Language | TypeScript |
| Routing | Angular Router |
| Data access | Angular HttpClient |
| UI assets | PrimeIcons and custom Nexa design system |
| Mock data | JSON Server |
| Static API fallback | `public/api/v1/*.json` |

---

## Architecture summary

The app is organized by bounded contexts under `src/app/`. Each context owns its route configuration, domain model, infrastructure adapter, and presentation views.

| Context | Purpose |
|---|---|
| `iam` | Login, profile, session state, auth guard, role guard |
| `dashboard` | Commercial and logistics operational summary |
| `catalog` | Product catalog, categories, stock, cold-chain data |
| `clients` | B2B client account data and commercial status |
| `ordering` | Orders list, order detail, and create order flow |
| `inventory` | Warehouses, lots, stock movements, FEFO support |
| `dispatch` | Dispatch cards, route status, delivery checklist |
| `analytics` | Operational and commercial report summaries |
| `portal` | Buyer-facing scoped portal view |
| `shared` | Shell layout, common components, i18n, HTTP interceptor |

---

## Main features

- Role-based navigation for commercial, logistics, and buyer users
- Login and profile screens
- Dashboard with operational KPIs
- Product catalog with stock and temperature details
- Client account list with commercial segmentation
- Assisted purchase order creation flow
- Order list and order detail views
- Inventory overview, lots, and stock movements
- Dispatch board and dispatch detail views
- Analytics and reports from mock API data
- Buyer portal with scoped order/catalog visibility
- Spanish and English UI labels

---

## Local setup

Install dependencies:

```bash
npm install
```

Run Angular:

```bash
npm start
```

Run the Fake API:

```bash
npm run mock:api
```

Run both:

```bash
npm run dev:all
```

Build:

```bash
npm run build
```

---

## Fake API

The local API is served with JSON Server:

| File | Purpose |
|---|---|
| `server/db.json` | Mock users, clients, products, orders, inventory, dispatches, alerts |
| `server/routes.json` | `/api/v1/*` route rewrites |
| `public/api/v1/*.json` | Static fallback data for hosted review |

**Disclaimer:** Fake API is used for TB1 frontend validation. It is not a production backend.

---

## Demo users

| Role | Email | Password | Scope |
|---|---|---|---|
| Commercial coordinator | `valeria@ventas.com` | `demo1234` | Orders, catalog, clients, reports |
| Logistics lead | `roberto@logistica.com` | `demo1234` | Dashboard, inventory, dispatches, reports |
| Buyer | `lucia@cevichero.pe` | `demo1234` | Buyer portal |

---

## Routes

| Route | Purpose |
|---|---|
| `/login` | Authentication |
| `/dashboard` | Operational dashboard |
| `/products` | Catalog |
| `/clients` | Client management |
| `/orders` | Orders list |
| `/orders/new` | Assisted order creation |
| `/inventory` | Inventory overview |
| `/stock-movements` | Stock movement view |
| `/dispatches` | Dispatch board |
| `/analytics` | Analytics summary |
| `/reports` | Reports |
| `/portal` | Buyer portal |
| `/profile` | User profile |

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Runs Angular dev server |
| `npm run build` | Builds production assets |
| `npm run mock:api` | Runs JSON Server with `/api/v1` routes |
| `npm run dev:all` | Runs Angular and Fake API together |
| `npm run watch` | Runs Angular build in watch mode |

---

## Screenshots

| View | Placeholder |
|---|---|
| Login | `docs/screenshots/webapp-login.png` |
| Dashboard | `docs/screenshots/webapp-dashboard.png` |
| Catalog | `docs/screenshots/webapp-catalog.png` |
| Create order | `docs/screenshots/webapp-create-order.png` |
| Dispatch | `docs/screenshots/webapp-dispatch.png` |
| Reports | `docs/screenshots/webapp-reports.png` |

---

## Related repositories

| Repository | Description |
|---|---|
| [nexa-report](https://github.com/upc-pre-202610-1asi0729-12010-VulturesD/nexa-report) | Academic report (Docs-as-Code) |
| [nexa-website](https://github.com/upc-pre-202610-1asi0729-12010-VulturesD/nexa-website) | Public landing page |
| [nexa-platform](https://github.com/upc-pre-202610-1asi0729-12010-VulturesD/nexa-platform) | Planned service layer for later integration |

---

## Team

**Organization:** [upc-pre-202610-1asi0729-12010-VulturesD](https://github.com/upc-pre-202610-1asi0729-12010-VulturesD)

| Code | Member | Role |
|---|---|---|
| U202323040 | Yucra Sandoval, Diego Sebastian | Team Leader |
| U202411937 | Marín Cueva, César Fernando | Team Member |
| U20241A054 | Verde Bueno, Joaquín Francisco | Team Member |
| U202416289 | Torrejón De Los Santos, Gino Rodrigo | Team Member |
| U202413142 | Rojas Mancilla, Gerard Gianpier | Team Member |

---

<div align="center">

<br/>

**Nexa** · Universidad Peruana de Ciencias Aplicadas · 2026-10

*1ASI0729 — Desarrollo de Aplicaciones Open Source · Ingeniería de Software*

<br/>

</div>
