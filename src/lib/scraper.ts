import axios from "axios";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

const BASE_URL = "https://javtiful.com";

// Common axios instance with browser-like headers
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

// ============================================================
// TYPES — canonical definitions live in ./types
// ============================================================
import type {
  VideoResult,
  VideoStream,
  VideoDetail,
  PaginatedResponse,
  Category,
  ActressItem,
  ChannelItem,
  Comment,
} from "./types";

// ============================================================
// HELPER: Parse a listing page (main, trending, search, etc.)
// ============================================================
function parseVideoCards(
  $: cheerio.CheerioAPI,
  scope?: cheerio.Cheerio<AnyNode>
): VideoResult[] {
  const videos: VideoResult[] = [];

  // Find all video cards - they use <article class="front-video-card">
  // (optionally scoped to a container, e.g. the related-videos grid)
  const root = scope || $.root();
  root.find(".front-video-card").each((_i, el) => {
    const card = $(el);

    // Title: specifically the .front-video-title link inside the card body
    const titleEl = card.find(".front-video-card-body .front-video-title").first();
    const href = titleEl.attr("href") || "";
    const title = titleEl.text().trim();

    // Parse ID and slug from href: /video/{id}/{slug}
    const urlMatch = href.match(/\/video\/(\d+)\/([^/]+)/);
    const id = urlMatch ? urlMatch[1] : "";
    const slug = urlMatch ? urlMatch[2] : "";

    // Thumbnail - from data-front-lazy-src on img
    const imgEl = card.find(".front-video-thumb img, img").first();
    const thumbnail =
      imgEl.attr("data-front-lazy-src") ||
      imgEl.attr("data-src") ||
      imgEl.attr("src") ||
      "";

    // Duration - from .front-duration-tag
    const duration = card.find(".front-duration-tag").first().text().trim();

    // Quality - from .front-quality-tag
    const quality = card.find(".front-quality-tag").first().text().trim();

    // Views - from .front-video-stat
    const views = card.find(".front-video-stat").first().text().trim();

    // Time ago - from .front-video-meta span
    const metaSpans = card.find(".front-video-meta span");
    let timeAgo = "";
    metaSpans.each((_, span) => {
      const text = $(span).text().trim();
      if (
        text &&
        !$(span).hasClass("front-video-stat") &&
        text !== "\u2022" &&
        text !== "•"
      ) {
        timeAgo = text;
        return false;
      }
    });

    // Badges
    const badges: string[] = [];
    card.find(".front-video-overlay span, .front-quality-tag").each((_, badge) => {
      const text = $(badge).text().trim();
      if (text && text !== duration && text !== quality) {
        badges.push(text);
      }
    });

    // Preview video URL
    const previewSrc =
      card
        .find("[data-front-video-preview-src]")
        .first()
        .attr("data-front-video-preview-src") || "";

    // Filter out ad cards
    if (id && title && href.includes("/video/")) {
      videos.push({
        id,
        slug,
        title,
        url: href ? `${BASE_URL}${href}` : null,
        thumbnail: thumbnail.startsWith("http")
          ? thumbnail
          : thumbnail
            ? `${BASE_URL}${thumbnail}`
            : null,
        previewVideo: previewSrc || null,
        duration: duration || null,
        quality: quality || null,
        views: views || null,
        timeAgo: timeAgo || null,
        badges: badges.length > 0 ? badges : null,
      });
    }
  });

  // Fallback: broader matching
  if (videos.length === 0) {
    root.find(".front-video-title").each((i, el) => {
      if (i >= 50) return false;
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      const urlMatch = href.match(/\/video\/(\d+)\/([^/]+)/);
      if (urlMatch && text.length > 5) {
        videos.push({
          id: urlMatch[1],
          slug: urlMatch[2],
          title: text,
          url: `${BASE_URL}${href}`,
          thumbnail: null,
          previewVideo: null,
          duration: null,
          quality: null,
          views: null,
          timeAgo: null,
          badges: null,
        });
      }
    });
  }

  return videos;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  nextPage: string | null;
  prevPage: string | null;
  /** False when the Next link carries .is-disabled (we're on the true last page). */
  hasNext: boolean;
}

function parsePagination($: cheerio.CheerioAPI): PaginationInfo {
  const pagination: PaginationInfo = {
    currentPage: 1,
    totalPages: 1,
    nextPage: null,
    prevPage: null,
    hasNext: false,
  };

  // Current site markup: .front-pagination-link (current page has .is-active)
  const activeLink = $(".front-pagination-link.is-active");
  if (activeLink.length) {
    const activeHref = activeLink.attr("href") || "";
    const hrefMatch = activeHref.match(/[?&]page=(\d+)/);
    if (hrefMatch) {
      pagination.currentPage = parseInt(hrefMatch[1]);
    } else {
      const activeText = parseInt(activeLink.text().trim());
      if (!isNaN(activeText)) pagination.currentPage = activeText;
    }
  }

  // Total pages: the highest page number found across all pagination links.
  $(
    ".front-pagination-link, .pagination .page-item, .pagination a, [class*=\"pagination\"] a"
  ).each((_, el) => {
    const href = $(el).attr("href") || "";
    const hrefMatch = href.match(/[?&]page=(\d+)/);
    const num = hrefMatch
      ? parseInt(hrefMatch[1])
      : parseInt($(el).text().trim());
    if (!isNaN(num) && num > pagination.totalPages) {
      pagination.totalPages = num;
    }
  });

  // Next/Previous: the site renders them as .front-pagination-link with the
  // text "Next"/"Previous", adding .is-disabled on the first/last page.
  $(".front-pagination-link").each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    const href = $(el).attr("href") || "";
    const disabled = $(el).hasClass("is-disabled");
    if (text === "next") {
      pagination.hasNext = !disabled;
      if (!disabled) pagination.nextPage = href;
    } else if (text === "previous" && !disabled) {
      pagination.prevPage = href;
    }
  });

  return pagination;
}

// Estimate the total number of results across all pages. The source site
// does not expose a total count on every listing, so we derive one from the
// page size and page count: exact on the last page, a full-page estimate
// otherwise.
function estimateTotalResults(
  currentPage: number,
  totalPages: number,
  perPage: number,
  currentCount: number
): number {
  if (totalPages <= 1) return currentCount;
  if (currentPage >= totalPages) {
    // Last page: exact (final page may be partial)
    return (totalPages - 1) * perPage + currentCount;
  }
  // Earlier page: assume all remaining pages are full
  return totalPages * perPage;
}

// ============================================================
// HELPER: Build URL with optional page and sort params
// ============================================================
function buildUrl(basePath: string, page: number, sort?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// Extract the real entity name from the detail page h1, e.g.
// "Hamasaki Mao JAV Videos - Latest HD Updates" -> "Hamasaki Mao".
// Falls back to the slug when the page exposes no parseable h1.
function parseDetailName($: cheerio.CheerioAPI, fallback: string): string {
  const h1 = $("h1").first().text().trim();
  const match = h1.match(/^(.+?)\s+JAV Videos/i);
  return match ? match[1].trim() : fallback;
}

// ============================================================
// VIDEO LISTINGS: main, trending, censored, uncensored,
// reducing-mosaic all share the same markup — only the path
// and source label differ.
// ============================================================
async function getVideoListing<
  T extends Record<string, unknown> = Record<string, unknown>
>(
  path: string,
  source: string,
  page = 1,
  sort?: string,
  extra?: ($: cheerio.CheerioAPI, page: number) => T
): Promise<PaginatedResponse<VideoResult> & T> {
  const url = buildUrl(path, page, sort);
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);
  const perPage = $(".front-video-card").length || 24;

  // Video listings render a sliding window of page links (current ± a few),
  // so the highest link is not the true last page. The Next link carries
  // .is-disabled only on the real last page — use it so we never invent a
  // phantom page past the end. (Actress/channel widgets embed the real last
  // page, so parsed totalPages already exceeds `page` there and this is a
  // no-op.)
  if (videos.length > 0 && pagination.totalPages <= page) {
    pagination.totalPages = pagination.hasNext ? page + 1 : page;
  } else if (videos.length === 0 && pagination.totalPages <= page) {
    // We've gone past the last page. Show current page as the last one.
    pagination.totalPages = page;
  }

  const listing: PaginatedResponse<VideoResult> & T = {
    source,
    page,
    totalPages: pagination.totalPages,
    totalResults: estimateTotalResults(
      pagination.currentPage || page,
      pagination.totalPages,
      perPage,
      videos.length
    ),
    videos,
    ...(extra ? extra($, page) : ({} as T)),
  };
  return listing;
}

export function getMain(page = 1, sort?: string) {
  return getVideoListing("/main", "main", page, sort);
}

export function getTrending(page = 1, sort?: string) {
  return getVideoListing("/trending", "trending", page, sort);
}

export function getCensored(page = 1, sort?: string) {
  return getVideoListing("/censored", "censored", page, sort);
}

export function getUncensored(page = 1, sort?: string) {
  return getVideoListing("/uncensored", "uncensored", page, sort);
}

export function getReducingMosaic(page = 1, sort?: string) {
  return getVideoListing("/reducing-mosaic", "reducing-mosaic", page, sort);
}

// Latest JAV Videos listing — the source's real paginated, sortable archive.
export function getVideos(page = 1, sort?: string) {
  return getVideoListing("/videos", "videos", page, sort);
}

// ============================================================
// HELPER: Format an ISO-8601 duration ("PT2H6M39S") like the
// site's card tags ("02:06:39")
// ============================================================
function formatIsoDuration(value: string): string | null {
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const h = match[1] ? parseInt(match[1]) : 0;
  const m = match[2] ? parseInt(match[2]) : 0;
  const s = match[3] ? parseInt(match[3]) : 0;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// ============================================================
// HELPER: Format a raw view count like the site does ("214.6K")
// ============================================================
function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

// ============================================================
// HELPER: Parse the JSON-LD VideoObject block for structured
// metadata the HTML doesn't show (duration, views, embed URL)
// ============================================================
function parseVideoLd($: cheerio.CheerioAPI): {
  duration: string | null;
  views: number | null;
  embedUrl: string | null;
} {
  const result = { duration: null, views: null, embedUrl: null } as {
    duration: string | null;
    views: number | null;
    embedUrl: string | null;
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || "{}");
      if (parsed && parsed["@type"] === "VideoObject") {
        if (typeof parsed.duration === "string") result.duration = parsed.duration;
        const stat = parsed.interactionStatistic;
        if (
          stat &&
          typeof stat.userInteractionCount === "number"
        ) {
          result.views = stat.userInteractionCount;
        }
        if (typeof parsed.embedUrl === "string") result.embedUrl = parsed.embedUrl;
        return false;
      }
    } catch {
      // ignore malformed JSON-LD
    }
  });
  return result;
}

// ============================================================
// HELPER: Parse comment cards. The watch page server-renders
// the thread (or an empty state); each comment is
// <article class="front-comment-card"> with .front-comment-meta
// > strong (author), time[datetime], and .front-comment-body.
// ============================================================
function parseCommentCards(
  $: cheerio.CheerioAPI,
  root: cheerio.Cheerio<AnyNode>
): Comment[] {
  const comments: Comment[] = [];
  root.children(".front-comment-card").each((_, el) => {
    const card = $(el);
    comments.push({
      id: card.attr("data-comment-id") || "",
      author:
        card.find(".front-comment-meta > strong").first().text().trim() ||
        card.find(".front-comment-head strong").first().text().trim() ||
        "Member",
      content: card.find(".front-comment-body").first().text().trim(),
      date:
        card.find("time").first().attr("datetime") ||
        card.find("time").first().text().trim() ||
        null,
      children: parseCommentCards($, card.children(".front-comment-children")),
    });
  });
  return comments;
}

function parseComments($: cheerio.CheerioAPI): Comment[] {
  const thread = $("[data-front-comment-thread]").first();
  if (!thread.length) return [];
  return parseCommentCards($, thread);
}

// ============================================================
// CATEGORIES: List all categories
// ============================================================
export async function getCategories(): Promise<{
  source: string;
  totalCategories: number;
  categories: Category[];
}> {
  const { data } = await client.get("/categories");
  const $ = cheerio.load(data);

  const categories: Category[] = [];
  $('a[href*="/category/"]').each((_i, el) => {
    const href = $(el).attr("href") || "";
    const name = $(el).text().trim();
    const match = href.match(/\/category\/([^/]+)/);
    if (match && name) {
      const existing = categories.find((c) => c.slug === match[1]);
      if (!existing) {
        const parent = $(el).parent();
        const countText = parent.text().trim();
        const countMatch = countText.match(/(\d+)\s*Videos?/i);

        categories.push({
          slug: match[1],
          name: name.replace(/\d+\s*Videos?/i, "").trim(),
          videoCount: countMatch ? parseInt(countMatch[1]) : null,
          url: `${BASE_URL}${href}`,
        });
      }
    }
  });

  return {
    source: "categories",
    totalCategories: categories.length,
    categories,
  };
}

// ============================================================
// CATEGORY DETAIL
// ============================================================
export async function getCategory(
  slug: string,
  page = 1,
  sort?: string
): Promise<PaginatedResponse<VideoResult> & { category: string; name: string }> {
  return getVideoListing(`/category/${slug}`, "category", page, sort, ($) => ({
    category: slug,
    name: parseDetailName($, slug),
  }));
}

// ============================================================
// HELPER: Parse max page from front-pagination-link links
// ============================================================
function parseListMaxPage($: cheerio.CheerioAPI): number {
  let maxPage = 1;
  $(".front-pagination-link").each((_i, el) => {
    const href = $(el).attr("href") || "";
    const pageMatch = href.match(/[?&]page=(\d+)/);
    if (pageMatch) {
      const num = parseInt(pageMatch[1]);
      if (num > maxPage) maxPage = num;
    }
  });
  return maxPage;
}

// ============================================================
// HELPER: Parse actress items from a page
// ============================================================
function parseActressItems($: cheerio.CheerioAPI): ActressItem[] {
  const items: ActressItem[] = [];
  $('a[href*="/actress/"]').each((_i, el) => {
    const href = $(el).attr("href") || "";
    const name = $(el).text().trim();
    const match = href.match(/\/actress\/([^/]+)/);
    if (match && name) {
      const existing = items.find((a) => a.slug === match[1]);
      if (!existing) {
        const parent = $(el).parent();
        const countText = parent.text().trim();
        const countMatch = countText.match(/(\d+)\s*Videos?/i);
        items.push({
          slug: match[1],
          name: name.replace(/\d+\s*Videos?/i, "").trim(),
          videoCount: countMatch ? parseInt(countMatch[1]) : null,
          url: `${BASE_URL}${href}`,
        });
      }
    }
  });
  return items;
}

// ============================================================
// ACTRESSES: List actresses (paginated, one page at a time)
// ============================================================
export async function getActresses(
  page = 1
): Promise<{
  source: string;
  totalActresses: number;
  actresses: ActressItem[];
  page: number;
  totalPages: number;
}> {
  const url = page > 1 ? `/actresses?page=${page}` : "/actresses";
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const actresses = parseActressItems($);
  const totalPages = parseListMaxPage($);
  const perPage = actresses.length || 24;

  return {
    source: "actresses",
    totalActresses: estimateTotalResults(
      page,
      totalPages,
      perPage,
      actresses.length
    ),
    actresses,
    page,
    totalPages,
  };
}

// ============================================================
// ACTRESS DETAIL
// ============================================================
export async function getActress(
  slug: string,
  page = 1,
  sort?: string
): Promise<PaginatedResponse<VideoResult> & { actress: string; name: string }> {
  return getVideoListing(`/actress/${slug}`, "actress", page, sort, ($) => ({
    actress: slug,
    name: parseDetailName($, slug),
  }));
}

// ============================================================
// HELPER: Parse channel items from a page
// ============================================================
function parseChannelItems($: cheerio.CheerioAPI): ChannelItem[] {
  const items: ChannelItem[] = [];
  $('a[href*="/channel/"]').each((_i, el) => {
    const href = $(el).attr("href") || "";
    const name = $(el).text().trim();
    const match = href.match(/\/channel\/([^/]+)/);
    if (match && name) {
      const existing = items.find((c) => c.slug === match[1]);
      if (!existing) {
        const parent = $(el).parent();
        const countText = parent.text().trim();
        const countMatch = countText.match(/(\d+)\s*Videos?/i);
        items.push({
          slug: match[1],
          name: name.replace(/\d+\s*Videos?/i, "").trim(),
          videoCount: countMatch ? parseInt(countMatch[1]) : null,
          url: `${BASE_URL}${href}`,
        });
      }
    }
  });
  return items;
}

// ============================================================
// CHANNELS: List channels (paginated, one page at a time)
// ============================================================
export async function getChannels(
  page = 1
): Promise<{
  source: string;
  totalChannels: number;
  channels: ChannelItem[];
  page: number;
  totalPages: number;
}> {
  const url = page > 1 ? `/channels?page=${page}` : "/channels";
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const channels = parseChannelItems($);
  const totalPages = parseListMaxPage($);
  const perPage = channels.length || 24;

  return {
    source: "channels",
    totalChannels: estimateTotalResults(
      page,
      totalPages,
      perPage,
      channels.length
    ),
    channels,
    page,
    totalPages,
  };
}

// ============================================================
// CHANNEL DETAIL
// ============================================================
export async function getChannel(
  slug: string,
  page = 1,
  sort?: string
): Promise<PaginatedResponse<VideoResult> & { channel: string; name: string }> {
  return getVideoListing(`/channel/${slug}`, "channel", page, sort, ($) => ({
    channel: slug,
    name: parseDetailName($, slug),
  }));
}

// ============================================================
// SEARCH
// ============================================================
export async function search(
  query: string,
  page = 1
): Promise<PaginatedResponse<VideoResult> & { query: string }> {
  const url =
    page > 1
      ? `/search?q=${encodeURIComponent(query)}&page=${page}`
      : `/search?q=${encodeURIComponent(query)}`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);
  const perPage = $(".front-video-card").length || 24;

  return {
    source: "search",
    query,
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: estimateTotalResults(
      pagination.currentPage || page,
      pagination.totalPages,
      perPage,
      videos.length
    ),
    videos,
  };
}

// ============================================================
// VIDEO DETAIL: Full video info including stream URLs
// ============================================================
export async function getVideoDetail(
  id: string,
  slug?: string
): Promise<VideoDetail> {
  let data: string;
  if (slug) {
    const res = await client.get(`/video/${id}/${slug}`);
    data = res.data;
  } else {
    // The source 301-redirects /video/{id} to /video/{id}/{slug}; axios
    // follows it and returns the watch page. Derive the slug from the page's
    // canonical URL. The old search-based fallback failed because numeric-only
    // search queries return no results — which broke /api/video/:id and
    // /api/video/:id/stream with "Cannot find video slug".
    try {
      const res = await client.get(`/video/${id}`);
      data = res.data;
      const page$ = cheerio.load(data);
      const canonical =
        page$('link[rel="canonical"]').attr("href") ||
        page$('meta[property="og:url"]').attr("content") ||
        "";
      const slugMatch = canonical.match(/\/video\/\d+\/([^/?#]+)/);
      if (slugMatch) {
        slug = slugMatch[1];
      } else {
        throw new Error(
          "Cannot find video slug. Please provide both id and slug (e.g., /api/video/108365/hrsm-146)"
        );
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Cannot find")) throw e;
      throw new Error(`Video /video/${id} not found.`);
    }
  }

  const $ = cheerio.load(data);

  // Extract the frontWatchConfig JSON blob
  const configScript = $("#frontWatchConfig").html();
  let config: Record<string, unknown> = {};
  if (configScript) {
    try {
      config = JSON.parse(configScript);
    } catch {
      const allScripts = $('script[type="application/json"]');
      allScripts.each((_, el) => {
        try {
          const parsed = JSON.parse($(el).html() || "{}");
          if (parsed.playerSources || parsed.videoTitle) {
            config = parsed;
            return false;
          }
        } catch {
          // ignore
        }
      });
    }
  }

  // Parse stream sources
  const playerSources = (config.playerSources as Array<Record<string, unknown>>) || [];
  const streams: VideoStream[] = playerSources.map((source) => ({
    url: (source.src as string) || null,
    type: (source.type as string) || null,
    quality: source.size ? `${source.size}p` : null,
  }));

  // Structured metadata from the JSON-LD VideoObject + visible page
  const ld = parseVideoLd($);
  const watchViews = $(".front-watch-views").first().text().trim();
  const watchTime = $("time[data-front-local-datetime]").first();

  // Extract metadata
  const metaDescription = $('meta[name="description"]').attr("content") || "";
  const metaKeywords = $('meta[name="keywords"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const publishedTime =
    $('meta[property="article:published_time"]').attr("content") || "";

  const description = $(".front-watch-detail [class*=\"description\"], [class*=\"description\"], .video-description")
    .first()
    .text()
    .trim();
  const releaseDate =
    watchTime.attr("datetime") ||
    watchTime.text().trim() ||
    publishedTime ||
    "";

  // Related tags/categories
  const tags: { type: string; slug: string; name: string }[] = [];
  $('a[href*="/category/"], a[href*="/tag/"]').each((_, el) => {
    const tagHref = $(el).attr("href") || "";
    const tagName = $(el).text().trim();
    const tagMatch = tagHref.match(/\/(category|tag)\/([^/]+)/);
    if (tagMatch && tagName) {
      tags.push({
        type: tagMatch[1],
        slug: tagMatch[2],
        name: tagName,
      });
    }
  });

  // Related actresses
  const actresses: { slug: string; name: string }[] = [];
  $('a[href*="/actress/"]').each((_, el) => {
    const aHref = $(el).attr("href") || "";
    const aName = $(el).text().trim();
    const aMatch = aHref.match(/\/actress\/([^/]+)/);
    if (aMatch && aName) {
      actresses.push({
        slug: aMatch[1],
        name: aName,
      });
    }
  });

  // Extract preview thumbnail URLs. The related-videos grids also carry
  // data-front-video-preview-src / data-front-lazy-src, so exclude them —
  // otherwise previewVideo and the screenshot gallery show *other* videos.
  const isInRelatedGrid = (el: AnyNode) =>
    $(el).parents(".front-video-grid, .front-video-grid-related").length > 0;

  const previewSources: string[] = [];
  $("[data-front-video-preview-src]").each((_, el) => {
    if (isInRelatedGrid(el)) return;
    const src = $(el).attr("data-front-video-preview-src");
    if (src) previewSources.push(src);
  });

  // Extract all thumbnail images
  const thumbnails: string[] = [];
  $("[data-front-lazy-src], [data-front-lazy-fallback-src]").each((_, el) => {
    if (isInRelatedGrid(el)) return;
    const src =
      $(el).attr("data-front-lazy-src") ||
      $(el).attr("data-front-lazy-fallback-src");
    if (src) {
      src.split("|").forEach((s) => {
        const trimmed = s.trim();
        if (trimmed && !thumbnails.includes(trimmed)) {
          thumbnails.push(
            trimmed.startsWith("http") ? trimmed : `${BASE_URL}${trimmed}`
          );
        }
      });
    }
  });

  const title =
    (config.videoTitle as string) ||
    $("title").text().split("|")[0].trim() ||
    "";

  // Video code: prefer a leading "ABC-123" token in the title, then
  // a dedicated element. The broad [class*="code"] selector previously
  // matched obfuscated script text.
  const codeFromTitle = title.trim().match(/^([A-Z0-9]+-\d+)/);
  const videoCode =
    (codeFromTitle && codeFromTitle[1]) ||
    $('[class*="video-code"]').first().text().trim() ||
    null;

  // Related videos: "More from These Actresses" section + sidebar grid
  const related: VideoResult[] = [];
  $(".front-video-grid, .front-video-grid-related").each((_, el) => {
    related.push(...parseVideoCards($, $(el)));
  });
  const relatedSeen = new Set<string>();
  const dedupedRelated = related.filter((v) => {
    if (relatedSeen.has(v.id)) return false;
    relatedSeen.add(v.id);
    return true;
  });

  const comments = parseComments($);

  // Real action endpoints exposed by the page via data-*endpoint attrs.
  // Prefer the DOM values so we stay correct if the site changes them.
  const pageEndpoint = (needle: string): string | null => {
    let found: string | null = null;
    $("[data-endpoint], [data-download-endpoint]").each((_, el) => {
      const val =
        $(el).attr("data-endpoint") || $(el).attr("data-download-endpoint") || "";
      if (val && val.includes(needle) && found === null) found = val;
    });
    return found;
  };

  const computedSlug =
    slug ||
    (config.videoTitle
      ? (config.videoTitle as string)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : "");

  return {
    // VideoResult fields
    id: String(id),
    slug: computedSlug,
    title,
    url: `${BASE_URL}/video/${id}/${computedSlug}`,
    thumbnail: thumbnails.length > 0 ? thumbnails[0] : null,
    previewVideo: previewSources.length > 0 ? previewSources[0] : null,
    duration: ld.duration ? formatIsoDuration(ld.duration) : null,
    quality: typeof config.defaultQuality === "number"
      ? `${config.defaultQuality}p`
      : null,
    views: watchViews.replace(/\s*views?$/i, "").trim() ||
      (ld.views !== null ? formatViewCount(ld.views) : null),
    timeAgo: null,
    badges: null,
    // VideoDetail extension fields
    poster: config.videoPoster
      ? (config.videoPoster as string).startsWith("http")
        ? (config.videoPoster as string)
        : `${BASE_URL}${config.videoPoster}`
      : ogImage || null,
    description: description || metaDescription || null,
    keywords: metaKeywords ? metaKeywords.split(",").map((k) => k.trim()) : [],
    videoCode: videoCode || null,
    releaseDate: releaseDate || publishedTime || null,
    qualityOptions: (config.qualityOptions as number[]) || [],
    defaultQuality: (config.defaultQuality as number) || null,
    streams,
    previewSources,
    thumbnails,
    actresses,
    tags,
    endpoints: {
      comments:
        (config.commentsEndpoint as string) || `/video/${id}/comments`,
      playlist:
        ((config.playlist as { endpoint?: string })?.endpoint) ||
        `/video/${id}/playlist`,
      downloadLink:
        pageEndpoint("download-link") || `/video/${id}/download-link`,
      favorite: pageEndpoint("/favorite") || `/video/${id}/favorite`,
      report: pageEndpoint("/report") || `/video/${id}/report`,
      react: pageEndpoint("/react") || `/video/${id}/react`,
      embed: ld.embedUrl || `${BASE_URL}/embed/${id}`,
    },
    related: dedupedRelated,
    comments,
  };
}

// ============================================================
// COMMENTS
// ============================================================
export async function getComments(
  videoId: string,
  slug?: string
): Promise<Record<string, unknown>> {
  try {
    // The /video/{id}/comments endpoint 301-redirects to the watch page;
    // axios follows it and we parse the server-rendered thread from there.
    const url = slug
      ? `/video/${videoId}/${slug}`
      : `/video/${videoId}/comments`;
    const { data } = await client.get(url, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
      },
      maxRedirects: 5,
    });

    // Some requests may return real JSON (comments payload)
    if (typeof data === "object" && data !== null && !Buffer.isBuffer(data)) {
      return data;
    }

    const $ = cheerio.load(data);
    const comments = parseComments($);
    return { videoId, comments, total: comments.length };
  } catch {
    return { videoId, error: "Failed to fetch comments", comments: [] };
  }
}

// ============================================================
// CSRF TOKEN
// ============================================================
export async function getCsrfToken(): Promise<Record<string, unknown>> {
  try {
    const { data } = await client.get("/csrf-token", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
      },
    });
    return data;
  } catch {
    return { error: "Failed to get CSRF token" };
  }
}

// ============================================================
// DOWNLOAD LINK
// ============================================================
export async function getDownloadLink(
  videoId: string,
  csrfToken?: string
): Promise<Record<string, unknown>> {
  try {
    const headers: Record<string, string> = {
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    const response = await client.post(
      `/video/${videoId}/download-link`,
      {},
      { headers }
    );
    if (typeof response.data === "object") {
      return response.data;
    }
    return { success: false, message: "Unexpected response format" };
  } catch (err) {
    return {
      success: false,
      message: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
