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

A single Next.js 16 project containing both the **frontend** (SSR pages) and the **scraper API** (serverless functions).

```
┌──────────────────────────────────────┐
│  Next.js 16 + TS                     │
│                                      │
│  src/app/page.tsx  ──fetch──▶  /api/│
│  (SSR + ISR)              │         │
│                           │         │
│               ┌───────────▼───────┐  │
│               │  API Routes       │  │
│               │  (serverless)     │  │
│               │  cheerio + axios  │  │
│               └─────────┬─────────┘  │
└─────────────────────────┼────────────┘
                          ▼
                 ┌──────────────────┐
                 │   javtiful.com   │
                 └──────────────────┘
```

Everything lives at the project root — no subdirectories, no separate scraper server. The scraper logic is embedded as **Next.js API routes** (`src/app/api/*`). Deploy the entire app to Vercel with a single push.

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

The API routes are included — no separate scraper server needed!

---

## 🚢 Deploy to Vercel

### Quick Deploy

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Click **Deploy**

That's it! Vercel auto-detects Next.js — no root directory or configuration needed.

### Manual Deploy (CLI)

```bash
npx vercel
# Follow the prompts to link and deploy
```

### Configuration

The root `vercel.json` is pre-configured:

| Setting | Value |
|---|---|
| Framework | `nextjs` |
| Build command | `npm run build` |
| Output directory | `.next` |

### Environment Variables (Vercel Dashboard)

| Variable | Value | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | (leave empty — uses internal `/api`) | No |

> **No environment variables needed.** The API routes are self-contained within the Next.js app.

---

## 🔌 Scraper API

The scraper parses HTML from javtiful.com and exposes a clean JSON REST API at `/api/*`.

**Base URL:** `http://localhost:3000/api/*` (same origin as the frontend)

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

### `.env.local`

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `/api` | Base URL for scraper API. Leave empty for internal API routes. |

---

## 🛠 Tech Stack

- **[Next.js 16](https://nextjs.org/)** — React framework with SSR, ISR, App Router, API routes
- **[React 19](https://react.dev/)** — UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** — Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS
- **[hls.js](https://github.com/video-dev/hls.js/)** — HLS stream playback
- **[axios](https://axios-http.com/)** — HTTP client for scraping
- **[cheerio](https://cheerio.js.org/)** — jQuery-style HTML parsing

---

## 📁 Project Structure

A single, consolidated Next.js project at root — no subdirectories, no separate servers.

```
supjav/
├── package.json              # Single package.json for everything
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── vercel.json               # Vercel deployment config (framework: nextjs)
├── postcss.config.mjs        # PostCSS / Tailwind config
├── eslint.config.mjs         # ESLint configuration
├── .gitignore
├── README.md
├── public/                   # Static assets (favicons, SVGs)
└── src/
    ├── app/
    │   ├── globals.css       # Global styles & Tailwind imports
    │   ├── layout.tsx        # Root layout (theme, fonts, metadata, force-dynamic)
    │   ├── page.tsx          # Home page (hero, featured, latest, trending)
    │   ├── loading.tsx       # Global loading skeleton (shimmer)
    │   ├── error.tsx         # Error boundary with reset
    │   ├── not-found.tsx     # Custom 404 page
    │   ├── favicon.ico
    │   ├── trending/
    │   │   └── page.tsx      # /trending
    │   ├── categories/
    │   │   └── page.tsx      # /categories
    │   ├── category/
    │   │   └── [slug]/
    │   │       └── page.tsx  # /category/:slug
    │   ├── actresses/
    │   │   └── page.tsx      # /actresses
    │   ├── actress/
    │   │   └── [slug]/
    │   │       └── page.tsx  # /actress/:slug
    │   ├── channels/
    │   │   └── page.tsx      # /channels
    │   ├── channel/
    │   │   └── [slug]/
    │   │       └── page.tsx  # /channel/:slug
    │   ├── search/
    │   │   └── page.tsx      # /search?q=query
    │   ├── video/
    │   │   └── [id]/
    │   │       └── [slug]/
    │   │           └── page.tsx  # /video/:id/:slug (player, metadata, related)
    │   └── api/              # ← All scraper endpoints (serverless on Vercel)
    │       ├── route.ts                  # API docs (GET /api)
    │       ├── main/route.ts             # GET /api/main?page=1
    │       ├── trending/route.ts         # GET /api/trending?page=1
    │       ├── categories/route.ts       # GET /api/categories
    │       ├── category/[slug]/route.ts  # GET /api/category/:slug?page=1
    │       ├── actresses/route.ts        # GET /api/actresses
    │       ├── actress/[slug]/route.ts   # GET /api/actress/:slug?page=1
    │       ├── channels/route.ts         # GET /api/channels
    │       ├── channel/[slug]/route.ts   # GET /api/channel/:slug?page=1
    │       ├── search/route.ts           # GET /api/search?q=query&page=1
    │       ├── video/[id]/route.ts       # GET /api/video/:id
    │       ├── video/[id]/[slug]/route.ts   # GET /api/video/:id/:slug
    │       ├── video/[id]/stream/route.ts   # GET /api/video/:id/stream
    │       ├── video/[id]/comments/route.ts # GET /api/video/:id/comments
    │       ├── video/[id]/download-link/route.ts  # GET /api/video/:id/download-link
    │       └── csrf-token/route.ts       # GET /api/csrf-token
    ├── components/
    │   ├── Navbar.tsx            # Sticky nav with scroll blur, mobile hamburger, search
    │   ├── Footer.tsx            # Links and branding
    │   ├── VideoCard.tsx         # Glassmorphism card with hover overlay & badges
    │   ├── PreviewVideo.tsx      # 'use client' mouse-enter preview playback
    │   ├── VideoPlayer.tsx       # Custom player: play/pause, volume, quality, fullscreen
    │   ├── VideoGrid.tsx         # Responsive grid with fade-in-up animations
    │   ├── Pagination.tsx        # 'use client' prev/next, page numbers, gradient active
    │   └── SectionHeader.tsx     # Gradient-text titles with optional "View All" link
    └── lib/
        ├── api.ts                # Centralized API client (fetch wrapper with ISR caching)
        ├── types.ts              # TypeScript interfaces (VideoResult, VideoDetail, etc.)
        └── scraper.ts            # Core scraping engine (TypeScript ESM, cheerio + axios)
```

---

## 📄 License

MIT © [zainaqdas](https://github.com/zainaqdas)

---

<p align="center">
  <sub>Built with ❤️ using Next.js, cheerio, and TypeScript</sub>
</p>
