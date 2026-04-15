# Nexa WebApp

Angular web application for Nexa, a B2B cold-chain distribution platform built
by Vultures Devs for the UPC course Desarrollo de Aplicaciones Open Source.

## Stack

- Angular 18
- TypeScript
- Angular Router
- Angular HttpClient
- PrimeIcons
- JSON Server mock REST API

## Main Flows

- Commercial dashboard with operational summary cards
- Product catalog with search, stock, and temperature information
- Client management for B2B commercial accounts
- Purchase order creation with client, products, quantities, and confirmation
- Inventory views for lots and stock movements
- Dispatch operation cards with status and checklist details
- Reports and analytics from mock API data
- Buyer portal and profile views
- Role-based navigation for commercial, logistics, and buyer users

## Local Development

Install dependencies:

```bash
npm install
```

Run the Angular app:

```bash
npm start
```

Run the mock API:

```bash
npm run mock:api
```

Run both processes:

```bash
npm run dev:all
```

Build production assets:

```bash
npm run build
```

## Mock API

The development API is served by JSON Server from:

- `server/db.json`
- `server/routes.json`

The Angular app consumes `/api/v1/*` endpoints through the configured API base
URL in `src/environments/`.

## Repository Structure

```text
src/app/
  analytics/
  catalog/
  clients/
  dashboard/
  dispatch/
  iam/
  inventory/
  ordering/
  portal/
  shared/
server/
public/
docs/
```

Each bounded context owns its domain model, infrastructure adapter, route
configuration, and presentation views.
