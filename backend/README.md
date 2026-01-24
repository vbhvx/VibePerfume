# Vibe Perfume API

The Express 5 backend powers the catalog, reviews, scent discovery, cart validation, checkout, order tracking, and administration flows used by the Vite client. Its persisted data is an atomic JSON store at `data/store.json`, not MongoDB; `MONGODB_URI` is only a migration-oriented optional setting.

## Run and test

```bash
cd 2_VibePerfume/backend
npm install
cp .env.example .env
npm start
# or: npm run dev
npm test
```

`npm run seed` refreshes the development data. The default port is 5050.

## API surface

Public routes include `GET /api/health`, product listing/detail and reviews, discovery families/notes and recommendation endpoints, cart validation, coupon validation, checkout, and order lookup/cancellation. Administrative routes under `/api/admin` cover metrics, order status, inventory, and review moderation. Catalog mutations also require administration authorization.

Supply `x-admin-key` with the server-side `ADMIN_API_KEY` for protected requests. Configure `ALLOWED_ORIGINS` as a comma-separated allowlist outside local development.
