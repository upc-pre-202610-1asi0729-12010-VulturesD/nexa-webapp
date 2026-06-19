<div align="center">

<br/>

<img src="./docs/assets/nexa-logo.svg" alt="Nexa" width="220"/>

<br/><br/>

# nexa-webapp

**Angular Web Application for Nexa B2B cold-chain commercial, logistics, warehouse, and buyer workflows**

<br/>

![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular%20Material-18-0a2540?style=for-the-badge)
![REST API](https://img.shields.io/badge/API-%2Fapi%2Fv1-0EA5E9?style=for-the-badge)
![Render](https://img.shields.io/badge/Deploy-Render-22c55e?style=for-the-badge)

<br/>

![Course](https://img.shields.io/badge/Course-1ASI0729%20Desarrollo%20de%20Aplicaciones%20Open%20Source-0a2540?style=flat-square)
![Cycle](https://img.shields.io/badge/Cycle-2026--10-0a2540?style=flat-square)
![University](https://img.shields.io/badge/University-UPC-0a2540?style=flat-square)
![Team](https://img.shields.io/badge/Team-Nexa-2a67d9?style=flat-square)
![Status](https://img.shields.io/badge/Status-Release%202.0.0-22c55e?style=flat-square)

<br/>

🌐 **[Open Live WebApp Login →](https://nexa-webapp.onrender.com/#/auth/login)**

<br/>

</div>

---

## Overview

`nexa-webapp` is the Angular SPA for Nexa. It supports commercial coordinators, logistics leads, warehouse operators, and B2B buyers through catalog, orders, inventory, dispatch, analytics, business documents, payments, and buyer portal workflows.

The WebApp consumes `nexa-platform` through RESTful endpoints under `/api/v1`. Local development points to `http://localhost:8080/api/v1`; production builds point to the Render backend URL configured in `src/environments/environment.prod.ts`.

---

## Repository Map

<table>
  <tr>
    <td width="50%">
      <p><a href="https://github.com/upc-pre-202610-1asi0729-12010-VulturesD/nexa-website">upc-pre-202610-1asi0729-12010-VulturesD/nexa-website</a></p>
      <p>Public landing website and central product entry point.</p>
      <p><a href="https://upc-pre-202610-1asi0729-12010-vulturesd.github.io/nexa-website/">Open Live Website</a></p>
      <p>
        <img alt="HTML5" src="https://img.shields.io/badge/HTML5-static-E34F26?style=flat-square&logo=html5&logoColor=white" />
        <img alt="CSS3" src="https://img.shields.io/badge/CSS3-responsive-1572B6?style=flat-square&logo=css3&logoColor=white" />
        <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
      </p>
    </td>
    <td width="50%">
      <p><a href="https://github.com/upc-pre-202610-1asi0729-12010-VulturesD/nexa-webapp">upc-pre-202610-1asi0729-12010-VulturesD/nexa-webapp</a> (This Repository)</p>
      <p>Angular Web Application for operational workflows and buyer-facing coordination.</p>
      <p><a href="https://nexa-webapp.onrender.com/#/auth/login">Open Live WebApp Login</a></p>
      <p>
        <img alt="Angular" src="https://img.shields.io/badge/Angular-18-DD0031?style=flat-square&logo=angular&logoColor=white" />
        <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
        <img alt="Angular Material" src="https://img.shields.io/badge/Angular%20Material-18-0a2540?style=flat-square" />
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <p><a href="https://github.com/upc-pre-202610-1asi0729-12010-VulturesD/nexa-platform">upc-pre-202610-1asi0729-12010-VulturesD/nexa-platform</a></p>
      <p>Spring Boot backend platform and REST API service layer.</p>
      <p><a href="https://github.com/upc-pre-202610-1asi0729-12010-VulturesD/nexa-platform/wiki">Open Engineering Wiki</a></p>
      <p>
        <img alt="Java" src="https://img.shields.io/badge/Java-21-0a2540?style=flat-square" />
        <img alt="Spring Boot" src="https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?style=flat-square&logo=springboot&logoColor=white" />
        <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Render-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
      </p>
    </td>
    <td width="50%">
      <p><a href="https://github.com/upc-pre-202610-1asi0729-12010-VulturesD/nexa-report">upc-pre-202610-1asi0729-12010-VulturesD/nexa-report</a></p>
      <p>Academic report, product research, backlog, architecture documentation, and project evidence.</p>
      <p><a href="https://github.com/upc-pre-202610-1asi0729-12010-VulturesD/nexa-report">Open Report Repository</a></p>
      <p>
        <img alt="Documentation" src="https://img.shields.io/badge/Documentation-report-0F172A?style=flat-square" />
        <img alt="Open Source" src="https://img.shields.io/badge/Open%20Source-course%20evidence-0EA5E9?style=flat-square" />
      </p>
    </td>
  </tr>
</table>

---

## Bounded Contexts

| Context | Responsibility |
| --- | --- |
| `iam` | Login, profile, session, auth guard, role guard |
| `dashboard` | Commercial and operations dashboards |
| `catalog` | Product catalog and cold-chain product data |
| `clients` | B2B client account data |
| `ordering` | Orders, order details, purchase requests, order creation |
| `inventory` | Warehouses, lots, stock movements |
| `dispatch` | Dispatch board, delivery tracking, proof of delivery |
| `analytics` | Commercial and operations reports |
| `portal` | Buyer-facing catalog, requests, orders, documents, payments |
| `shared` | Layout, common components, i18n, HTTP interceptor |

Each bounded context follows `domain`, `application`, `infrastructure`, and `presentation` layers.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Angular 21 |
| Language | TypeScript |
| UI | Angular Material, Material Design, CSS |
| Routing | Angular Router |
| Data access | Angular HttpClient |
| API integration | Nexa Platform REST API under `/api/v1` |
| Deployment | Render Static Site |

---

## Local Setup

```bash
npm ci
npm start
```

Local app:

```text
http://localhost:4200
```

Build:

```bash
npm run build
```

---

## Render Deployment

`render.yaml` defines a Render Static Site:

- build command: `npm ci && npm run build`
- publish path: `dist/nexa-webapp/browser`
- SPA fallback: `/*` to `/index.html`
- Node version: `20`

If the backend Render URL changes, update:

```text
src/environments/environment.prod.ts
```

and keep the platform `FRONTEND_ORIGIN` aligned.

---

## Demo Users

| Role | Email | Password |
| --- | --- | --- |
| Commercial coordinator | `sales@nexa.com` | `NexaAccess2026!` |
| Logistics lead | `logistics@nexa.com` | `NexaAccess2026!` |
| Warehouse operator | `warehouse@nexa.com` | `NexaAccess2026!` |
| Buyer | `buyer@nexa.com` | `NexaAccess2026!` |

---

## Team & Domain Ownership

To keep development organized, bounded contexts are assigned to primary owners and support contributors:

| Context | Owner | Support |
| --- | --- | --- |
| **Catalog & Buyer Portal** | DiegoS284 | Cmarin2802, R0obxdnt-bit |
| **Commercial Dashboard & Orders** | Cmarin2802 | DiegoS284, GerardRojasMancilla |
| **Inventory & Warehouse** | JoaquinVerde115 | R0obxdnt-bit, DiegoS284 |
| **Dispatch & Logistics** | GerardRojasMancilla | Cmarin2802, DiegoS284 |
| **UX, Documentation & Release** | R0obxdnt-bit | JoaquinVerde115, DiegoS284 |

---

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Frontend architecture](docs/frontend-architecture.md)
- [API contract alignment](docs/api-contract-alignment.md)
- [Release notes](docs/releases/README.md)
- [Engineering wiki](wiki/Home.md)
- [Contributing](.github/CONTRIBUTING.md)
- [Security policy](.github/SECURITY.md)

---

<p align="center">
  <strong>Nexa WebApp</strong> · Team Nexa · Universidad Peruana de Ciencias Aplicadas · 2026-10
</p>
