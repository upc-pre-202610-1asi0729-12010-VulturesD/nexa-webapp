<div align="center">

<br/>

<img src="https://raw.githubusercontent.com/upc-pre-202610-1asi0730-12242-king/nexa-website/main/nexa.svg" alt="Nexa Logo" width="160"/>
<h2>Nexa B2B Cold-Chain Logistics Platform</h2>
<p><strong>Real-Time Visibility, Cold-Storage Traceability, Routing & B2B Billing</strong></p>

<div>

[![Vue 3](https://img.shields.io/badge/Vue%203-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![PrimeVue](https://img.shields.io/badge/PrimeVue-Theme--Sleek-10B981?style=for-the-badge&logo=primevue&logoColor=white)](https://primevue.org)
[![Pinia](https://img.shields.io/badge/Pinia-Store--DDD-FFD43B?style=for-the-badge&logo=vue.js&logoColor=black)](https://pinia.vuejs.org)
[![JSON Server](https://img.shields.io/badge/JSON%20Server-mock%20api-64748B?style=for-the-badge)](https://github.com/typicode/json-server)

</div>

<br/>

🌐 **[Open Live Website →](https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website/)**

<br/>

</div>

---

## 📐 WebApp Bounded Contexts & Directory Layout

The application architecture follows Domain-Driven Design (DDD) tactical principles, separating the frontend into bounded contexts:

### 1. Bounded Context Modules
- `iam/`: Identity & Access Management (session handling, login layout, blocked and forbidden pages).
- `product-catalog/`: Product Catalog Management context (bilingual grid layout, catalog views, product-cold-card.vue).
- `purchase-orders/`: Sales Bounded Context (B2B order creations, client catalogs, pinia store configurations).
- `purchase-requests/`: Logistics request sub-domain context (request inbox, request-summary-card.vue).
- `dispatch-orders/`: Logistics shipment dispatch Bounded Context (real-time temperature checks, operational-dashboard-view.vue, dispatch-board-view.vue, shipment logs).
- `inventory-control/`: Warehouse inventory control Bounded Context (cold-storage monitoring, FEFO logic check value objects, warehouse.entity.js).
- `business-documents/`: Invoicing B2B business documents context (business-documents-center-view.vue).
- `shared/`: Shared infrastructure (base Axios API client config, cold-chain monitoring metrics cards, metric-card.vue, Repository interfaces).

### 2. Mock API Layer
- `server/db.json`: Local JSON database representing the state of cold storage and B2B orders.
- `server/routes.json`: Dynamic endpoints mimicking B2B REST behaviors.

---

## 👥 The King Team & Domain Ownership

Consistent with professional academic collaboration, each B2B sub-domain context is assigned to primary engineering owners:

| Team Member | GitHub Identity | Primary Responsibility | Email |
| :--- | :--- | :--- | :--- |
| **Joaquín Verde** | [JoaquinVerde115](https://github.com/JoaquinVerde115) | Warehouse & Cold-Storage Monitoring Bounded Context | `u20241a054@upc.edu.pe` |
| **Gino Torrejón** | [R0obxdnt-bit](https://github.com/R0obxdnt-bit) | Product Catalog & Customer Portals Bounded Context | `u202416289@upc.edu.pe` |
| **César Marín** | [Cmarin2802](https://github.com/Cmarin2802) | Logistics, Routing & Shipment Dispatch Bounded Context | `cesarmarin2802@gmail.com` |
| **Gerard Rojas** | [GerardRojasMancilla](https://github.com/GerardRojasMancilla) | Invoicing Business Documents Bounded Context | `u202413142@upc.edu.pe` |
| **Diego Sandoval** | [DiegoS284](https://github.com/DiegoS284) | Sales, Purchase Orders & Report Coordination | `diego64g284@gmail.com` |

---

## 🎨 Nexa Visual Identity Color System

| Token | Hex Code | Visual Preview | Usage |
| :--- | :---: | :---: | :--- |
| **Nexa Blue** | `#2563EB` | <img src="https://via.placeholder.com/15/2563EB/000000?text=+" alt="#2563EB" /> | Primary actions, headings, and key UI markers. |
| **Ice Blue** | `#38BDF8` | <img src="https://via.placeholder.com/15/38BDF8/000000?text=+" alt="#38BDF8" /> | Primary highlights, accent bars, and cold markers. |
| **Navy Contrast** | `#0F172A` | <img src="https://via.placeholder.com/15/0F172A/000000?text=+" alt="#0F172A" /> | Sleek dark backgrounds, sidebar menus, and solid text. |
| **Slate Gray** | `#64748B` | <img src="https://via.placeholder.com/15/64748B/000000?text=+" alt="#64748B" /> | Secondary descriptions and meta indicators. |
| **Ice White** | `#FFFFFF` | <img src="https://via.placeholder.com/15/FFFFFF/000000?text=+" alt="#FFFFFF" /> | Surface card layouts and high contrast text. |

---

## 🚀 Getting Started Locally

### 1. Install dependencies:
```bash
npm install
```

### 2. Run both WebApp & Mock API concurrently:
```bash
npm run dev:all
```
*The Vite application runs on `http://localhost:5173/` and the local Mock API runs on `http://localhost:3000`.*
