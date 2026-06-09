# Nexa WebApp Optional Mock API

Local mock API for AV2 WebApp areas that do not yet have backend endpoints.

Run:

```bash
npm run server
```

The WebApp still runs with `npm run dev`. Real backend modules continue using `http://localhost:5068/api/v1`; this mock server is only for unsupported frontend modules such as purchase requests, promotions, customer portal setup, editable payment methods, support conversations, and local operational analytics supplements.

The default mock base URL is `http://127.0.0.1:3000` to avoid local IPv6 loopback collisions with other development services.
