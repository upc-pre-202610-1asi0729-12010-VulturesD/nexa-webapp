# Frontend Architecture

Nexa WebApp is an Angular 18 single-page application organized by bounded contexts.

## Contexts

| Context | Folder |
| --- | --- |
| IAM | `src/app/iam` |
| Dashboard | `src/app/dashboard` |
| Catalog | `src/app/catalog` |
| Clients | `src/app/clients` |
| Ordering | `src/app/ordering` |
| Inventory | `src/app/inventory` |
| Dispatch | `src/app/dispatch` |
| Analytics | `src/app/analytics` |
| Buyer Portal | `src/app/portal` |
| Shared | `src/app/shared` |

## Layers

```text
<context>/
  domain/
  application/
  infrastructure/
  presentation/
```

- `domain`: business models and domain-level types.
- `application`: state, orchestration, stores/facades.
- `infrastructure`: Angular HttpClient adapters, guards, interceptors.
- `presentation`: Angular components, pages, routes, and forms.

## API Boundary

Relative calls such as `api/v1/products` are mapped by the shared API base interceptor to the configured `environment.apiBaseUrl`. This avoids duplicating `/api/v1` and keeps views free from backend URL construction.

## Design Boundary

The UI uses Angular Material and Nexa CSS. It must stay B2B, operational, and cold-chain specific.
