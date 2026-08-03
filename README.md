<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TS">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Vercel-deployed-black?logo=vercel" alt="Vercel">
</p>

<h1 align="center">
  JavOnlineHd — JAV Streaming Platform
</h1>

<p align="center">
  A full-stack streaming website with a <strong>Next.js 15 + TypeScript</strong> frontend and
  <strong>built-in scraper API</strong> — featuring a red & blue glassmorphism design.<br>
  Deploy to <strong>Vercel</strong> in one click.
</p>

---

## Table of Contents

- [Architecture](#-architecture)
- [Source Mapping](#-source-mapping)
- [Quick Start](#-quick-start)
- [Deploy to Vercel](#-deploy-to-vercel)
- [Scraper API](#-scraper-api)
  - [API Endpoints](#api-endpoints)
  - [Sort Options by Route](#sort-options-by-route)
  - [Cache Tiers](#cache-tiers)
  - [Data Types](#data-types)
- [Next.js Frontend](#-nextjs-frontend)
  - [Pages & Routes](#pages--routes)
  - [Components](#components)
- [Bot Protection](#-bot-protection)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)

---

## 🏗 Architecture

A single Next.js project containing both the **frontend** (SSR pages) and the **scraper API** (serverless functions).

```
┌──────────────────────────────────────┐
│  Next.js 15 + TS                     │
│                                      │
│  src/app/page.tsx  ──fetch──▶  /api/ │
│  (SSR + ISR)              │          │
│                           │          │
│               ┌───────────▼────────┐  │
│               │  API Routes        │  │
│               │  (serverless)      │  │
│               │  cheerio + axios   │  │
│               └─────────┬──────────┘  │
└─────────────────────────┼─────────────┘
                          ▼
                 ┌──────────────────┐
                 │   javtiful.com   │
                 └──────────────────┘
```

The scraper logic lives in `src/lib/scraper.ts`. API routes are thin wrappers that call it. Pages call `src/lib/api.ts`, which proxies through the scraper directly (no HTTP self-fetches — works reliably during SSR on Vercel).

---

## 🗺 Source Mapping

Every route maps to a specific javtiful.com source page, verified by the full end-to-end audit:

| Our Route | Source URL | Pagination | Sort Support | Notes |
|---|---|---|---|---|
| `/` (Home) | `/main` | ❌ (/main ignores `?page=`) | ❌ | Dashboard of sections (Latest, Censored, Uncensored, Trending, Explore). Not a paginated listing. |
| `/videos` | `/videos` | ✅ Windowed (1..+1, Next disabled at end) | ✅ 8-value set (see below) | The real "Latest JAV Videos" archive — our default homepage link. |
| `/trending` | `/trending` | ✅ | ❌ (source ignores `?sort=`) | No sort selector rendered. |
| `/censored` | `/censored` | ✅ | ✅ 8-value set | Sort verified: 0% content overlap. |
| `/uncensored` | `/uncensored` | ✅ | ✅ 8-value set | |
| `/reducing-mosaic` | `/reducing-mosaic` | ✅ | ✅ 8-value set | |
| `/categories` | `/categories` | N/A | N/A | 21 categories with counts. |
| `/category/:slug` | `/category/:slug` | ✅ Last page exact | ✅ 4-value set | Real name parsed from h1 (e.g. "Affair"). |
| `/actresses` | `/actresses` | ✅ 313 pages | N/A | |
| `/actress/:slug` | `/actress/:slug` | ✅ Last page exact (e.g. 16) | ✅ 4-value set | Real name parsed from h1 (e.g. "Hamasaki Mao"). |
| `/channels` | `/channels` | ✅ 13 pages | N/A | |
| `/channel/:slug` | `/channel/:slug` | ✅ Last page exact (e.g. 88) | ✅ 4-value set | Real name parsed from h1 (e.g. "Attackers"). |
| `/search?q=...` | `/search?q=...` | ✅ | N/A | Search only sorts by relevance. |
| `/video/:id/:slug` | `/video/:id/:slug` | N/A | N/A | Full detail — streams from Cloudflare R2. |

### Pagination Behavior

- **Video listings** (`/videos`, `/censored`, etc.) use a **sliding window** widget (current page ± a few). The widget never exposes the true last page number — our endpoint uses the disabled-Next signal to detect the end.
- **Entity pages** (`/category/:slug`, `/actress/:slug`, `/channel/:slug`) embed the true last page in the widget (e.g. page 1 shows link to page 286). We report exact `totalPages` immediately.
- On the **true last page** (Next disabled) we never invent a phantom page beyond it.

### Sort Options by Route

Not all sort values work on every route. Using an unsupported value causes the source to silently fall back to the default order.

**8-value set** — for `/videos`, `/censored`, `/uncensored`, `/reducing-mosaic`:

```
added_today, added_week, added_month, most_liked,
most_viewed, popular_today, popular_week, popular_month
```

**4-value set** — for `/category/:slug`, `/actress/:slug`, `/channel/:slug`:

```
popular, added_today, added_week, added_month
```

> `popular` = all-time popular. The `popular_week` / `popular_month` values that work on video listings are **silently ignored** on entity pages.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+

### 1. Clone

```bash
git clone https://github.com/zainaqdas/supjav.git
cd supjav
```

### 2. Install & run

```bash
npm install
npm run dev
# → Opens at http://localhost:3000
```

The API routes are included — no separate scraper server needed.

---

## 🚢 Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Click **Deploy**

Or via CLI:

```bash
npx vercel
```

### Configuration (`vercel.json`)

| Setting | Value |
|---|---|
| Framework | `nextjs` |
| Build command | `npm run build` |
| Output directory | `.next` |

### Environment Variables

| Variable | Default | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | (empty — uses internal `/api`) | No |

> **No secrets required.** All data is scraped from public HTML.

### Bot Protection

The `middleware.ts` (Vercel Edge) blocks well-known AI crawler user-agents at the edge, returning **HTTP 403** before they reach the serverless functions or CDN. Blocked agents include:
- `ClaudeBot` / `Claude-Web`
- `ai_crawler`
- `Bytespider`
- `GPTBot` / `ChatGPT-User`

These never appear in your Vercel usage metrics, protecting your free-tier quota from aggregation/bot-driven traffic.

---

## 🔌 Scraper API

The scraper parses HTML from javtiful.com and exposes a clean JSON REST API at `/api/*`. **Base URL:** same origin as the frontend.

### API Endpoints

#### Listing Endpoints

| Endpoint | Params | Cache | Description |
|---|---|---|---|
| `GET /api/main` | `?page=1` | 1h | Home dashboard videos |
| `GET /api/trending` | `?page=1` | 1h | Trending videos |
| `GET /api/videos` | `?page=1&sort=added_week` | 1h | **Latest JAV videos** — full 8-value sort |
| `GET /api/censored` | `?page=1&sort=popular_week` | 1h | Censored listing |
| `GET /api/uncensored` | `?page=1&sort=popular_week` | 1h | Uncensored listing |
| `GET /api/reducing-mosaic` | `?page=1&sort=popular_week` | 1h | Reducing-mosaic listing |
| `GET /api/categories` | — | 1h | All categories with counts |
| `GET /api/category/:slug` | `?page=1&sort=popular` | 1h | Category videos (4-value sort) — returns `name` field |
| `GET /api/actresses` | `?page=1` | 1h | All actresses with counts (313 pages) |
| `GET /api/actress/:slug` | `?page=1&sort=popular` | 1h | Videos by actress (4-value sort) — returns `name` field |
| `GET /api/channels` | `?page=1` | 1h | All channels with counts (13 pages) |
| `GET /api/channel/:slug` | `?page=1&sort=popular` | 1h | Videos by channel (4-value sort) — returns `name` field |
| `GET /api/search` | `?q=query&page=1` | 1h | Search results |

#### Detail Endpoints

| Endpoint | Cache | Description |
|---|---|---|
| `GET /api/video/:id` | 300s | Full video detail — slug auto-resolved from redirect |
| `GET /api/video/:id/:slug` | 300s | Full video detail |
| `GET /api/video/:id/stream` | 300s | Lightweight — stream URLs + quality options |
| `GET /api/video/:id/comments` | 300s | Video comments (parsed from page) |
| `GET /api/video/:id/download-link` | 300s | Download link (requires `X-CSRF-Token` header) |

#### Utility Endpoints

| Endpoint | Cache | Description |
|---|---|---|
| `GET /api` | 1h | API documentation — lists all endpoints, params, cache tiers |
| `GET /api/csrf-token` | None | Get CSRF token for authenticated POSTs |
| `GET /api/proxy/image` | 24h | Proxies javtiful.com images to avoid CORS blocking |

### Cache Tiers

Every endpoint sets explicit `Cache-Control` headers. Vercel's edge CDN respects `s-maxage` and serves cached responses without invoking the serverless function.

| Tier | `Cache-Control` | Applies to | Effect |
|---|---|---|---|
| `hour` | `s-maxage=3600, stale-while-revalidate=3600` | All listing endpoints, docs | **1 hour cache** — repeat visitors see HIT at the edge; no function invocation. |
| `video` | `s-maxage=300, stale-while-revalidate=300` | `/api/video/*` detail, stream, comments, download | **5 minute cache** — pre-signed stream URLs expire in ~1h, so cache is conservative to avoid serving broken URLs. |
| `proxy` | `s-maxage=86400, stale-while-revalidate=86400` | `/api/proxy/image` | **24 hour cache** — images don't change. |
| `none` | `max-age=0, must-revalidate` | `/api/csrf-token` | Never cached — each request needs a fresh token. |

> **Note:** Vercel rewrites `s-maxage` in client-facing `Cache-Control` to `public` (so browsers don't cache aggressively) while honoring it at the edge. This is proven by `x-vercel-cache: HIT` on repeat requests.

### Data Types

#### VideoResult (listing card)

```json
{
  "id": "108365",
  "slug": "hrsm-146",
  "title": "HRSM-146 Video Title",
  "url": "https://javtiful.com/video/108365/hrsm-146",
  "thumbnail": "/api/proxy/image?url=...",
  "previewVideo": "/api/proxy/image?url=...",
  "duration": "02:06:39",
  "quality": "HD",
  "views": "214.7K",
  "timeAgo": null,
  "badges": null
}
```

#### VideoDetail (full)

```json
{
  // All VideoResult fields +
  "poster": "https://...",
  "description": "...",
  "keywords": ["keyword1", "keyword2"],
  "videoCode": "HRSM-146",
  "releaseDate": "2024-03-09T12:07:53+07:00",
  "qualityOptions": [480, 720, 1080],
  "defaultQuality": 720,
  "streams": [{ "url": "https://...cloudflarestorage.com/mp4", "type": "video/mp4", "quality": "720p" }],
  "previewSources": [],
  "thumbnails": [],
  "actresses": [{ "slug": "actress-name", "name": "Actress Name" }],
  "tags": [{ "type": "category", "slug": "big-tits", "name": "Big Tits" }],
  "endpoints": {
    "comments": "/video/108365/comments",
    "playlist": "/video/108365/playlist",
    "downloadLink": "/video/108365/download-link",
    "favorite": "/video/108365/favorite",
    "report": "/video/108365/report",
    "react": "/video/108365/react",
    "embed": "https://javtiful.com/embed/108365"
  },
  "related": [VideoResult, ...],
  "comments": [Comment, ...]
}
```

> **Stream URLs** are Cloudflare R2 pre-signed URLs valid for ~1 hour. Extracted from the `#frontWatchConfig` JSON blob on the source video page.

#### PaginatedResponse

```json
{
  "source": "videos",
  "page": 1,
  "totalPages": 2,
  "totalResults": 48,
  "videos": [VideoResult, ...]
}
```

> `totalPages` on early pages of video listings may report a low number (e.g. 2) because the source's pagination widget is windowed. Navigation works forward one page at a time. On the true last page, `totalPages` is exact.

#### Entity Responses

```json
// /api/category/:slug — adds:
{ "name": "Affair", "category": "affair" }

// /api/actress/:slug — adds:
{ "name": "Hamasaki Mao", "actress": "hamasaki-mao" }

// /api/channel/:slug — adds:
{ "name": "Attackers", "channel": "attackers" }
```

> `name` is parsed from the source page h1 (e.g. "Hamasaki Mao JAV Videos - Latest HD Updates" → "Hamasaki Mao").

#### Comment

```json
{
  "id": "comment-id",
  "author": "Username",
  "content": "Comment text",
  "date": "2024-03-10T10:00:00Z",
  "children": [Comment, ...]
}
```

---

## 🎨 Next.js Frontend

A modern, responsive streaming website built with **Next.js 15**, **TypeScript**, and **Tailwind CSS 4**.

### Design

- **Theme:** Deep dark backgrounds (`#0a0a0f`) with red (`#dc2626`) and blue (`#2563eb`) gradient accents
- **Glassmorphism** cards with hover video previews, animated overlays, and fade-in-up animations
- **Custom scrollbar**, gradient text, and micro-interactions throughout
- **Fully responsive** — mobile hamburger nav, adaptive grids (2→3→4→5 columns)

### Pages & Routes

| Page | Route | Features |
|---|---|---|
| Home | `/` | Hero gradient, 5 sections: Latest Uploads → `/videos`, Censored, Uncensored, Trending, Explore |
| Videos | `/videos` | 8-value SortSelector + Pagination |
| Trending | `/trending` | Pagination only (no sort — source ignores it) |
| Categories | `/categories` | Grid of 21 categories with counts |
| Category | `/category/:slug` | **4-value SortSelector** (matches source), real `name` title, Pagination preserves sort |
| Actresses | `/actresses` | Grid across 313 pages, Pagination |
| Actress | `/actress/:slug` | **4-value SortSelector**, real `name` title, Pagination preserves sort |
| Channels | `/channels` | Grid across 13 pages, Pagination |
| Channel | `/channel/:slug` | **4-value SortSelector**, real `name` title, Pagination preserves sort |
| Search | `/search?q=` | Results display (same VideoGrid) |
| Video | `/video/:id/:slug` | Player, title, metadata, tags, actresses, description, keywords, sidebar info, screenshots, threaded comments, related videos |
| 404 | `*` | Custom not-found with link home |
| Error | `*` | Error boundary with reset button |
| Loading | `*` | Skeleton shimmer |

### Components

| Component | Description |
|---|---|
| `VideoPlayer` | Custom HTML5 player — play/pause, progress bar, volume, quality selector, fullscreen, auto-hide controls |
| `VideoCard` | Glassmorphism card with hover preview, HD/FHD quality badge, duration badge, gradient overlays |
| `PreviewVideo` | `'use client'` — plays preview clip on mouse-enter |
| `VideoGrid` | Responsive CSS grid with staggered fade-in-up (empty state: icon + "No videos found") |
| `Navbar` | Sticky with scroll blur, mobile hamburger menu, inline search, all page links |
| `Footer` | Links, branding, privacy/terms |
| `Pagination` | `'use client'` — prev/next, page numbers, ellipsis, gradient active state, persists `?sort=` across pages |
| `SectionHeader` | Gradient-text titles with optional "View All" link |
| `SortSelector` | `'use client'` — configurable `options` prop; defaults to **8-value set**; detail pages pass **4-value set** |

### Vercel Usage Optimization

After the initial deployment, the site exceeded Vercel's Hobby quota (100,000 edge requests/month) due to:
1. **Uncached API routes** — every page load → scraper call (Aug 1: 186,000 requests in one day)
2. **AI crawlers** hitting the site repeatedly

Applied fixes (all live):
- ✔ **CDN cache headers** on every `/api/*` route (1h listings / 300s video / 24h images)
- ✔ **Bot-blocking middleware** — ClaudeBot, ai_crawler, Bytespider, GPTBot → 403 at the edge
- ✔ **ISR** (`revalidate=3600`) on all listing pages to reduce SSR invocations
- ✔ **Windowed-pagination detection** — no phantom requests past the real last page

**Result:** Daily scraper calls dropped from ~186,000 → ~300-400 (projected). Cache hit rate climbing from 0.5% → 16.8% in the first 9 hours post-deploy.

---

## 🛠 Tech Stack

- **[Next.js 15](https://nextjs.org/)** — App Router, SSR, ISR, API routes, Edge middleware
- **[React 19](https://react.dev/)** — Server & Client components
- **[TypeScript 5](https://www.typescriptlang.org/)** — Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS
- **[axios](https://axios-http.com/)** — HTTP client (follows 301s, sends browser-like headers)
- **[cheerio](https://cheerio.js.org/)** — jQuery-style HTML parsing on the server
- **[Vercel](https://vercel.com/)** — Hosting, Edge Network, CDN caching

---

## 📁 Project Structure

```
supjav/
├── package.json              # Single package.json
├── next.config.ts            # Next.js config
├── tsconfig.json
├── vercel.json               # Vercel deploy config
├── postcss.config.mjs        # Tailwind config
├── eslint.config.mjs         # ESLint
├── public/
└── src/
    ├── app/
    │   ├── globals.css       # Tailwind imports + global styles
    │   ├── layout.tsx        # Root layout (theme, fonts, metadata)
    │   ├── page.tsx          # Home page (5 sections)
    │   ├── loading.tsx       # Skeleton shimmer
    │   ├── error.tsx         # Error boundary
    │   ├── not-found.tsx     # Custom 404
    │   ├── videos/page.tsx   # /videos (8-value sort)
    │   ├── trending/page.tsx # /trending (no sort)
    │   ├── censored/page.tsx # /censored (8-value sort)
    │   ├── uncensored/page.tsx
    │   ├── reducing-mosaic/page.tsx
    │   ├── categories/page.tsx
    │   ├── actresses/page.tsx
    │   ├── channels/page.tsx
    │   ├── search/page.tsx
    │   ├── category/[slug]/page.tsx  # (4-value sort + real name)
    │   ├── actress/[slug]/page.tsx   # (4-value sort + real name)
    │   ├── channel/[slug]/page.tsx   # (4-value sort + real name)
    │   ├── video/[id]/[slug]/page.tsx
    │   └── api/
    │       ├── route.ts                     # API docs
    │       ├── main/route.ts
    │       ├── trending/route.ts
    │       ├── videos/route.ts
    │       ├── censored/route.ts
    │       ├── uncensored/route.ts
    │       ├── reducing-mosaic/route.ts
    │       ├── categories/route.ts
    │       ├── actresses/route.ts
    │       ├── channels/route.ts
    │       ├── category/[slug]/route.ts
    │       ├── actress/[slug]/route.ts
    │       ├── channel/[slug]/route.ts
    │       ├── search/route.ts
    │       ├── video/[id]/route.ts
    │       ├── video/[id]/[slug]/route.ts
    │       ├── video/[id]/stream/route.ts
    │       ├── video/[id]/comments/route.ts
    │       ├── video/[id]/download-link/route.ts
    │       ├── csrf-token/route.ts
    │       └── proxy/image/route.ts
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── VideoCard.tsx
    │   ├── PreviewVideo.tsx
    │   ├── VideoPlayer.tsx
    │   ├── VideoGrid.tsx
    │   ├── Pagination.tsx
    │   ├── SectionHeader.tsx
    │   └── SortSelector.tsx
    └── lib/
        ├── api.ts           # API client (calls scraper directly)
        ├── types.ts         # All TypeScript interfaces
        ├── http.ts          # apiJson helper + cache header constants
        └── scraper.ts       # Core scraping engine (cheerio + axios)
```