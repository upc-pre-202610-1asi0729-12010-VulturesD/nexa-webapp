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
![Status](https://img.shields.io/badge/Status-TB1%20Active-22c55e?style=flat-square)

<br/>

🌐 **[Ver aplicación →](https://nexa-2f1bb.web.app)**

<br/>

</div>

---

## Overview

TB1 frontend SPA for the Nexa cold-chain distribution platform. Uses mock authentication and a cloud-hosted Fake API (json-server on Render) to demonstrate the first web application increment. No real backend is included in this iteration. Route guards protect the demo operations and portal scopes.

Two surfaces share a single design system:

| Surface | Audience | Modules |
|---|---|---|
| **Nexa Ops** | Distributor operators | Dashboard, Catalog, Inventory Control, Purchase Orders, Create Order, Dispatch, Clients, Analytics, Settings |
| **Nexa Portal** | B2B commercial clients | Home, Catalog, Cart, My Orders |

---

## URLs desplegadas

| Recurso | URL |
|---|---|
| **Frontend** (Firebase Hosting) | [https://nexa-2f1bb.web.app](https://nexa-2f1bb.web.app) |
| **Fake API** (Render) | [https://nexa-webapp-dev2.onrender.com/api/v1](https://nexa-webapp-dev2.onrender.com/api/v1) |
| **Landing page** | [https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website/](https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website/) |

> **Modelo de despliegue:** el frontend se sirve desde Firebase Hosting. La Fake API corre como Node Web Service en Render (json-server). Son servicios independientes. En producción, `VITE_API_BASE_URL` apunta siempre a la URL de Render.

---

## Demo credentials

| Rol | Email | Contraseña | Superficie |
|---|---|---|---|
| Coordinación comercial | valeria@ventas.com | demo1234 | ops |
| Jefatura logística | roberto@logistica.com | demo1234 | ops |
| Comprador B2B | lucia@cevichero.pe | demo1234 | portal |

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build tool | Vite |
| UI library | PrimeVue 4 + PrimeFlex + PrimeIcons |
| Theming | `@primeuix/themes` (preset Aura personalizado) |
| Routing | Vue Router 4 (hash history para Firebase Hosting) |
| Estado | Pinia |
| HTTP | Axios |
| i18n | Vue I18n (EN por defecto / ES secundario) |
| Fake API | json-server (desplegado en Render) |

---

## Variables de entorno

| Archivo | Valor | Cuándo aplica |
|---|---|---|
| `.env.development` | `http://localhost:3000/api/v1` | `npm run dev` (local) |
| `.env.production` | `https://nexa-webapp-dev2.onrender.com/api/v1` | `npm run build` |

---

## Desarrollo local

```bash
npm install
npm run dev      # app en http://localhost:5173/
```

> Para desarrollo local con Fake API en local (opcional):
> ```bash
> npm run server   # Fake API en http://localhost:3000
> npm run dev      # app apuntando a localhost:3000
> ```
> En producción la app apunta directamente a Render — no es necesario levantar el servidor local.

---

## Fake API — Endpoints disponibles

La Fake API (json-server) está desplegada en Render y expone los siguientes endpoints bajo `/api/v1/`:

```
GET  /api/v1/users
GET  /api/v1/products
GET  /api/v1/categories
GET  /api/v1/clients
GET  /api/v1/orders
GET  /api/v1/inventory-lots
GET  /api/v1/stock-movements
GET  /api/v1/dispatches
GET  /api/v1/warehouses
GET  /api/v1/alerts
GET  /api/v1/activity-log
```

Base URL en producción: `https://nexa-webapp-dev2.onrender.com/api/v1`

> Esta no es una API real de producción. Será reemplazada por la Web API ASP.NET Core en iteraciones posteriores.

---

## Despliegue

### Fake API — Render

El directorio `server/` contiene el servicio json-server desplegado en [Render](https://render.com/) con esta configuración:

| Parámetro | Valor |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | Node |

`server/package.json`:
```json
{
  "name": "nexa-mock-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "json-server --watch db.json --routes routes.json --host 0.0.0.0 --port $PORT"
  },
  "dependencies": {
    "json-server": "^0.17.4"
  }
}
```

URL activa: `https://nexa-webapp-dev2.onrender.com/api/v1`

### Frontend — Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

URL activa: [https://nexa-2f1bb.web.app](https://nexa-2f1bb.web.app)

> **Primera vez:** `firebase login` → `firebase init` (seleccionar Hosting, proyecto existente, `dist`, Y, No) → genera `firebase.json` y `.firebaserc`.

---

## Domain-Driven Frontend Structure

```
src/<bounded-context>/
├── application/
│   └── <bounded-context>.store.js     Pinia store + orquestación de casos de uso
├── domain/
│   ├── model/
│   │   ├── entities/                  Clases de entidad del dominio
│   │   ├── value-objects/             Tipos de valor inmutables
│   │   └── events/                    Eventos de dominio
│   └── repositories/                  Contratos de repositorio (sin dependencia de infraestructura)
├── infrastructure/
│   ├── <bounded-context>-api.js       Servicio HTTP con Axios
│   ├── <entity>.assembler.js          Mapeo API ↔ entidades ↔ recursos
│   └── <entity>.resource.js           DTO para la capa de interfaz
└── presentation/
    ├── views/                         Componentes Vue de vista
    └── <bounded-context>-routes.js    Definición de rutas
```

---

## Bounded Contexts

| Contexto | Tipo | Descripción |
|---|---|---|
| `iam` | Core | Autenticación demo, sesión de usuario, perfil |
| `product-catalog` | Core | Catálogo de productos y categorías |
| `purchase-orders` | Core | Captura asistida y seguimiento de órdenes B2B |
| `inventory-control` | Core | Lotes de inventario, disponibilidad de stock, FEFO |
| `dispatch-orders` | Core | Panel de despacho, estado de entrega, POD simulado |
| `analytics` | Support | Modelos de lectura operativos derivados de otros contextos |
| `clients` | Support | Gestión de clientes comerciales para TB1 |
| `app` | Shell | Composición de rutas, layouts, stores transversales |
| `shared` | Kernel | Clases base, cliente HTTP compartido, utilidades |

---

## Routing

```
/#/auth/login         Inicio de sesión
/#/auth/recover       Recuperación de contraseña
/#/auth/blocked       Estado de cuenta bloqueada

/#/ops/dashboard      KPIs y alertas
/#/ops/catalog        Catálogo de productos
/#/ops/inventory      Control de inventario (lotes, FEFO, movimientos)
/#/ops/orders         Lista de órdenes de compra
/#/ops/orders/new     Crear orden de compra (flujo asistido)
/#/ops/orders/:id     Detalle de orden de compra
/#/ops/dispatch       Operaciones de despacho
/#/ops/clients        Gestión de clientes
/#/ops/reports        Analítica y reportes operativos
/#/ops/settings       Configuración de empresa
/#/ops/profile        Perfil de usuario

/#/portal/home        Inicio del portal B2B
/#/portal/catalog     Catálogo B2B con carrito
/#/portal/orders      Seguimiento de pedidos
```

> `/ops/reports` es la ruta pública del módulo de analítica. El contexto interno, store y documentación usan el nombre canónico `analytics`.

---

## TB1 Scope Boundaries

- Fake API en Render (`server/db.json`) — sin backend productivo real
- Sin persistencia MySQL real
- Sin autenticación de producción
- Sin contrato OpenAPI
- Sin servicio real de Proof of Delivery

---

## Branching Strategy

GitFlow:

| Branch | Propósito |
|---|---|
| `main` | Releases estables y revisados |
| `develop` | Rama de integración |
| `feature/*` | Nuevas funcionalidades y mejoras |
| `release/*` | Release candidates para TB1 |
| `hotfix/*` | Correcciones críticas sobre main (solo si necesario) |

Todos los commits siguen [Conventional Commits 1.0.0](https://www.conventionalcommits.org/): `type(scope): description`.

---

## Related Repositories

| Repositorio | Descripción |
|---|---|
| [nexa-report](https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-report) | Informe académico |
| [nexa-website](https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-website) | Landing page — [ver](https://upc-pre-202610-1asi0730-12242-king.github.io/nexa-website/) |
| [nexa-platform](https://github.com/upc-pre-202610-1asi0730-12242-king/nexa-platform) | Capa de backend (ASP.NET Core, planificado para siguiente entrega) |

---

## Team

**Organización:** [upc-pre-202610-1asi0730-12242-king](https://github.com/upc-pre-202610-1asi0730-12242-king)

| Código | Integrante | Rol |
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

*1ASI0730 — Aplicaciones Web · Ingeniería de Software*

<br/>

</div>
