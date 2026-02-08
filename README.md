# Vibe Perfume

Vibe Perfume is a full-stack fragrance storefront with catalog discovery, scent-finder and sommelier flows, product comparison, cart validation, checkout simulation, order tracking, reviews, and an admin workspace for catalog, inventory, orders, and moderation.

## Architecture

- `frontend/` — React 19, Vite, TypeScript, React Router, and Vitest client.
- `backend/` — Express 5 REST API with validation and Node's built-in test runner.
- `backend/data/store.json` — file-backed application store used by the current backend.

The root package delegates to each service: it starts the backend and Vite client together, builds the client, and runs both test suites.

## Run locally

Requires Node.js 20+ and npm.

```bash
cd 2_VibePerfume
npm install
npm install --prefix frontend
npm install --prefix backend
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
npm run dev
```

The API listens on `5050` by default; Vite serves the UI and proxies `/api` when `VITE_API_URL=/api` is used.

```bash
npm test
npm run build
npm run test:backend
npm run test:frontend
```

## Configuration

Use the component templates as the source of truth. Important values are `PORT`, `ALLOWED_ORIGINS`, `VITE_API_URL`, and `ADMIN_API_KEY`. Set `ADMIN_API_KEY` to a unique secret in each backend deployment; do not ship it in browser code. The client-side admin-key setting exists for the current development flow and should only be used in trusted local/demo environments.

See the component READMEs for endpoint and client details.
