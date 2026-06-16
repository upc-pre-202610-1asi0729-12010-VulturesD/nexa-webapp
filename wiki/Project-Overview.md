# Project Overview

Nexa is a B2B SaaS platform designed to solve cold-chain distribution logistics and inventory traceability. The platform serves two primary user types:
1. **Internal Operators**: Warehousing and logistics personnel who coordinate stock reception, cold storage allocations, route scheduling, and commercial order verification.
2. **B2B Buyers**: Distribution centers and food/pharmaceutical retailers who place high-volume purchases, track shipments, and manage their business invoices.

The Nexa system is split into two active service directories:
- **`nexa-platform`**: ASP.NET Core REST APIs managing clean domain aggregates, business invariants, and migrations for PostgreSQL databases.
- **`nexa-webapp`** (this workspace): Vue 3 client interface consuming the REST endpoints to expose intuitive dashboards and operational workflows.

---

<p align="center">
  [Home](Home.md) · [Project Overview](Project-Overview.md) · [Architecture](Frontend-Architecture.md) · [Development Workflow](Branching-and-Commits.md) · [Quality & Security](Quality-and-Security.md)
</p>
