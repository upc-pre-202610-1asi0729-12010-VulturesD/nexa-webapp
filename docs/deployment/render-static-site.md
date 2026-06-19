# Nexa WebApp Render Static Site

## Service

- Recommended Static Site name: `nexa-webapp`.
- Branch: `main`.
- Build command: `npm ci && npm run build`.
- Publish directory: `dist/nexa-webapp/browser`.

## Runtime Configuration

Angular production configuration is compiled from:

```text
src/environments/environment.prod.ts
```

The API base URL must point to the deployed Nexa Platform backend:

```text
https://nexa-open-source-platform.onrender.com/api/v1
```

Do not place secrets in Angular environment files. Browser-side configuration is public.

## SPA Rewrite

Render must rewrite all routes to `index.html`:

```text
/* /index.html 200
```

The repository `render.yaml` contains the SPA fallback rule.

## Backend CORS

After Render creates the frontend URL, set the same URL in Nexa Platform:

```text
FRONTEND_ORIGIN=https://nexa-open-source-webapp.onrender.com
```
