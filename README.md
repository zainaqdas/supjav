<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TS">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

<h1 align="center">
  Supjav — JAV Streaming Platform
</h1>

<p align="center">
  A full-stack streaming website with a <strong>Node.js/Express scraper API</strong> and a
  <strong>Next.js 16 + TypeScript frontend</strong> featuring a sleek red & blue glassmorphism design.
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

```
┌─────────────────────┐       ┌──────────────────────┐
│  Next.js 16 + TS    │──────▶│   Node.js/Express    │
│  frontend (:3001)   │  HTTP │   scraper (:3000)    │
│                     │◀──────│                      │
│  SSR + ISR pages    │  JSON │   cheerio + axios    │
└─────────────────────┘       └──────────┬───────────┘
                                         │
                                         ▼
                                  ┌──────────────────┐
                                  │   javtiful.com   │
                                  │   (source site)  │
                                  └──────────────────┘
```

- **Scraper API** parses HTML from javtiful.com using cheerio, extracting video metadata, categories, actresses, channels, and **stream URLs** (Cloudflare R2 pre-signed).
- **Frontend** fetches the scraper API at build time (SSR/ISR with 60s revalidation), renders pages on the server, and hydrates with a custom video player for `.mp4` / `.m3u8` playback.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+

### 1. Clone

```bash
git clone https://github.com/zainaqdas/supjav.git
cd supjav
```

### 2. Install dependencies

```bash
# Scraper API
npm install

# Frontend
cd frontend && npm install && cd ..
```

### 3. Start the scraper API

```bash
npm start
# → Runs on http://localhost:3000
```

### 4. Start the frontend (in another terminal)

```bash
cd frontend
npm run dev
# → Runs on http://localhost:3001
```

### 5. Open in browser

```
http://localhost:3001
```

> **Note:** The frontend expects the scraper API at `http://localhost:3000/api`. You can override this with the `NEXT_PUBLIC_API_URL` environment variable (see [Environment Variables](#-environment-variables)).

---

## 🔌 Scraper API

A lightweight Express server that scrapes javtiful.com and exposes a clean JSON REST API.

**Base URL:** `http://localhost:3000`

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
| `/` | API documentation — lists all endpoints and query parameters |

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

### Scraper API (`.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server listen port |

### Frontend (`.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | Base URL for the scraper API |

---

## 🛠 Tech Stack

### Scraper API

- **[Express](https://expressjs.com/)** — HTTP server & routing
- **[axios](https://axios-http.com/)** — HTTP client with browser-like headers
- **[cheerio](https://cheerio.js.org/)** — jQuery-style HTML parsing

### Frontend

- **[Next.js 16](https://nextjs.org/)** — React framework with SSR, ISR, App Router
- **[React 19](https://react.dev/)** — UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** — Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS
- **[hls.js](https://github.com/video-dev/hls.js/)** — HLS stream playback (optional, for m3u8)

---

## 📁 Project Structure

```
supjav/
├── package.json              # Scraper API dependencies & scripts
├── src/
│   ├── server.js             # Express server with 16 routes
│   └── scraper.js            # Core scraping engine (cheerio + axios)
├── frontend/
│   ├── package.json          # Frontend dependencies & scripts
│   ├── next.config.js
│   └── src/
│       ├── app/              # Next.js App Router pages
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
│       │   └── video/[id]/[slug]/
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
│           ├── api.ts        # Centralized API client (all fetch calls)
│           └── types.ts      # TypeScript type definitions
└── README.md
```

---

## 📄 License

MIT © [zainaqdas](https://github.com/zainaqdas)

---

<p align="center">
  <sub>Built with ❤️ using Next.js, Express, and cheerio</sub>
</p>
