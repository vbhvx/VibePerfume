# VIBE PERFUME — Luxury Fragrance Storefront & Scent Discovery Platform

A full-stack, conversion-focused fragrance e-commerce web application engineered to transform online perfume buying into an understandable, sensory-rich, and trustworthy digital experience.

---

## 🌟 Storefront Deployment & Architecture

- **Production Deployment**: Automated GitHub Actions pipeline to GitHub Pages
- **API Architecture**: Universal relative `/api` integration with built-in client data fallbacks
- **Zero-Dependency Engine**: Fully operational static client bundle with optional Node/Express backend


---

## 🚀 Key Modules & Capabilities

### 1. Storefront Homepage (`/`)
- **Luxury Editorial Hero Banner**: Evocative storytelling with dark velvet obsidian aesthetic, champagne gold accents, and fluid CTA journeys.
- **The Olfactory Taxonomy**: Interactive fragrance family showcase (Woody, Floral, Citrus, Oriental, Aquatic, Gourmand, Spicy, Fresh).
- **Curated Signature Ateliers**: Tabbed collection grid featuring master perfumes with high-resolution unbranded flacon photography.
- **Risk-Free Scent Guarantee**: Highlights our complimentary 2ml tester vial promise, 100% authentic sourcing, IFRA safety compliance, and free express delivery.

### 2. L'Atelier AI Sommelier (`/ai-sommelier` & Floating Concierge)
- **Conversational Olfactory Consultant**: Interactive AI agent that interviews shoppers regarding:
  - Intended **Occasion & Setting** (Daily signature, evening gala, romantic date night, corporate office, Mediterranean vacation).
  - Coveted **Fragrance Families & Raw Notes** (Crisp citrus, smoky Cambodian oud, velvety Damascena rose, Bourbon vanilla, Japanese hinoki).
  - Desired **Projection & Sillage** (Subtle skin scent, moderate elegance, commanding room-filler).
- **Two Modalities**:
  - **Full Salon Page (`/ai-sommelier`)**: Rich conversational stream, live DNA pill, animated note synthesis, and inline recommendation cards with match affinity percentage, pyramid preview, quick-add, and compare actions.
  - **Floating Concierge Orb (Every Page)**: Subtle glowing orb at the bottom-right of the screen that opens a slide-over consultation drawer without leaving the current shopping journey.

### 3. Scent Discovery & Recommendations (`/scent-finder`)
- **6-Step Interactive Questionnaire**:
  1. Primary Fragrance Family affinity
  2. Preferred raw notes vs notes to avoid (e.g. Oud, Rose, Vanilla, Bergamot)
  3. Desired sillage & intensity (Intimate, Moderate, Bold)
  4. Occasion & Season (Daily, Evening, Date Night, Vacation)
  5. Investment budget tier
  6. Personal wear or gifting
- **Deterministic Recommendation Engine**:
  $$\text{Match Score}(p) = \sum_{i=1}^{n} w_i \cdot m_i(p)$$
- **Transparent Match Explanations**: Itemizes exact reasons why a fragrance matched (e.g. *"98% Match: Features your coveted Cambodian Oud & Bergamot notes, under ₹3,500 budget"*).

### 4. Detailed Product Page (PDP) (`/products/:id`)
- **Variant Selection**: Instant switching between 30ml, 50ml, and 100ml flacons and concentrations (EDT, EDP, Extrait).
- **Authoritative Price Per Milliliter**: Computed dynamically:
  $$\text{Price per ml} = \frac{\text{Variant Price}}{\text{Variant Volume in ml}}$$
- **Structured Olfactory Pyramid**: Visual breakdown of **Top (Opening)**, **Heart (Core)**, and **Base (Drydown)** notes with descriptions.
- **Sensory Guidance Meters**: Perceived Intensity, Longevity on Skin (hours), Sillage Projection, and Occasion tags.
- **Complimentary 2ml Sample Guarantee**: Explains the 30-day return policy on sealed master boxes.
- **Social Proof & Verified Reviews**: Star rating histogram, verified buyer badges, and real-time review submission.

### 4. Fragrance Comparison Matrix (`/compare`)
- Side-by-side comparison of 2 to 4 fragrances.
- Evaluates: Price, Price per ml, Bottle sizes, Concentration, Fragrance family, Top notes, Heart notes, Base notes, Scent descriptors, Longevity, Intensity, Sillage, Rating, and Stock availability.

### 5. Note Glossary & Directory (`/notes`)
- Educational library of natural absolutes, resins, woods, and florals with product counts and one-click filtering.

### 6. Cart & Authoritative Checkout (`/checkout`)
- **Slide-out Cart Drawer**: Free express shipping progress bar (threshold: ₹2,000), quantity controls, and coupon engine (`VIBE10` for 10% off, `LUXE500` for ₹500 off).
- **Server-Side Price & Stock Revalidation**: Cart amounts and discounts are authoritative; client values are never blindly trusted.
- **Interactive Sandbox Payment Gateway**: Test credit card simulator with prefill option (`4242 •••• •••• 4242`), CVV, and decline toggle for testing error recovery.
- **Idempotent Order Creation**: Unique order reference generation (`VP-2026-XXXXX`), inventory ledger deduction, and receipt summary.

### 7. Order Confirmation & Live Tracking (`/orders/:orderNumber` & `/track-order`)
- Step-by-step visual tracker: `Confirmed` $\rightarrow$ `Curating` $\rightarrow$ `Dispatched` $\rightarrow$ `Delivered`.
- Lookup by Order Number + Email.
- Cancellation option with automated stock restoration prior to shipment.

### 8. Atelier Staff Administration Portal (`/admin`)
- **Executive Metrics**: Total sales revenue, total orders placed, active catalog items, and low-stock alerts.
- **Catalog Management**: View variants and stock balances, adjust inventory with logged audit reasons.
- **Order Management**: Inspect order line items, advance status (`processing`, `shipped`, `delivered`, `cancelled`).
- **Review Moderation Queue**: Review, publish, or reject customer reviews with automatic rating aggregate recalculation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, Lucide Icons, React Hot Toast |
| **Styling** | Vanilla CSS Design System with Luxury Dark Obsidian palette, Glassmorphism, and Cormorant Garamond typography |
| **Backend** | Node.js, Express, File-based Persistent JSON Database (`backend/data/store.json`), Express Validator, CORS |
| **Testing** | Node.js built-in test runner (`node:test`) for Backend APIs; Vitest for Frontend Commerce & Discovery calculations |

---

## 📋 Running and Testing

### 1. Unified Test Suite
Run both backend and frontend tests from the repository root:
```bash
npm test
```

Or individually:
```bash
npm run test:backend   # Runs 19 API integration tests with node:test (Catalog, Scent Finder, AI Sommelier, Cart, Orders, Admin, PII Masking, Security)
npm run test:frontend  # Runs 7 commerce and discovery unit tests with Vitest
```

### 2. Running Locally

**Start Backend API (Port 5050):**
```bash
npm run dev:backend
```

**Start Frontend Storefront (Port 3000):**
```bash
npm run dev:frontend
```

---

## 🔒 Security & Commerce Integrity Rules

- **Price Integrity**: All checkout and cart payable amounts are computed and validated on the server.
- **Stock Integrity**: Stock deductions happen in the inventory ledger atomically upon order confirmation.
- **Payment Verification**: Sandbox provider verification ensures orders are only confirmed when payments succeed.
- **Client Isolation**: Guest checkouts use unique, unguessable identifiers; private customer orders are not indexed.
