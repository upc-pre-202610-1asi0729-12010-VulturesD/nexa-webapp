<div align="center">

<br/>

<img src="https://raw.githubusercontent.com/upc-pre-202610-1asi0730-12242-king/nexa-website/main/nexa.svg" alt="Nexa" width="200"/>

<br/><br/>

# nexa-webapp

**Web application for the Nexa B2B cold-chain distribution platform**

<br/>

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PrimeVue](https://img.shields.io/badge/PrimeVue-4-10B981?style=for-the-badge)
![Pinia](https://img.shields.io/badge/Pinia-2-FFD43B?style=for-the-badge&logo=vue.js&logoColor=black)

<br/>

![Course](https://img.shields.io/badge/Course-1ASI0730%20Aplicaciones%20Web-0a2540?style=flat-square)
![Cycle](https://img.shields.io/badge/Cycle-2026--10-0a2540?style=flat-square)
![University](https://img.shields.io/badge/University-UPC-0a2540?style=flat-square)
![Team](https://img.shields.io/badge/Team-King-2a67d9?style=flat-square)
![Version](https://img.shields.io/badge/Version-v1.2.0-22c55e?style=flat-square)
[![WebApp CI Validation](https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-webapp/actions/workflows/webapp-ci-validation.yml/badge.svg)](https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-webapp/actions/workflows/webapp-ci-validation.yml)
[![Release Integrity Check](https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-webapp/actions/workflows/release-integrity-check.yml/badge.svg)](https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-webapp/actions/workflows/release-integrity-check.yml)
[![Latest Release](https://img.shields.io/github/v/release/upc-pre-202610-1asi0730-12242-king/nexa-webapp?sort=semver&style=flat-square)](https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-webapp/releases/tag/v1.2.0)

</div>

---

## Overview

Nexa WebApp is the Vue 3 operational and buyer-facing application for a B2B cold-chain distribution platform. It supports distributor operators who manage commercial orders, catalog availability, warehouse stock, logistics execution, invoices, and customer portal activity.

Current version: `v1.2.0`.

Current status: active WebApp iteration for the academic project. This repository does not represent a final v2 or v3 product release.

The current `v1.2.0` line includes second-pass refinements for Sales, Logistics, Warehouse, Invoicing, Catalog Management, Fake API relations, and shared UI polish.

Firebase deployment will be configured and validated in a later milestone. The current repository keeps local and Fake API configuration ready for development and academic review.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 with Composition API |
| Build tool | Vite |
| UI | PrimeVue 4, PrimeFlex, PrimeIcons |
| State | Pinia |
| Routing | Vue Router 4 |
| HTTP | Axios |
| i18n | Vue I18n |
| Fake API | json-server fixtures under `server/` |

## Local Setup

```bash
npm install
npm run dev
```

Optional local Fake API:

```bash
npm run mock:api
npm run dev
```

The Vite app runs on `http://localhost:5173/`. The local Fake API runs on `http://localhost:3000` when `npm run mock:api` is active.

## Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Build the production bundle. |
| `npm run preview` | Preview the production build locally. |
| `npm run server` | Start the json-server Fake API. |
| `npm run mock:api` | Alias for the local Fake API. |
| `npm run dev:all` | Start Fake API and Vite together. |

## Project Structure

```txt
src/
├── app/                    Application shell, routes, layouts, shared stores
├── iam/                    Authentication and profile context
├── product-catalog/        Catalog Management context
├── purchase-orders/        Sales order context
├── purchase-requests/      Sales request context
├── dispatch-orders/        Logistics dispatch context
├── inventory-control/      Warehouse inventory context
├── business-documents/     Invoicing document context
├── buyer-portal/           Buyer-facing portal context
├── shared/                 Shared infrastructure and utilities
└── assets/                 Styles and brand assets
```

## Bounded Contexts

| Bounded context | Scope |
|---|---|
| Sales | Purchase orders, manual order entry, commercial validation, customer account flow. |
| Logistics | Dispatch orders, delivery tracking, route and proof-of-delivery support data. |
| Warehouse | Inventory lots, stock movement, warehouses, cold-chain monitoring. |
| Invoicing | Business documents, invoice-ready summaries, document status views. |
| Catalog Management | Product catalog, categories, promotions, buyer-facing catalog availability. |

Supporting contexts include `iam`, `analytics`, `communications`, `customer-portals`, `buyer-portal`, `subscriptions`, `shared`, and the application shell under `src/app`.

## Context Ownership

| Bounded context | Owner | Support |
|---|---|---|
| Sales | DiegoS284 | Cmarin2802, R0obxdnt-bit |
| Logistics | Cmarin2802 | DiegoS284, GerardRojasMancilla |
| Warehouse | JoaquinVerde115 | R0obxdnt-bit, DiegoS284 |
| Invoicing | GerardRojasMancilla | Cmarin2802, DiegoS284 |
| Catalog Management | R0obxdnt-bit | JoaquinVerde115, DiegoS284 |

Warehouse scope is focused on availability, lots, stock movement, warehouse records, and cold-chain monitoring. Catalog Management owns the product and promotion data that buyers and operators use before orders are created.

## GitFlow Strategy

The repository uses `main` for released states and `develop` for integrated work before release. Feature work is reconstructed through `feature/*` branches, release stabilization through `release/*` branches, and small production corrections through `hotfix/*` branches. Remote branches are kept clean: only `main` and `develop` are expected to remain active after publication.

Released tags use pure SemVer:

```txt
v0.1.0
v0.2.0
v1.0.0
v1.0.1
v1.1.0
v1.1.1
v1.2.0
```

## Releases

Release notes are maintained in [`docs/releases/`](docs/releases/) and mirrored in GitHub Releases. Source archives are enough for academic review; generated `dist/` bundles are not uploaded.

## Wiki

The repository Wiki documents project overview, bounded contexts, GitFlow strategy, frontend architecture, Fake API structure, local setup, and validation evidence.

Source-controlled documentation mirrors key Wiki facts:

- [Frontend Architecture](docs/frontend-architecture.md)
- [Validation Evidence](docs/validation-evidence.md)
- [Wiki Index](docs/wiki-index.md)

## Team

| GitHub identity | Email |
|---|---|
| JoaquinVerde115 | u20241a054@upc.edu.pe |
| R0obxdnt-bit | u202416289@upc.edu.pe |
| Cmarin2802 | cesarmarin2802@gmail.com |
| GerardRojasMancilla | u202413142@upc.edu.pe |
| DiegoS284 | diego64g284@gmail.com |

## Related Repositories

| Repository | Purpose |
|---|---|
| `nexa-webapp` | Vue WebApp for operational and buyer-facing workflows. |
| `nexa-website` | Public landing website for Nexa. |

## Scope Notes

- Fake API data is for frontend validation and academic demonstration.
- Warehouse monitoring data is simulated in the Fake API and should be treated as UI validation data only.
- Production backend integration is not included in this WebApp repository.
- Firebase deployment is not claimed as completed in this version.
