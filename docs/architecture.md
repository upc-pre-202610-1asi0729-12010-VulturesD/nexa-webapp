# Nexa WebApp — Architecture

## 1. Overview

Nexa WebApp is an Angular 18 single-page application for a B2B cold-chain
distribution platform. The codebase is organized **by bounded contexts** following
Domain-Driven Design, with a thin shared layer for cross-cutting concerns
(layout, i18n, HTTP). Persistence in development is provided by a **mock REST
API** (`json-server`) that mirrors the public contract a real backend would
expose under `/api/v1/*`.

This repository ships only the **frontend WebApp** and a **mock REST API**;
there is no Java / Spring service here. The domain commands and events
documented below are TypeScript type artifacts that describe the contract the
platform is designed against — no runtime event bus is dispatched.

## 2. Bounded Contexts

Each first-level folder under `src/app/` is a bounded context, owning its
domain model, application store, infrastructure adapters, presentation views,
and routes.

| Context     | Responsibility                                              |
|-------------|-------------------------------------------------------------|
| `iam`       | User identity, authentication, session, profile             |
| `dashboard` | Operational summary KPIs for commercial / logistics users   |
| `catalog`   | Product catalog browsing and management                     |
| `ordering`  | Sales order lifecycle (creation, detail, listing)           |
| `clients`   | B2B client master data                                      |
| `inventory` | Inventory items, lots, stock movements                      |
| `dispatch`  | Outbound shipments and delivery tracking                    |
| `analytics` | Commercial & operations reporting on top of other contexts  |
| `portal`    | Buyer-facing self-service portal (catalog + own orders)     |
| `shared`    | Layout, common UI components, i18n, HTTP interceptor        |

## 3. Layering Strategy

Inside each bounded context:

- `domain/model/` — entities, value objects, aggregate types. Pure TypeScript,
  no Angular or HTTP dependencies.
- `domain/commands/` and `domain/events/` — only for `iam`, expressing the
  User EventStorming as type artifacts.
- `application/<context>.store.ts` — application-layer store that orchestrates
  infrastructure calls and exposes reactive state (signals / observables) to
  the presentation layer.
- `infrastructure/<name>-api.ts` — HTTP adapters targeting `/api/v1/*`.
- `infrastructure/guards/` — Angular route guards (auth / role), `iam` only.
- `presentation/<context>.routes.ts` — the context's lazy route table.
- `presentation/views/` — route-level components (page-level entry points).
- `presentation/components/` — context-local reusable components.

## 4. IAM / User EventStorming Alignment

The `iam/` context implements the professor's User bounded context
EventStorming. Commands and events are declared as pure TypeScript type
artifacts under `iam/domain/{commands,events}/`. No runtime event bus is
instantiated; the types document the contract and are referenced from the
application / infrastructure services that produce them.

| Command / Event                       | Type    | Location                                                       | Purpose                                                                |
|---------------------------------------|---------|----------------------------------------------------------------|------------------------------------------------------------------------|
| `RegisterUser`                        | Command | `iam/domain/commands/register-user.command.ts`                 | Request to create a new user account                                   |
| `AuthenticateUser`                    | Command | `iam/domain/commands/authenticate-user.command.ts`             | Request to verify credentials (handled by `AuthApi`)                   |
| `ChangePassword`                      | Command | `iam/domain/commands/change-password.command.ts`               | Request to rotate a user's password                                    |
| `LogoutUser`                          | Command | `iam/domain/commands/logout-user.command.ts`                   | Request to end the active session (handled by `IamStore.clear`)        |
| `UserRegistered`                      | Event   | `iam/domain/events/user-registered.event.ts`                   | A new user account was created                                         |
| `UserIdentityVerified`                | Event   | `iam/domain/events/user-identity-verified.event.ts`            | Credentials matched a known user                                       |
| `UserIdentityVerificationFailed`      | Event   | `iam/domain/events/user-identity-verification-failed.event.ts` | Credentials did not match                                              |
| `RoleAssigned`                        | Event   | `iam/domain/events/role-assigned.event.ts`                     | A role (`commercial`, `logistics`, `buyer`) was bound to the user      |
| `UserLoggedIn`                        | Event   | `iam/domain/events/user-logged-in.event.ts`                    | Session was opened after successful authentication                     |
| `LoginFailed`                         | Event   | `iam/domain/events/login-failed.event.ts`                      | Authentication attempt was rejected                                    |
| `PasswordChanged`                     | Event   | `iam/domain/events/password-changed.event.ts`                  | A user's password was successfully rotated                             |
| `UserLoggedOut`                       | Event   | `iam/domain/events/user-logged-out.event.ts`                   | Session was ended                                                      |

`AuthApi` (infrastructure) handles `AuthenticateUser` and signals the verified
/ failed outcome; `IamStore` (application) opens and closes the session,
mapping to `UserLoggedIn` / `UserLoggedOut`.

## 5. Application Stores

Every bounded context that owns reactive application state exposes it through
a single `application/<context>.store.ts` file with a class named
`<Context>Store`. The store is the only injectable callers reach for state
reads, mutations, and orchestrated queries; UI views must not call HTTP
adapters directly.

| Context     | Store file                                  | Class            |
|-------------|---------------------------------------------|------------------|
| `iam`       | `iam/application/iam.store.ts`              | `IamStore`       |
| `analytics` | `analytics/application/analytics.store.ts`  | `AnalyticsStore` |
| `portal`    | `portal/application/portal.store.ts`        | `PortalStore`    |

Contexts whose UI consumes the HTTP adapter directly (catalog, clients,
ordering, inventory, dispatch, dashboard) may add a store later without
churning the public API of the context.

## 6. Routing Strategy

`src/app/app.routes.ts` is the top-level router. It mounts a `ShellComponent`
under `/`, then delegates each context to its own
`presentation/<context>.routes.ts` via `loadChildren`. The shell wrapper is
the only `loadComponent` declared at the root level; everything else is
lazy-loaded as `loadChildren`.

**Semantic aliases** are preserved as redirects so older bookmarks resolve:

- `/catalog` → `/products`
- `/dispatch` → `/dispatches`
- `/create-order` → `/orders/new`

Legacy `ops/*` paths are also preserved as redirects to their canonical
equivalents.

## 7. Shared Layer

`src/app/shared/` contains only cross-cutting concerns:

- `presentation/layout/shell.component.ts` — authenticated shell (sidebar, topbar).
- `presentation/components/` — reusable `page-header`, `status-badge`, etc.
- `infrastructure/services/i18n.service.ts` — ES / EN dictionaries and `t()` helper.
- `infrastructure/pipes/t.pipe.ts` — translate pipe used as `'key' | t`.
- `infrastructure/interceptors/` — HTTP interceptor mapping `api/v1/*` to the
  mock server during development.

The shared layer **does not** contain any business domain models; each
bounded context owns its own types.

## 8. Mock REST API

A `json-server` instance simulates the backend during development:

- `server/db.json` — seed data for products, clients, orders, inventory,
  dispatches, users.
- `server/routes.json` — rewrite map from `/api/v1/*` to json-server resources.
- `server/start.sh` — launcher script.
- `npm run dev:all` — concurrently runs the Angular dev server and the mock API.

The HTTP interceptor ensures the Angular app calls `api/v1/*` URLs in both
dev and production-style builds; only the mock server is swapped out when a
real backend becomes available.

## 9. Final Folder Convention

The project follows the course reference architecture for Angular bounded
contexts. Concretely, every context conforms to:

```
<context>/
  application/<context>.store.ts
  domain/{model,commands,events}
  infrastructure/<name>-api.ts
  presentation/{<context>.routes.ts, views/, components/}
```

`commands/` and `events/` directories are only required where the
EventStorming explicitly defines them (currently `iam`). All Nexa-specific
naming is preserved; only the structural convention is shared.
