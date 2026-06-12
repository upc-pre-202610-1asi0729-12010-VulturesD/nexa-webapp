# Nexa WebApp Render Static Site

## Service

- Recommended Static Site name: `nexa-webapp`
- Branch: `main`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

## Environment Variables

```env
VITE_NEXA_API_BASE_URL=https://nexa-platform-api.onrender.com/api/v1
VITE_NEXA_MOCK_API_BASE_URL=https://nexa-platform-api.onrender.com/api/v1
VITE_ENABLE_MOCK_API_FALLBACK=false
VITE_CORE_BACKEND_ENABLED=true
```

`VITE_*` values are public client-side configuration. Do not add secrets here.

## SPA Rewrite

Render Static Site must serve Vue Router routes through `index.html`.

```text
/* /index.html 200
```

This rule is versioned in `public/_redirects`.

## Backend CORS Follow-Up

After Render creates the frontend URL, add it to Nexa Platform backend configuration:

```text
AllowedOrigins__1=https://<frontend-url>
```

Use no trailing slash in the CORS origin URL.
