<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TS">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-ready-black?logo=vercel" alt="Vercel"></a>
</p>

<h1 align="center">
  Supjav — JAV Streaming Platform
</h1>

<p align="center">
  A full-stack streaming website with a <strong>Next.js 16 + TypeScript</strong> frontend and
  <strong>built-in API routes</strong> for scraping — featuring a sleek red & blue glassmorphism design.<br>
  Deploy to <strong>Vercel</strong> in one click.
</p>

<p align="center">
  <img src="https://placehold.co/800x400/1a1a2e/ff4444?text=Home+Page+Screenshot" alt="Home" width="48%">
  &nbsp;
  <img src="https://placehold.co/800x400/1a1a2e/4488ff?text=Video+Player+Screenshot" alt="Player" width="48%">
</p>

---

## Table of Contents

- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Deploy to Vercel](#-deploy-to-vercel)
- [Scraper API](#-scraper-api)
  - [Endpoints](#api-endpoints)
  - [Data Types](#data-types)
- [Next.js Frontend](#-nextjs-frontend)
  - [Pages & Routes](#pages--routes)
  - [Components](#components)
- [Environment Variables](#-environment-variables)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🏗 Architecture

There are **two ways** to run this project:

### Option 1: All-in-one (Vercel-ready) ← Recommended

```
┌──────────────────────────────────────┐
│  Next.js 16 + TS (Vercel)            │
│                                      │
│  /app/page.tsx  ──fetch──▶  /api/... │
│  (SSR + ISR)                │        │
│                             │        │
│                    ┌────────▼──────┐  │
│                    │  API Routes   │  │
│                    │  (serverless) │  │
│                    │  cheerio+axios│  │
│                    └───────┬───────┘  │
│                            │          │
└────────────────────────────┼──────────┘
                             ▼
                    ┌──────────────────┐
                    │   javtiful.com   │
                    └──────────────────┘
```

The scraper logic is embedded as **Next.js API routes** (`/api/*`). No separate server needed — deploy the entire app to Vercel with a single push.

### Option 2: Separate servers (dev mode)

```
┌─────────────────────┐       ┌──────────────────────┐
│  Next.js (:3001)    │──HTTP─▶│  Express (:3000)     │
│  SSR + ISR pages    │  JSON │  cheerio + axios     │
└─────────────────────┘       └──────────┬───────────┘
                                         │
                                         ▼
                                  ┌──────────────────┐
                                  │   javtiful.com   │
                                  └──────────────────┘
```

A standalone Express server (`src/server.js`) that you can run separately. Useful for local development if you prefer.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+

### 1. Clone

```bash
git clone https://github.com/zainaqdas/supjav.git
cd supjav
```

### 2. Install & run (all-in-one)

```bash
cd frontend
npm install
npm run dev
# → Opens at http://localhost:3000
```

The API routes are included — no separate scraper server needed!

### Or: Run scraper separately (dev mode)

```bash
# Terminal 1: scraper
npm install
npm start
# → http://localhost:3000

# Terminal 2: frontend
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:3000/api npm run dev
# → http://localhost:3001
```

---

## 🚢 Deploy to Vercel

### Quick Deploy

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Set **Root Directory** to `frontend`
4. Click **Deploy**

That's it! Vercel auto-detects Next.js and builds the app.

### Manual Deploy (CLI)

```bash
cd frontend
npx vercel
# Follow the prompts to link and deploy
```

### Configuration

The `frontend/vercel.json` is pre-configured:

| Setting | Value |
|---|---|
| Framework | `nextjs` |
| Build command | `npm run build` |
| Output directory | `.next` |
| API function timeout | 30 seconds |
| API cache (listings) | 60s CDN + stale-while-revalidate |
| API cache (streams) | 300s CDN + stale-while-revalidate |

### Environment Variables (Vercel Dashboard)

| Variable | Value | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | (leave empty — uses internal `/api`) | No |

> **No environment variables needed** for the default all-in-one setup. The API routes are self-contained.

---

## 🔌 Scraper API

The scraper parses HTML from javtiful.com and exposes a clean JSON REST API at `/api/*`.

**Endpoints are available at:**
- **All-in-one:** `http://localhost:3000/api/*` (same as frontend)
- **Separate server:** `http://localhost:3000/api/*` (Express on port 3000)

### API Endpoints

#### Listing Endpoints

| Endpoint | Method | Params | Description |
|---|---|---|---|
| `/api/main` | GET | `?page=1` | Latest videos (paginated) |
| `/api/trending` | GET | `?page=1` | Popular/trending videos (paginated) |
| `/api/categories` | GET | — | All 21 categories with video counts |
| `/api/category/:slug` | GET | `?page=1` | Videos in a category (paginated) |
| `/api/actresses` | GET | — | All actresses with video counts |
| `/api/actress/:slug` | GET | `?page=1` | Videos by an actress (paginated) |
| `/api/channels` | GET | — | All channels/studios with video counts |
| `/api/channel/:slug` | GET | `?page=1` | Videos by a channel (paginated) |
| `/api/search` | GET | `?q=query&page=1` | Search videos (paginated) |

#### Video Detail Endpoints

| Endpoint | Description |
|---|---|
| `/api/video/:id` | Full video detail (title, poster, metadata, stream URLs) |
| `/api/video/:id/:slug` | Same as above, but slug ensures correct route matching |
| `/api/video/:id/stream` | Lightweight — returns only stream URLs + quality options |
| `/api/video/:id/comments` | Video comments (AJAX endpoint) |
| `/api/video/:id/download-link` | Download link (requires `X-CSRF-Token` header) |
| `/api/csrf-token` | Get CSRF token for authenticated requests |

#### Root

| Endpoint | Description |
|---|---|
| `/` | Frontend home page |
| `/api` | API documentation — lists all endpoints and query parameters |

### Data Types

#### VideoResult (listing)

```json
{
  "id": "108365",
  "slug": "hrsm-146",
  "title": "HRSM-146 Video Title",
  "url": "https://javtiful.com/video/108365/hrsm-146",
  "thumbnail": "https://...",
  "previewVideo": "https://...",
  "duration": "120 min",
  "quality": "HD",
  "views": "12.3k",
  "timeAgo": "2 days ago",
  "badges": ["Uncensored"]
}
```

#### VideoDetail (full)

```json
{
  "id": "108365",
  "slug": "hrsm-146",
  "title": "HRSM-146 Video Title",
  "poster": "https://...",
  "description": "...",
  "keywords": ["keyword1", "keyword2"],
  "videoCode": "HRSM-146",
  "releaseDate": "2024-01-15",
  "qualityOptions": [480, 720, 1080],
  "defaultQuality": 720,
  "streams": [
    {
      "url": "https://...cloudflarestorage.com/...mp4?...",
      "type": "video/mp4",
      "quality": "720p"
    }
  ],
  "previewSources": ["https://jav.si/..."],
  "thumbnails": ["https://..."],
  "actresses": [{ "slug": "actress-name", "name": "Actress Name" }],
  "tags": [{ "type": "category", "slug": "amateur", "name": "Amateur" }],
  "endpoints": {
    "comments": "/video/108365/comments",
    "playlist": "/video/108365/playlist",
    "downloadLink": "/video/108365/download-link",
    "favorite": "/video/108365/favorite",
    "report": "/video/108365/report"
  }
}
```

> **Stream URLs** are Cloudflare R2 pre-signed URLs valid for approximately 1 hour. They are extracted from the `#frontWatchConfig` JSON blob embedded in the source video page.

#### PaginatedResponse

```json
{
  "source": "main",
  "page": 1,
  "totalPages": 3,
  "totalResults": 42,
  "videos": [...]
}
```

---

## 🎨 Next.js Frontend

A modern, responsive streaming website built with **Next.js 16**, **TypeScript**, and **Tailwind CSS 4**.

### Design

- **Theme:** Deep dark backgrounds (`#0a0a0f`) with red (`#ff4444`) and blue (`#4488ff`) gradient accents
- **Glassmorphism** cards with hover overlays, animated border gradients, and fade-in-up animations
- **Custom scrollbar**, skeleton shimmer loaders, gradient text, and micro-interactions throughout
- **Fully responsive** — mobile hamburger nav, adaptive grids

<p align="center">
  <img src="https://placehold.co/800x400/1a1a2e/ff4444?text=Categories+Grid+Screenshot" alt="Categories" width="48%">
  &nbsp;
  <img src="https://placehold.co/800x400/1a1a2e/4488ff?text=Search+Results+Screenshot" alt="Search" width="48%">
</p>

### Pages & Routes

| Page | Route | Description |
|---|---|---|
| Home | `/` | Hero section, latest videos grid, trending section |
| Trending | `/trending` | Popular videos (paginated) |
| Categories | `/categories` | Grid of all 21 categories |
| Category | `/category/:slug` | Videos filtered by category (paginated) |
| Actresses | `/actresses` | Grid of all actresses |
| Actress | `/actress/:slug` | Videos by an actress (paginated) |
| Channels | `/channels` | Grid of all channels/studios |
| Channel | `/channel/:slug` | Videos by a channel (paginated) |
| Search | `/search?q=query` | Search results (paginated) |
| Video | `/video/:id/:slug` | Full video page with player, metadata, actresses, tags, thumbnails |
| 404 | `/[...]` | Custom not-found page |
| Error | `*` | Error boundary with reset button |
| Loading | `*` | Skeleton shimmer while pages load |

### Components

| Component | Description |
|---|---|
| `VideoPlayer` | Custom HTML5 player with play/pause, progress bar, volume, quality selector, fullscreen, auto-hide controls |
| `VideoCard` | Glassmorphism card with hover preview, quality/duration badges, gradient overlays |
| `PreviewVideo` | `'use client'` sub-component for mouse-enter preview playback |
| `VideoGrid` | Responsive CSS grid with staggered fade-in-up animations |
| `Navbar` | Sticky nav with scroll blur, mobile hamburger menu, inline search |
| `Footer` | Links and branding |
| `Pagination` | `'use client'` component with prev/next, page numbers, dots, gradient active state |
| `SectionHeader` | Gradient-text section titles with optional "View All" link |

---

## 🔧 Environment Variables

### Frontend (`.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `/api` | Base URL for scraper API. Leave empty for internal API routes. Set to `http://localhost:3000/api` to use standalone scraper. |

### Standalone Scraper (`.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Express server listen port |

---

## 🛠 Tech Stack

### Frontend + API

- **[Next.js 16](https://nextjs.org/)** — React framework with SSR, ISR, App Router, API routes
- **[React 19](https://react.dev/)** — UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** — Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS
- **[hls.js](https://github.com/video-dev/hls.js/)** — HLS stream playback
- **[axios](https://axios-http.com/)** — HTTP client for scraping
- **[cheerio](https://cheerio.js.org/)** — jQuery-style HTML parsing

### Standalone Scraper (optional)

- **[Express](https://expressjs.com/)** — HTTP server & routing
- **[axios](https://axios-http.com/)** — HTTP client
- **[cheerio](https://cheerio.js.org/)** — HTML parsing

---

## 📁 Project Structure

```
supjav/
├── package.json              # Standalone scraper dependencies & scripts
├── src/
│   ├── server.js             # Express server with 16 routes (optional)
│   └── scraper.js            # Core scraping engine (CommonJS, for standalone use)
├── frontend/
│   ├── package.json          # Frontend + API dependencies & scripts
│   ├── next.config.ts        # Next.js configuration
│   ├── vercel.json           # Vercel deployment config (caching, timeouts)
│   └── src/
│       ├── app/
│       │   ├── layout.tsx    # Root layout (theme, fonts, metadata)
│       │   ├── page.tsx      # Home page
│       │   ├── loading.tsx   # Global loading skeleton
│       │   ├── error.tsx     # Error boundary
│       │   ├── not-found.tsx # 404 page
│       │   ├── trending/
│       │   ├── categories/
│       │   ├── category/[slug]/
│       │   ├── actresses/
│       │   ├── actress/[slug]/
│       │   ├── channels/
│       │   ├── channel/[slug]/
│       │   ├── search/
│       │   ├── video/[id]/[slug]/
│       │   └── api/          # ← Scraper API routes (serverless on Vercel)
│       │       ├── route.ts
│       │       ├── main/
│       │       ├── trending/
│       │       ├── categories/
│       │       ├── category/[slug]/
│       │       ├── actresses/
│       │       ├── actress/[slug]/
│       │       ├── channels/
│       │       ├── channel/[slug]/
│       │       ├── search/
│       │       ├── video/[id]/
│       │       └── csrf-token/
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   ├── VideoCard.tsx
│       │   ├── PreviewVideo.tsx
│       │   ├── VideoPlayer.tsx
│       │   ├── VideoGrid.tsx
│       │   ├── Pagination.tsx
│       │   └── SectionHeader.tsx
│       └── lib/
│           ├── api.ts        # Frontend API client (fetch wrapper)
│           ├── types.ts      # TypeScript type definitions
│           └── scraper.ts    # Scraper logic (TypeScript ESM, for API routes)
└── README.md
```

---

## 📄 License

MIT © [zainaqdas](https://github.com/zainaqdas)

---

<p align="center">
  <sub>Built with ❤️ using Next.js, cheerio, and TypeScript</sub>
</p>
