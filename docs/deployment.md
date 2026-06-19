# Nexa WebApp Deployment

Nexa WebApp is an Angular single-page application deployed separately from Nexa Platform.

## Local Run

```bash
npm ci
npm start
```

The local API base URL is:

```text
http://localhost:8080/api/v1
```

## Production Build

```bash
npm ci && npm run build
```

Angular outputs the static site to:

```text
dist/nexa-webapp/browser
```

## Render Static Site

`render.yaml` configures:

- build command: `npm ci && npm run build`
- publish path: `dist/nexa-webapp/browser`
- SPA fallback: `/*` to `/index.html`
- Node version: `20`

Production API calls use:

```text
https://nexa-platform.onrender.com/api/v1
```

If the backend Render service name changes, update `src/environments/environment.prod.ts` and the platform `FRONTEND_ORIGIN` value together.
