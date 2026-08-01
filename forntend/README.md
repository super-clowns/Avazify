# Avazify Frontend

React + TypeScript frontend connected to the Django REST API.

```bash
npm ci
npm run dev
```

The development server proxies `/api` and `/media` to `http://localhost:8000`.

```bash
npm run test
npm run lint
npm run build
npm run check
```

Authentication uses short-lived JWT access tokens and rotating refresh tokens. Core application data is hydrated from `/api/bootstrap/`; Local Storage is used only for persistent tokens and PWA browser behavior, not as the application database.
