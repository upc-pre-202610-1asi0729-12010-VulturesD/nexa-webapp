# Nexa WebApp Architecture

Nexa WebApp is an Angular 21 single-page application organized by bounded contexts and layered architecture.

## Bounded Contexts

| Context | Responsibility |
| --- | --- |
| `iam` | User identity, authentication, session, profile |
| `dashboard` | Operational KPIs for commercial and logistics users |
| `catalog` | Product catalog browsing and management |
| `ordering` | Sales order lifecycle |
| `clients` | B2B client master data |
| `inventory` | Inventory items, lots, stock movements |
| `dispatch` | Outbound shipments and delivery tracking |
| `analytics` | Commercial and operations reporting |
| `portal` | Buyer-facing self-service portal |
| `shared` | Layout, common UI, i18n, HTTP interceptor |

## Layers

Each bounded context follows:

```text
<context>/
  application/
  domain/
  infrastructure/
  presentation/
```

- `domain`: business models, commands, events, and value types.
- `application`: stores/facades that orchestrate use cases.
- `infrastructure`: RESTful API adapters and technical integrations.
- `presentation`: Angular views, routes, and UI components.

Presentation components depend on application-layer stores/facades. HTTP access is centralized in infrastructure adapters.

## API Integration

The WebApp consumes Nexa Platform through RESTful endpoints under `/api/v1`. The shared HTTP interceptor maps relative `api/v1/*` requests to the configured environment API base URL, preserving calls such as `api/v1/products`, `api/v1/orders`, and `api/v1/auth/login` without duplicating `/api/v1`.

Local development uses `http://localhost:8080/api/v1`. Production builds use the Render backend URL configured in `src/environments/environment.prod.ts`.

## Internationalization and Accessibility

The interface supports English and Latin American Spanish. English is the default language. UI components include ARIA attributes where interaction semantics require them.

## Course Alignment

The implementation follows the course statement technologies:

- Angular Framework.
- TypeScript, HTML5, CSS3.
- Material Design and Angular Material.
- RESTful API integration.
- Bounded contexts and DDD-inspired layering.
