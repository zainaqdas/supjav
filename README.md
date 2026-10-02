<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-087ea4?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TS">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Vercel-deployed-black?logo=vercel" alt="Vercel">
</p>

<h1 align="center">
  JavOnlineHD — JAV Streaming Platform
</h1>

<p align="center">
  A Next.js 16 App Router site with a <strong>built-in scraper API</strong> — red &amp; blue
  glassmorphism design, ISR + data-cache backed, with edge bot-blocking.
  Deploy to <strong>Vercel</strong>.
</p>

---

## Table of Contents

- [Architecture](#-architecture)
- [Caching model](#-caching-model) — read this first, it is the non-obvious part
- [Source mapping](#-source-mapping)
- [Quick start](#-quick-start)
- [Deploy to Vercel](#-deploy-to-vercel)
- [Scraper API](#-scraper-api)
  - [Endpoints](#api-endpoints)
  - [Parameter validation](#parameter-validation)
  - [Cache tiers](#cache-tiers)
  - [Sort options by route](#sort-options-by-route)
  - [Data types](#data-types)
- [Frontend](#-frontend)
- [Security](#-security)
- [Project structure](#-project-structure)

---

## 🏗 Architecture

A single Next.js project containing both the **frontend** (SSR pages) and the **scraper API**
(serverless route handlers).

```
┌──────────────────────────────────────┐
│  Next.js 16 + TS                     │
│                                      │
│  src/app/**/page.tsx                 │
│        │                             │
│        ▼                             │
│  src/lib/api.ts   ── unstable_cache ─┼──▶ Next data cache (1h / 5m)
│        │                             │
│        ▼                             │
│  src/lib/scraper.ts (cheerio+axios)  │
└────────┼─────────────────────────────┘
         ▼
   javtiful.com
```

Pages call `src/lib/api.ts`, which invokes the scraper directly — no HTTP self-fetches, which
avoids the relative-URL resolution problems that occur during SSR on Vercel. API routes call
`src/lib/scraper.ts` directly too, and add CDN `Cache-Control` headers via `src/lib/http.ts`.

---

## ⚠️ Caching model

**This is the part worth understanding before changing anything.**

Every listing page reads `searchParams` (`?page`, `?sort`, `?q`). In the App Router that
**opts the route into dynamic rendering**, and dynamic rendering ignores a page-level
`export const revalidate`.

So the many `export const revalidate = 3600` declarations in this codebase are, on their own,
inert for every page that reads `searchParams`. An earlier version of this project relied on
them alone and therefore **live-scraped the source site on every request** — four concurrent
scrapes per homepage view.

The actual caching lives one layer down, in `src/lib/api.ts`:

```ts
export const getVideos = cached(
  (page: number, sort?: string) => scraper.getVideos(page, sort).then(toListing),
  'getVideos',
  REVALIDATE_LISTINGS // 3600
);
```

`unstable_cache` populates the Next **data cache**, which is consulted regardless of whether
the page is statically or dynamically rendered. Arguments form part of the cache key, so each
`(page, sort)` pair is cached separately.

**Consequence:** the HTML response is still `Cache-Control: private, no-store` on those routes
(they are dynamic), but the expensive part — the upstream HTTP fetch and HTML parse — is served
from cache. Measured locally, the homepage drops from ~0.95s (cold) to ~0.09s (warm).

If you add a scraper call, wrap it in `cached(...)` in `src/lib/api.ts`. If you add a *page*,
do not assume `export const revalidate` will cache anything unless the page reads no
`searchParams`.

Two more cache layers exist:

| Layer | Where | Covers |
|---|---|---|
| Next data cache | `unstable_cache` in `src/lib/api.ts` | All page scraper calls |
| Vercel CDN | `Cache-Control` in `src/lib/http.ts` | `/api/*` JSON responses |
| Full-page ISR | `export const revalidate` | Static pages only (`/categories`, `/about`, `/contact`, `/privacy-policy`, `/terms`, `/sitemap.xml`) |

---

## 🗺 Source mapping

| Our route | Source URL | Pagination | Sort | Notes |
|---|---|---|---|---|
| `/` | `/videos` + `/trending` + `/censored` + `/uncensored` | — | 8-value | Dashboard. 4 concurrent cached scrapes. |
| `/videos` | `/videos` | ✅ windowed | ✅ 8-value | The real latest-videos archive. |
| `/trending` | `/trending` | ✅ | ❌ ignored upstream | No sort selector rendered. |
| `/censored` | `/censored` | ✅ | ✅ 8-value | |
| `/uncensored` | `/uncensored` | ✅ | ✅ 8-value | |
| `/reducing-mosaic` | `/reducing-mosaic` | ✅ | ✅ 8-value | |
| `/categories` | `/categories` | N/A | N/A | Flat list with counts. |
| `/category/:slug` | `/category/:slug` | ✅ exact | ✅ 4-value | Real name parsed from `h1`. |
| `/actresses` | `/actresses` | ✅ deep | N/A | Hundreds of pages. |
| `/actress/:slug` | `/actress/:slug` | ✅ exact | ✅ 4-value | Real name parsed from `h1`. |
| `/channels` | `/channels` | ✅ | N/A | |
| `/channel/:slug` | `/channel/:slug` | ✅ exact | ✅ 4-value | Real name parsed from `h1`. |
| `/search?q=` | `/search?q=` | ✅ | N/A | Relevance order only. Max 120 chars. |
| `/video/:id/:slug` | `/video/:id/:slug` | N/A | N/A | Streams from the source's CDN. |
| `/api/main` | `/main` | ❌ upstream ignores `?page=` | ❌ | Dashboard feed. |

### Pagination behaviour

- **Video listings** use a sliding window (current ± a few) that never exposes the true last
  page. The endpoint uses the disabled-`Next` signal to detect the end, so it never invents a
  phantom page.
- **Entity pages** embed the true last page in the widget, so `totalPages` is exact immediately.
- `totalResults` is an estimate derived from page count × page size (exact on the last page).
  The source exposes no reliable total count.

### Sort options

**8-value set** — `/videos`, `/censored`, `/uncensored`, `/reducing-mosaic`:

```
added_today, added_week, added_month, most_liked,
most_viewed, popular_today, popular_week, popular_month
```

**4-value set** — `/category/:slug`, `/actress/:slug`, `/channel/:slug`:

```
popular, added_today, added_week, added_month
```

> The source **silently ignores** unsupported sort values, which would otherwise make one URL
> mean two different things (and mint a second cache entry). Unknown values are now dropped
> rather than forwarded. `popular` = all-time popular.

---

## 🚀 Quick start

Requires **Node.js 20+** and **npm 9+**.

```bash
git clone https://github.com/zainaqdas/supjav.git
cd supjav
npm install
npm run dev        # → http://localhost:3000
```

The API routes ship with the app — no separate scraper server.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

---

## 🚢 Deploy to Vercel

Import the repo at [vercel.com/new](https://vercel.com/new), or run `npx vercel`.

`vercel.json` sets `framework: nextjs`, `buildCommand: npm run build`,
`installCommand: npm install`, `outputDirectory: .next`.

### Environment variables

| Variable | Default | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://javhdonline.vercel.app` | No | Canonical origin used for canonical URLs, OG tags, sitemap and JSON-LD. **Set this if you deploy to a custom domain.** An unparseable value falls back to the default with a warning. |

> **No secrets.** All data is scraped from public HTML.

---

## 🔌 Scraper API

JSON REST API at `/api/*`, same origin as the frontend.

### Endpoints

**Listings**

| Endpoint | Params | Cache | Description |
|---|---|---|---|
| `GET /api/main` | `?page` | 1h | Dashboard feed |
| `GET /api/videos` | `?page`, `?sort` | 1h | Latest videos (8-value sort) |
| `GET /api/trending` | `?page` | 1h | Trending |
| `GET /api/censored` | `?page`, `?sort` | 1h | Censored |
| `GET /api/uncensored` | `?page`, `?sort` | 1h | Uncensored |
| `GET /api/reducing-mosaic` | `?page`, `?sort` | 1h | Reducing mosaic |
| `GET /api/categories` | — | 1h | All categories + counts |
| `GET /api/category/:slug` | `?page`, `?sort` | 1h | Category videos + `name` |
| `GET /api/actresses` | `?page` | 1h | Actresses + counts |
| `GET /api/actress/:slug` | `?page`, `?sort` | 1h | Actress videos + `name` |
| `GET /api/channels` | `?page` | 1h | Channels + counts |
| `GET /api/channel/:slug` | `?page`, `?sort` | 1h | Channel videos + `name` |
| `GET /api/search` | `?q` (required, ≤120 chars), `?page` | 1h | Search |

**Detail**

| Endpoint | Cache | Description |
|---|---|---|
| `GET /api/video/:id` | 300s | Full detail; slug auto-resolved from the upstream 301 |
| `GET /api/video/:id/:slug` | 300s | Full detail |
| `GET /api/video/:id/stream` | 300s | Stream URLs + quality options |
| `GET /api/video/:id/comments` | 300s | Comments parsed from the watch page |
| `GET /api/video/:id/download-link` | none | Server-side download link |

**Utility**

| Endpoint | Cache | Description |
|---|---|---|
| `GET /api` | 1h | Machine-readable API docs |
| `GET /api/csrf-token` | none | Upstream CSRF token |
| `GET /api/proxy/image?url=` | 24h | Image proxy (allowlisted hosts, images only) |

### Parameter validation

All query and path parameters are validated centrally in `src/lib/http.ts`:

| Param | Rule | On violation |
|---|---|---|
| `page` | plain integer string, clamped to 1…1000 | falls back to `1` |
| `sort` | must be in the route's supported set | ignored |
| `slug` | `[A-Za-z0-9._~-]{1,128}` (single path segment) | API: `400` · page: `404` |
| `id` | `^\d{1,12}$` | API: `400` · page: `404` |
| `q` | non-empty after trim, ≤120 chars | `400` |

Invalid page **paths** are rejected in `src/proxy.ts` at the edge rather than via `notFound()`,
because `notFound()` cannot set a status code once a dynamic response has begun streaming —
it would render the 404 page under a `200`, i.e. a soft 404 that search engines index.

### Cache tiers

| Tier | `Cache-Control` | Applies to |
|---|---|---|
| `hour` | `s-maxage=3600, stale-while-revalidate=3600` | Listings, entity pages, docs |
| `video` | `s-maxage=300, stale-while-revalidate=300` | `/api/video/*` detail & stream (pre-signed URLs expire ~1h) |
| `none` | `no-store, max-age=0, must-revalidate` | `/api/csrf-token`, `/api/video/:id/download-link` (session-bound) |
| proxy | `s-maxage=86400, stale-while-revalidate=86400` | `/api/proxy/image` |

### Data types

`VideoResult` (listing card):

```json
{
  "id": "108365",
  "slug": "hrsm-146",
  "title": "HRSM-146 …",
  "url": "https://javtiful.com/video/108365/hrsm-146",
  "thumbnail": "/api/proxy/image?url=…",
  "previewVideo": "https://…jav.si/…_preview.mp4",
  "duration": "02:06:39",
  "quality": "HD",
  "views": "214.7K",
  "timeAgo": null,
  "badges": null
}
```

`VideoDetail` adds `poster`, `description`, `keywords`, `videoCode`, `releaseDate`,
`qualityOptions`, `defaultQuality`, `streams`, `previewSources`, `thumbnails`, `actresses`,
`tags`, `endpoints`, `related`, `comments`.

Entity responses add a `name` field parsed from the source `h1`
(`"Hamasaki Mao JAV Videos - Latest HD Updates"` → `"Hamasaki Mao"`).

> Preview clips and full streams are served from the source's own CDN hosts (`…jav.si`) and are
> **not** proxied. `lib/api.ts` additionally refuses to route video extensions through the
> image proxy as a guard against a host change.

---

## 🎨 Frontend

**Theme:** `#0a0a0f` backgrounds, red (`#dc2626`) / blue (`#2563eb`) gradient accents,
glassmorphism cards, staggered fade-in animations, mobile-first responsive grids.

| Component | Notes |
|---|---|
| `VideoPlayer` | Custom HTML5 player. Play/pause, seek, volume, quality, fullscreen, auto-hide controls. Seek and volume are keyboard-operable (`role="slider"`, arrows/Home/End). |
| `VideoCard` | Glass card, hover preview, quality/duration badges. Deduplicated by video `id`. |
| `PreviewVideo` | Client component; plays the hover preview clip. |
| `VideoGrid` | Responsive grid; dedupes by `id` so duplicate React keys are impossible. |
| `Navbar` | Sticky, scroll blur, mobile menu, inline search. |
| `Pagination` | Client component; builds only the visible page window (first, last, current ±1) and clamps `totalPages` to 200. |
| `SortSelector` | Configurable `options`; listing pages pass the 8-value set, entity pages the 4-value set. |
| `JsonLd` | Renders a `application/ld+json` block. |
| `Footer` / `SectionHeader` / `ContactForm` | Static/presentational. |

Structured data: `WebSite` + `SearchAction` (layout), `FAQPage` (home), `BreadcrumbList`
(entity pages), `VideoObject` + `InteractionCounter` (video pages), plus a generated OG image.

---

## 🔒 Security

- **AI-crawler blocking.** `src/proxy.ts` hard-403s ~20 known AI/scraping user agents at the
  edge, with `X-Robots-Tag: noindex`. This exists because uncached requests each trigger a live
  upstream scrape inside a serverless function; crawlers previously burned ~186k invocations in
  a single day. `public/robots.txt` carries the matching `Disallow` list and stays reachable so
  compliant crawlers can read it.
- **Security headers** (`next.config.ts`): `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS.
- **Image proxy** (`/api/proxy/image`) is an allowlist proxy — `javtiful.com` and
  `r2.cloudflarestorage.com` only, `http`/`https` only, exact-host or subdomain match (so
  `javtiful.com.evil.example` is rejected). It additionally:
  - refuses non-`image/*` upstream responses with `415`, so a user-uploaded `text/html` file
    can never execute as first-party script;
  - serves the validated image type, never the raw upstream header;
  - sends `nosniff` and `Content-Security-Policy: default-src 'none'; sandbox`;
  - caps the buffered body at 10 MB (`413`), checked against `Content-Length` first and again
    after reading.
- **`/api/video/:id/download-link`** no longer accepts a client-supplied CSRF token. The token is
  acquired server-side immediately before the upstream POST, so the endpoint cannot be used as a
  generic authenticated relay, and it is `no-store` because its response is bound to a freshly
  minted upstream session.
- **Input validation** is centralised and bounded (see above), which also keeps the data-cache
  key space finite.

---

## 🗂 Project structure

```
supjav/
├── package.json
├── next.config.ts            # security headers
├── tsconfig.json
├── vercel.json
├── postcss.config.mjs
├── eslint.config.mjs
├── public/
│   ├── robots.txt            # AI-crawler disallow list
│   └── site.webmanifest
└── src/
    ├── proxy.ts              # edge: AI-bot block + param-shape 404s
    ├── app/
    │   ├── layout.tsx        # metadata, fonts, WebSite JSON-LD
    │   ├── page.tsx          # home (4 cached sections + FAQ + content)
    │   ├── sitemap.ts        # static pages + entities + recent videos
    │   ├── opengraph-image.tsx
    │   ├── loading.tsx / error.tsx / not-found.tsx
    │   ├── about/ contact/ privacy-policy/ terms/
    │   ├── videos/ trending/ censored/ uncensored/ reducing-mosaic/
    │   ├── categories/ category/[slug]/
    │   ├── actresses/ actress/[slug]/
    │   ├── channels/ channel/[slug]/
    │   ├── search/
    │   ├── video/[id]/[slug]/
    │   └── api/
    │       ├── route.ts                    # machine-readable docs
    │       ├── main/ trending/ videos/ censored/ uncensored/
    │       ├── reducing-mosaic/
    │       ├── categories/ category/[slug]/
    │       ├── actresses/ actress/[slug]/
    │       ├── channels/ channel/[slug]/
    │       ├── search/
    │       ├── video/[id]/ video/[id]/[slug]/ video/[id]/stream/
    │       ├── video/[id]/comments/ video/[id]/download-link/
    │       ├── csrf-token/
    │       └── proxy/image/
    ├── components/           # 11 UI components
    └── lib/
        ├── api.ts            # cached scraper client (unstable_cache)
        ├── scraper.ts        # cheerio parsing engine
        ├── http.ts           # apiJson + cache tiers + param validation
        ├── site.ts           # SITE_URL / SITE_NAME
        └── types.ts          # shared interfaces
```