# Vibe Perfume frontend

The Vite/React client provides the storefront, discovery tools, cart and checkout UI, tracking, and administration screens. It calls the backend through the API helpers in `src/api`.

```bash
cd 2_VibePerfume/frontend
npm install
cp .env.example .env
npm run dev
npm test
npm run build
```

Set `VITE_API_URL` to the API base URL (the default `/api` is intended for a development proxy). The `deploy` script publishes the built static bundle to GitHub Pages; it does not deploy the Express API.
