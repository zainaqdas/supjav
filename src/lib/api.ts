import { unstable_cache } from 'next/cache';
import * as scraper from './scraper';
import type {
  VideoResult,
  VideoDetail,
  PaginatedResponse,
  CategoryListResponse,
  ActressListResponse,
  ChannelListResponse,
  SearchResponse,
  CategoryDetailResponse,
  ActressDetailResponse,
  ChannelDetailResponse,
} from './types';

// ============================================================
// API client — calls the scraper directly instead of making
// HTTP self-fetches to /api/*. This works reliably during SSR
// on Vercel where relative fetch URLs can't resolve.
// ============================================================

// Cache lifetimes for the underlying upstream scrape.
const REVALIDATE_LISTINGS = 3600; // 1h — listings & entity pages
const REVALIDATE_DETAIL = 300; // 5m — stream URLs are pre-signed, ~1h validity

/**
 * Wrap a scraper call in the Next data cache.
 *
 * Why this exists: every listing page reads `searchParams`, which opts the
 * route into dynamic rendering — and dynamic rendering ignores a page-level
 * `export const revalidate`. The previous setup therefore live-scraped the
 * source site on every single request (4 scrapes per homepage view) despite
 * `revalidate = 3600` appearing on all of those pages. Caching at the data
 * layer works regardless of the page's rendering mode.
 *
 * `unstable_cache` keys the entry by the function identity plus its
 * arguments, so each (path, page, sort) combination caches separately.
 */
function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyPrefix: string,
  revalidate: number
): (...args: A) => Promise<R> {
  return (...args: A) =>
    unstable_cache(() => fn(...args), [keyPrefix, ...args.map(String)], {
      revalidate,
    })();
}

// Video preview clips and streams are served from the upstream's own CDN
// hosts (…jav.si), not javtiful.com. Guard anyway so a host change can never
// start pushing multi-megabyte video files through the image proxy.
const VIDEO_EXT_RE = /\.(mp4|webm|m3u8|ts|mov|m4v|avi|mkv)(\?|#|$)/i;

function proxyImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (VIDEO_EXT_RE.test(url)) return url;
  // Proxy javtiful.com images through our API to avoid CORS/referer blocking
  if (url.includes('javtiful.com')) {
    return `/api/proxy/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function mapVideoResult(v: VideoResult): VideoResult {
  return {
    id: v.id,
    slug: v.slug,
    title: v.title,
    url: v.url || '',
    thumbnail: proxyImageUrl(v.thumbnail),
    previewVideo: proxyImageUrl(v.previewVideo),
    duration: v.duration,
    quality: v.quality,
    views: v.views,
    timeAgo: v.timeAgo,
    badges: v.badges,
  };
}

function mapVideoDetail(v: VideoDetail): VideoDetail {
  return {
    ...mapVideoResult(v),
    poster: proxyImageUrl(v.poster),
    description: v.description,
    keywords: v.keywords,
    videoCode: v.videoCode,
    releaseDate: v.releaseDate,
    qualityOptions: v.qualityOptions,
    defaultQuality: v.defaultQuality,
    streams: v.streams.map((s) => ({
      url: s.url || '',
      type: s.type || '',
      quality: s.quality || '',
    })),
    previewSources: v.previewSources,
    thumbnails: v.thumbnails.map((t) => proxyImageUrl(t) || t),
    actresses: v.actresses,
    tags: v.tags,
    endpoints: v.endpoints,
    related: v.related.map(mapVideoResult),
    comments: v.comments,
  };
}

/** Strip the volatile bits so listings all share one small mapping helper. */
function toListing<T extends PaginatedResponse<VideoResult>>(
  data: T
): PaginatedResponse<VideoResult> {
  return {
    source: data.source,
    page: data.page,
    totalPages: data.totalPages,
    totalResults: data.totalResults,
    videos: data.videos.map(mapVideoResult),
  };
}

// ---- Listings -------------------------------------------------------------

export const getMain = cached(
  (page: number, sort?: string) =>
    scraper.getMain(page, sort).then(toListing),
  'getMain',
  REVALIDATE_LISTINGS
);

export const getTrending = cached(
  (page: number, sort?: string) =>
    scraper.getTrending(page, sort).then(toListing),
  'getTrending',
  REVALIDATE_LISTINGS
);

export const getCensored = cached(
  (page: number, sort?: string) =>
    scraper.getCensored(page, sort).then(toListing),
  'getCensored',
  REVALIDATE_LISTINGS
);

export const getUncensored = cached(
  (page: number, sort?: string) =>
    scraper.getUncensored(page, sort).then(toListing),
  'getUncensored',
  REVALIDATE_LISTINGS
);

export const getReducingMosaic = cached(
  (page: number, sort?: string) =>
    scraper.getReducingMosaic(page, sort).then(toListing),
  'getReducingMosaic',
  REVALIDATE_LISTINGS
);

export const getVideos = cached(
  (page: number, sort?: string) =>
    scraper.getVideos(page, sort).then(toListing),
  'getVideos',
  REVALIDATE_LISTINGS
);

// ---- Categories -----------------------------------------------------------

export const getCategories = cached(
  () =>
    scraper.getCategories().then(
      (data): CategoryListResponse => ({
        source: data.source,
        totalCategories: data.totalCategories,
        categories: data.categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          videoCount: c.videoCount,
          url: c.url,
        })),
      })
    ),
  'getCategories',
  REVALIDATE_LISTINGS
);

export const getCategory = cached(
  (slug: string, page: number, sort?: string) =>
    scraper.getCategory(slug, page, sort).then(
      (data): CategoryDetailResponse => ({
        source: data.source,
        category: data.category,
        name: data.name,
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
        videos: data.videos.map(mapVideoResult),
      })
    ),
  'getCategory',
  REVALIDATE_LISTINGS
);

// ---- Actresses ------------------------------------------------------------

export const getActresses = cached(
  (page: number) =>
    scraper.getActresses(page).then(
      (data): ActressListResponse => ({
        source: data.source,
        totalActresses: data.totalActresses,
        actresses: data.actresses.map((a) => ({
          slug: a.slug,
          name: a.name,
          videoCount: a.videoCount,
          url: a.url,
        })),
        page: data.page,
        totalPages: data.totalPages,
      })
    ),
  'getActresses',
  REVALIDATE_LISTINGS
);

export const getActress = cached(
  (slug: string, page: number, sort?: string) =>
    scraper.getActress(slug, page, sort).then(
      (data): ActressDetailResponse => ({
        source: data.source,
        actress: data.actress,
        name: data.name,
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
        videos: data.videos.map(mapVideoResult),
      })
    ),
  'getActress',
  REVALIDATE_LISTINGS
);

// ---- Channels -------------------------------------------------------------

export const getChannels = cached(
  (page: number) =>
    scraper.getChannels(page).then(
      (data): ChannelListResponse => ({
        source: data.source,
        totalChannels: data.totalChannels,
        channels: data.channels.map((c) => ({
          slug: c.slug,
          name: c.name,
          videoCount: c.videoCount,
          url: c.url,
        })),
        page: data.page,
        totalPages: data.totalPages,
      })
    ),
  'getChannels',
  REVALIDATE_LISTINGS
);

export const getChannel = cached(
  (slug: string, page: number, sort?: string) =>
    scraper.getChannel(slug, page, sort).then(
      (data): ChannelDetailResponse => ({
        source: data.source,
        channel: data.channel,
        name: data.name,
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
        videos: data.videos.map(mapVideoResult),
      })
    ),
  'getChannel',
  REVALIDATE_LISTINGS
);

// ---- Search ---------------------------------------------------------------

export const search = cached(
  (query: string, page: number) =>
    scraper.search(query, page).then(
      (data): SearchResponse => ({
        source: data.source,
        query: data.query,
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
        videos: data.videos.map(mapVideoResult),
      })
    ),
  'search',
  REVALIDATE_LISTINGS
);

// ---- Video detail ---------------------------------------------------------

export const getVideoDetail = cached(
  (id: string, slug?: string) =>
    scraper.getVideoDetail(id, slug).then(mapVideoDetail),
  'getVideoDetail',
  REVALIDATE_DETAIL
);