<div align="center">

<br/>

<img src="./docs/assets/nexa-logo.svg" alt="Nexa" width="200"/>

<br/><br/>

# nexa-webapp

**Web application for the Nexa B2B cold-chain distribution platform**

<br/>

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![PrimeVue](https://img.shields.io/badge/PrimeVue-4-10B981?style=flat-square)
![Pinia](https://img.shields.io/badge/Pinia-2-FFD43B?style=flat-square&logo=vue.js&logoColor=black)

<br/>

![Course](https://img.shields.io/badge/Course-1ASI0730%20Aplicaciones%20Web-0a2540?style=flat-square)
![Cycle](https://img.shields.io/badge/Cycle-2026--10-0a2540?style=flat-square)
![University](https://img.shields.io/badge/University-UPC-0a2540?style=flat-square)
![Team](https://img.shields.io/badge/Team-King-2a67d9?style=flat-square)
![Status](https://img.shields.io/badge/Status-AV2%20Active-22c55e?style=flat-square)

<br/>

🌐 **[View Live Site →](https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website/)**

<br/>

</div>

---

## Overview

The `nexa-webapp` repository contains the single page application (SPA) that manages order validation, cold-storage inventory traceability, logistics routing, and invoicing documentation. It provides secure web interfaces for both internal operators and external B2B clients.

---

## Repository Map

<table>
  <tr>
    <td width="50%">
      <p><a href="https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-website">nexa-website</a></p>
      <p>Public landing website and central product entry point.</p>
      <p><a href="https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website/">Open Live Website</a></p>
      <p>
        <img alt="HTML5" src="https://img.shields.io/badge/HTML5-static-E34F26?style=flat-square&logo=html5&logoColor=white" />
        <img alt="CSS3" src="https://img.shields.io/badge/CSS3-responsive-1572B6?style=flat-square&logo=css3&logoColor=white" />
        <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
      </p>
    </td>
    <td width="50%">
      <p><a href="https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-webapp">nexa-webapp</a> (This Repository)</p>
      <p>Main web application for operational workflows and buyer-facing coordination.</p>
      <p><a href="https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-webapp/wiki">Open Engineering Wiki</a></p>
      <p>
        <img alt="Vue 3" src="https://img.shields.io/badge/Vue%203-35495E?style=flat-square&logo=vue.js&logoColor=4FC08D" />
        <img alt="Vite" src="https://img.shields.io/badge/Vite-0F172A?style=flat-square&logo=vite&logoColor=FFD62E" />
        <img alt="PrimeVue" src="https://img.shields.io/badge/PrimeVue-0EA5E9?style=flat-square" />
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <p><a href="https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-platform">nexa-platform</a></p>
      <p>Platform and backend work area for API, domain, and infrastructure concerns.</p>
      <p>
        <img alt="Platform" src="https://img.shields.io/badge/Platform-backend%20workspace-512BD4?style=flat-square" />
        <img alt="API" src="https://img.shields.io/badge/API-domain%20services-0EA5E9?style=flat-square" />
      </p>
    </td>
    <td width="50%">
      <p><a href="https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-ecosystem-report">nexa-ecosystem-report</a></p>
      <p>Academic report, product research, backlog, architecture documentation, and project evidence.</p>
      <p><a href="https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-ecosystem-report">Open Report Repository</a></p>
      <p>
        <img alt="Documentation" src="https://img.shields.io/badge/Documentation-report-0F172A?style=flat-square" />
        <img alt="UPC" src="https://img.shields.io/badge/UPC-course%20evidence-0EA5E9?style=flat-square" />
      </p>
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
| **Catalog Management** | Product availability and pricing visibility. | `Products`, `Promotions` |

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

3. **Run WebApp connected to the real C# Backend (`nexa-platform`)**:
   - Ensure the backend project is running at `http://localhost:5068`.
   - Ensure `.env.development` is configured with:
     ```env
     VITE_CORE_BACKEND_ENABLED=true
     VITE_CORE_BACKEND_URL=http://localhost:5068/api/v1
     ```
   - Start the Vite development server:
     ```bash
     npm run dev
     ```
     *This will route Catalog, Inventory, Orders, and IAM requests to the C# server, using local in-memory fallbacks for other non-core modules.*

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
├── catalog-management/     # Product catalog and promotions context
├── sales/                  # Orders, requests, validation, clients, and buyer portal
├── logistics/              # Dispatch, delivery tracking, cold-chain operations, portals
├── warehouse/              # Inventory lots, stock movements, and warehouse zones
├── invoicing/              # Business documents, subscriptions, and billing views
├── iam/                    # Authentication context & session security
├── shared/                 # Infrastructure helpers and custom styles
├── assets/                 # Shared UI assets and configurations
├── i18n/                   # Global localization
├── router/                 # Global router and guards
└── main.js                 # Application bootstrap
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
| **Catalog Management** | R0obxdnt-bit | JoaquinVerde115, DiegoS284 |

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
