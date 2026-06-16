# Repository Structure

Nexa WebApp separates files by functional domain rather than technical type, helping keep features isolated and reusable:

```text
src/
├── app/                  # Application bootstrap, routing layout templates
│   └── application/
│       └── stores/       # Pinia data caching store (data.store.js)
├── assets/               # CSS styling frameworks (ops.css) and global variables
├── catalog-management/   # Product definitions and bounded domain
├── iam/                  # Authentication, login forms, signup fields, and role check rules
├── invoicing/            # Invoices logs, PDF records, and payments bounded context
├── logistics/            # Routing coordinates, dispatches, dispatcher planning dashboards
├── sales/                # B2B buyer cart, orders registry, client profiles
├── shared/               # Shared kernel helpers, static datasets, BaseApi endpoints
│   ├── data/             # initial-data.json baseline dataset
│   └── infrastructure/   # Base-api, base-endpoint, and Axios clients
└── warehouse/            # Cold room visualizers, lot tables, temperature warnings
```

---

<p align="center">
  [Home](Home.md) · [Project Overview](Project-Overview.md) · [Architecture](Frontend-Architecture.md) · [Development Workflow](Branching-and-Commits.md) · [Quality & Security](Quality-and-Security.md)
</p>
