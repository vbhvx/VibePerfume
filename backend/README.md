# VibePerfume Backend Service

High-performance, RESTful Node.js + Express API providing catalog search, olfactory taxonomy filtering, AI Sommelier consultation, authoritative cart/checkout validation, and Atelier administration.

---

## 🛠️ Tech Stack & Architecture

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Data Layer**: Atomic file-backed JSON store (`data/store.json`) with automated snapshotting and test isolation (`store.test.json`)
- **Security & Validation**: Express Validator, CORS origin restricting, PII masking for order lookups, and Atelier admin key authorization (`x-admin-key`)
- **Testing**: Built-in `node:test` runner with HTTP assertions

---

## 📋 Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5050` | Server listening port |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `ADMIN_API_KEY` | `vibe-atelier-admin-key-2026` | Security key required for `/api/admin/*` and catalog mutations |
| `ALLOWED_ORIGINS` | `""` (all local dev) | Comma-separated list of permitted CORS origins |
| `MONGODB_URI` | *(optional)* | Connection URI if migrating from atomic JSON store |

---

## 🚀 Running the API

```bash
# Start production server
npm start

# Start development mode with hot reload
npm run dev

# Run automated integration tests (19 tests)
npm test
```

---

## 📡 API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service uptime and timestamp | No |
| `GET` | `/api/products` | Retrieve catalog with family, note, and price filters | No |
| `GET` | `/api/products/:id` | Full details, notes pyramid, and variants for a perfume | No |
| `POST` | `/api/products` | Create a new fragrance flacon | **Yes** (`x-admin-key`) |
| `PUT` | `/api/products/:id` | Update flacon metadata, pricing, or stock | **Yes** (`x-admin-key`) |
| `DELETE` | `/api/products/:id` | Archive or delete a fragrance flacon | **Yes** (`x-admin-key`) |
| `GET` | `/api/products/:id/reviews` | Approved customer reviews for a perfume | No |
| `POST` | `/api/products/:id/reviews` | Submit a customer rating and review | No |
| `GET` | `/api/discovery/families` | Olfactory families taxonomy with descriptions | No |
| `GET` | `/api/discovery/notes` | Note glossary and botanical origins | No |
| `POST` | `/api/discovery/scent-finder` | Deterministic 6-parameter recommendation engine | No |
| `POST` | `/api/discovery/ai-sommelier` | Conversational scent concierge consultation | No |
| `POST` | `/api/commerce/cart/validate` | Authoritative cart pricing, stock checks & discounts | No |
| `GET` | `/api/commerce/coupons/validate` | Validate promotional coupons (`VIBE10`, `LUXE500`) | No |
| `POST` | `/api/commerce/checkout/orders` | Place order, decrement inventory, and generate receipt | No |
| `GET` | `/api/commerce/orders/:orderNumber` | Track order status (PII masked unless email matched) | Optional |
| `POST` | `/api/commerce/orders/:orderNumber/cancel` | Cancel order and restock inventory before dispatch | No |
| `GET` | `/api/admin/metrics` | Commerce revenue, orders, pending reviews, low stock | **Yes** (`x-admin-key`) |
| `GET` | `/api/admin/orders` | Full order ledger with customer contact details | **Yes** (`x-admin-key`) |
| `PATCH` | `/api/admin/orders/:id/status` | Advance fulfillment status with audit trail | **Yes** (`x-admin-key`) |
| `PATCH` | `/api/admin/inventory` | Adjust variant stock quantity with audit reason | **Yes** (`x-admin-key`) |
