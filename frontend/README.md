# VIBE PERFUME — Luxury Storefront & Client Architecture

A modern, high-performance luxury fragrance storefront built with **React 19**, **TypeScript**, and **Vite**. Engineered with a dark obsidian & champagne gold haute parfumerie aesthetic, editorial storytelling, an interactive AI Fragrance Sommelier, and reliable conversion-focused e-commerce workflows.

---

## 🌟 Key Application Routes

- **Storefront Homepage**: `/`
- **AI Sommelier Salon**: `/ai-sommelier`
- **Catalog & Collections**: `/collections`
- **Side-by-Side Comparison**: `/compare`
- **Note Glossary**: `/notes`
- **Order Tracking**: `/track-order`
- **Atelier Staff Admin**: `/admin`


---

## 💎 Key Storefront Modules & Features

### 1. L'Atelier AI Sommelier (`/ai-sommelier` & Floating Concierge)
- **Conversational Olfactory Consultant**: Interactive AI agent that interviews shoppers regarding:
  - Intended **Occasion & Setting** (Daily signature, evening gala, romantic date night, corporate office, Mediterranean vacation).
  - Coveted **Fragrance Families & Raw Notes** (Crisp citrus, smoky Cambodian oud, velvety Damascena rose, Bourbon vanilla, Japanese hinoki).
  - Desired **Projection & Sillage** (Subtle skin scent, moderate elegance, commanding room-filler).
- **Two Modalities**:
  - **Full Salon Page (`/ai-sommelier`)**: Rich conversational stream, live DNA pill, animated note synthesis, and inline recommendation cards with match affinity percentage, pyramid preview, quick-add, and compare actions.
  - **Floating Concierge Orb (Every Page)**: Subtle glowing orb at the bottom-right of the screen that opens a slide-over consultation drawer without leaving the current shopping journey.

### 2. Interactive Product Detail Page (PDP) (`/products/:id`)
- **Real-Time Price Per Milliliter**: Authoritative live calculation as bottle sizes are toggled:
  $$\text{Price per ml} = \frac{\text{Variant Price}}{\text{Variant Size in ml}}$$
- **Structured Olfactory Pyramid**: Visual Top (opening), Heart (core), and Base (drydown) note composition with raw ingredient origins.
- **Guidance Meters**: Objective scores for Intensity, Skin Longevity (e.g. 10–12 Hours), Sillage Projection, and Ideal Seasons.
- **2ml Tester Vial Guarantee**: Risk-free trial promise on every full-size flacon purchase.
- **Verified Reviews & Star Distribution**: Customer review submission with rating verification and histogram breakdowns.

### 3. Fragrance Comparison Matrix (`/compare`)
- Compare up to 4 perfumes side-by-side.
- Evaluates: Price, Price/ml, Concentrations, Pyramid Notes, Descriptors, Longevity, Intensity, Sillage, Ratings, and Real-Time Stock.

### 4. Collections Vault & Faceted Discovery (`/collections`)
- Multi-dimensional filtering by Fragrance Family, Brand, Olfactory Notes, Concentration, and Price range slider.
- Consistent single-bottle cards with smooth luxury zoom effects (no jarring image flips on hover).

### 5. Cart Drawer & Checkout Sandbox (`/checkout`)
- **Slide-out Cart**: Live free express shipping progress bar (threshold: ₹2,000), quantity controls, and coupon engine (`VIBE10`, `LUXE500`).
- **Payment Sandbox**: Interactive credit card terminal with prefill option and **Error Simulation Toggle** to validate transaction failure recovery.
- **Idempotent Order Generation**: Creates reference codes (`VP-2026-XXXXX`) and tracks order lifecycles.

### 6. Order Tracking & Self-Service Cancellation (`/track-order`)
- Visual timeline (`Confirmed` $\rightarrow$ `Curating` $\rightarrow$ `Dispatched` $\rightarrow$ `Delivered`).
- Real-time order lookup and cancellation with inventory restock restoration.

---

## 🎨 Design System & Aesthetics

- **Color Palette**:
  - Obsidian Dark Background: `#0a0a0f`, `#111118`, `#181822`
  - Champagne Gold Accents: `#d4af37`, `#f3e5ab`, `#b89025`
  - Subtle Glassmorphism: `backdrop-filter: blur(12px)`
- **Typography**:
  - Headings: `Cormorant Garamond` (Editorial Serif)
  - Body & UI: `Inter` (Legible Modern Sans)
- **Local Assets Pipeline**:
  - High-resolution, unbranded luxury perfume flacon photography stored locally in `public/images/perfumes/`.
  - Zero external CDN dependencies or 404 image breakage.

---

## 🛠️ Project Structure

```
frontend/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── images/
│       └── perfumes/          # 24 local high-res luxury flacon assets
├── src/
│   ├── api/                   # Typed Axios API client (products, discovery, commerce, admin)
│   ├── components/            # Reusable UI (Navbar, Footer, ProductCard, CartDrawer, CompareBar, SearchModal, AiSommelierWidget)
│   ├── context/               # Global state (CartContext, WishlistContext, CompareContext)
│   ├── pages/                 # Full view routes (Home, Collections, ProductDetail, ScentFinder, AiSommelier, Compare, Notes, Checkout, etc.)
│   ├── tests/                 # Vitest unit test suites for commerce & olfactory calculations
│   ├── types/                 # Shared TypeScript interfaces & types
│   ├── App.tsx                # Main routing & application layout
│   ├── index.css              # Global design system tokens & base styles
│   └── main.tsx               # Application mount point
├── index.html                 # HTML shell with luxury Google Fonts & SEO metadata
├── vite.config.ts             # Vite configuration with proxy and dev server settings
└── package.json
```

---

## 🚀 Scripts & Commands

From the `frontend/` directory (or root via `--prefix frontend`):

| Command | Description |
|---|---|
| `npm run dev` | Launch the Vite development server locally |
| `npm run build` | Type-check with `tsc -b` and produce optimized production bundle |
| `npm test` | Run Vitest unit tests for commerce & calculation logic |
| `npm run preview` | Preview production build locally |
