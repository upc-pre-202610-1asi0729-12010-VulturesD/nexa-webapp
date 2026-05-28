<div align="center">

<br/>

<img src="./docs/assets/nexa-logo.svg" alt="Nexa" width="200"/>

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
![Status](https://img.shields.io/badge/Status-TB1%20Active-22c55e?style=flat-square)

<br/>

🌐 **[View Live Site →](https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website/)**

<br/>

</div>

---

## Overview

The `nexa-webapp` repository contains the single page application (SPA) that manages order validation, cold-storage inventory traceability, logistics routing, and invoicing documentation. It provides secure web interfaces for both internal operators and external B2B clients.

---

## Nexa Repository Hub

<table>
  <tr>
    <td width="50%">
      <strong>Live Website</strong><br />
      Public landing page and product entry point.<br />
      <a href="https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website/">Open website</a>
    </td>
    <td width="50%">
      <strong>WebApp</strong><br />
      Operational frontend for product workflows.<br />
      <a href="https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-webapp">Open repository</a>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>Platform</strong><br />
      Backend/domain workspace and service foundation.<br />
      <a href="https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-platform">Open repository</a>
    </td>
    <td width="50%">
      <strong>Report</strong><br />
      Academic report and project evidence.<br />
      <a href="https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-report">Open repository</a>
    </td>
  </tr>
</table>

---

## Application Areas

| Area | User Value | Key Aggregates |
|---|---|---|
| **Sales** | Order registration and commercial workflow coordination. | `Orders`, `Buyers` |
| **Warehouse** | Stock visibility and cold-storage movement tracking. | `InventoryLots`, `Warehouses` |
| **Logistics** | Dispatch planning and delivery route monitoring. | `Routes`, `Dispatches` |
| **Invoicing** | Invoice-ready evidence and business document support. | `InvoiceRecords`, `Documents` |
| **Catalog** | Product availability and pricing visibility. | `Products`, `PriceLists` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Core Framework** | Vue 3 (Composition API) & Vite |
| **Component Suite** | PrimeVue 4, PrimeFlex, & PrimeIcons |
| **State Management** | Pinia |
| **Routing & Client** | Vue Router 4 & Axios |
| **Localization** | Vue I18n |
| **Development mock** | json-server (runs on port 3000) |

---

## Getting Started

### Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run both WebApp & Mock API concurrently**:
   ```bash
   npm run dev:all
   ```
   *The Vite application runs on `http://localhost:5173/` and the local Mock API runs on `http://localhost:3000`.*

---

## Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts the Vite dev server locally. |
| `npm run build` | Builds the production package (`dist/`). |
| `npm run preview` | Previews the production build locally. |
| `npm run mock:api` | Starts only the local JSON mock API. |
| `npm run dev:all` | Runs mock API and Vite dev server together. |

---

## Project Structure

```text
src/
├── app/                    # Global shell, custom layouts, and main routing
├── iam/                    # Authentication context & session security
├── product-catalog/        # Catalog management context
├── purchase-orders/        # Sales context (order logs & coordination)
├── purchase-requests/      # Purchase request forms
├── dispatch-orders/        # Logistics context (routes & shipment dispatches)
├── inventory-control/      # Warehouse context (cold-storage monitoring & lots)
├── business-documents/     # Invoicing documents context
├── buyer-portal/           # Customer portal views
├── shared/                 # Infrastructure helpers and custom styles
└── assets/                 # Shared UI assets and configurations
```

---

## Team & Domain Ownership

To keep development organized, specific contexts are assigned to primary owners:

| Context | Owner | Support |
|---|---|---|
| **Sales** | DiegoS284 | Cmarin2802, R0obxdnt-bit |
| **Logistics** | Cmarin2802 | DiegoS284, GerardRojasMancilla |
| **Warehouse** | JoaquinVerde115 | R0obxdnt-bit, DiegoS284 |
| **Invoicing** | GerardRojasMancilla | Cmarin2802, DiegoS284 |
| **Catalog** | R0obxdnt-bit | JoaquinVerde115, DiegoS284 |

---

## Documentation

Full frontend specs, architecture guides, and developer workflows are maintained in:
- 🔗 **[Nexa Engineering Wiki Index](https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-webapp/wiki)**
- [Frontend Architecture Specs](docs/frontend-architecture.md)
- [Validation Evidence Log](docs/validation-evidence.md)

---

<p align="center">
  <strong>Nexa WebApp</strong> · Universidad Peruana de Ciencias Aplicadas · 2026-10
</p>
