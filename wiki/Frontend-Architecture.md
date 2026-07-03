# Frontend Architecture

The WebApp is organized by bounded contexts under `src/app`.

Each context follows:

```text
<context>/
  domain/
  application/
  infrastructure/
  presentation/
```

## Layer Responsibilities

- `domain`: business models, commands, events, value types.
- `application`: stores/facades and use-case orchestration.
- `infrastructure`: API adapters, guards, interceptors, technical integration.
- `presentation`: Angular routes, pages, components, forms, and layout.

## API Integration

Views should not call `HttpClient` directly. HTTP access belongs in infrastructure adapters. Shared API base mapping is handled by the shared interceptor so relative calls like `api/v1/products` map to the configured backend base URL without duplicating `/api/v1`.

## UI

The WebApp uses Angular Material and the existing Nexa visual language. UI copy and workflows must stay aligned with B2B cold-chain operations, not generic ecommerce.
