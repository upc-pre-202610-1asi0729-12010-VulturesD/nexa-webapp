# Environment Setup

## Prerequisites

- Node.js 20 for Render parity.
- npm.
- Running `nexa-platform` locally when validating live API integration.

## Local Run

```bash
npm ci
npm start
```

Default local WebApp URL:

```text
http://localhost:4200
```

Default local API URL:

```text
http://localhost:8080/api/v1
```

## Production

Production API base URL is configured in:

```text
src/environments/environment.prod.ts
```

Render Static Site uses:

```bash
npm ci && npm run build
```

Publish path:

```text
dist/nexa-webapp/browser
```
