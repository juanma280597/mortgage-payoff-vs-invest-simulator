# Mortgage Payoff vs. Invest Simulator

A zero-infrastructure, 100% client-side static financial simulator built with **Vite + React + TypeScript + Tailwind CSS + Recharts**, optimized for bilingual SEO (`/en/` and `/es/`) and Google AdSense (zero CLS).

## Key Features

- **Pure Financial Engine (`src/utils/mortgageMath.ts`)**
  - Cent-exact monthly amortization loop preventing floating-point rounding drift.
  - Compares **Scenario A** (extra monthly principal payments + reinvesting freed-up payments post-payoff) vs. **Scenario B** (investing the monthly surplus from month 1).
  - Exact numeric **Break-Even Rate** solver accounting for capital gains taxes.
  - Optional annual **Inflation Adjustment** (nominal vs. today's purchasing power).
  - Year-by-year & month-by-month schedules with UTF-8 BOM **CSV Export**.
- **Real-Time Currency Support (`USD`, `MXN`, `EUR`)**
  - Integrates [Frankfurter API](https://api.frankfurter.app/latest) (ECB reference rates, no API key required) with 12-hour `localStorage` caching and offline fallback rates.
- **Bilingual SEO Routes (`/en/` & `/es/`)**
  - Dynamic `<title>`, `<meta name="description">`, `canonical`, `hreflang` (`en`, `es`, `x-default`), and `WebApplication` JSON-LD.
  - Automatic post-build static HTML generation for `dist/en/index.html`, `dist/es/index.html`, `dist/404.html`, and `_redirects` for Cloudflare Pages / GitHub Pages.
- **Google AdSense Ready (Zero CLS)**
  - Fixed-height `<AdSlot />` placeholders (`banner` and `sidebar` 300×250) plus rich formula methodology and 5-item FAQ accordions in both English and Spanish.
- **Local Persistence**
  - Saves recent scenarios and active inputs in `localStorage` with zero backend or tracking.

## Scripts

```bash
npm install
npm run dev      # Start local Vite dev server
npm test         # Run Vitest unit tests
npm run lint     # Run oxlint checks
npm run build    # Type-check and build static dist/
```

## Deploying ($0 Infrastructure)

### Environment Variables

- `VITE_SITE_URL` *(optional)*: Base public URL used at build time and runtime for `canonical`, `hreflang`, `og:url`, `sitemap.xml`, and `robots.txt`. Defaults to `https://mortgage-vs-invest.pages.dev`.
- `VITE_CONTACT_EMAIL` *(optional)*: Contact email displayed on the Privacy Policy and Contact pages. Defaults to `contact@mortgage-vs-invest.pages.dev`.

### Static Hosting

- **Cloudflare Pages**: Build command `npm run build`, output directory `dist`. `public/_redirects` is automatically included, and all bilingual routes (`/en/`, `/es/`, `/en/privacy/`, `/es/privacidad/`, `/en/terms/`, `/es/terminos/`, `/en/cookies/`, `/es/cookies/`, `/en/contact/`, `/es/contacto/`) are pre-generated as static HTML.
- **GitHub Pages**: Publish the generated `dist/` folder (`dist/404.html`, `dist/sitemap.xml`, `dist/robots.txt`, and all pre-rendered `/en/*` and `/es/*` HTML pages are included).
