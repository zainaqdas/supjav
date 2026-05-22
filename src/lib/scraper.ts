import axios from "axios";
import * as cheerio from "cheerio";

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
// TYPES
// ============================================================

export interface VideoResult {
  id: string;
  slug: string;
  title: string;
  url: string | null;
  thumbnail: string | null;
  previewVideo: string | null;
  duration: string | null;
  quality: string | null;
  views: string | null;
  timeAgo: string | null;
  badges: string[] | null;
}

export interface VideoStream {
  url: string | null;
  type: string | null;
  quality: string | null;
}

export interface VideoDetail extends VideoResult {
  poster: string | null;
  description: string | null;
  keywords: string[];
  videoCode: string | null;
  releaseDate: string | null;
  qualityOptions: number[];
  defaultQuality: number | null;
  streams: VideoStream[];
  previewSources: string[];
  thumbnails: string[];
  actresses: { slug: string; name: string }[];
  tags: { type: string; slug: string; name: string }[];
  endpoints: {
    comments: string;
    playlist: string;
    downloadLink: string;
    favorite: string;
    report: string;
  };
}

export interface PaginatedResponse<T> {
  source: string;
  page: number;
  totalPages: number;
  totalResults: number;
  videos: T[];
}

export interface CategoryItem {
  slug: string;
  name: string;
  videoCount: number | null;
  url: string;
}

export interface ActressItem {
  slug: string;
  name: string;
  videoCount: number | null;
  url: string;
}

export interface ChannelItem {
  slug: string;
  name: string;
  videoCount: number | null;
  url: string;
}

// ============================================================
// HELPER: Parse a listing page (main, trending, search, etc.)
// ============================================================
function parseVideoCards($: cheerio.CheerioAPI): VideoResult[] {
  const videos: VideoResult[] = [];

  // Find all video cards - they use <article class="front-video-card">
  $(".front-video-card").each((_i, el) => {
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
    $(".front-video-title").each((i, el) => {
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
}

function parsePagination($: cheerio.CheerioAPI): PaginationInfo {
  const pagination: PaginationInfo = {
    currentPage: 1,
    totalPages: 1,
    nextPage: null,
    prevPage: null,
  };

  const activePage = $(
    '.pagination .active, .page-item.active, [class*="pagination"] .active'
  );
  if (activePage.length) {
    pagination.currentPage = parseInt(activePage.text().trim()) || 1;
  }

  const pageItems = $(
    '.pagination .page-item, .pagination a, [class*="pagination"] a'
  );
  const pageNumbers: number[] = [];
  pageItems.each((_, el) => {
    const num = parseInt($(el).text().trim());
    if (!isNaN(num)) pageNumbers.push(num);
  });
  if (pageNumbers.length > 0) {
    pagination.totalPages = Math.max(...pageNumbers);
  }

  const nextLink = $(
    '.pagination .next a, .pagination [rel="next"], a[rel="next"]'
  ).attr("href");
  const prevLink = $(
    '.pagination .prev a, .pagination [rel="prev"], a[rel="prev"]'
  ).attr("href");
  if (nextLink) pagination.nextPage = nextLink;
  if (prevLink) pagination.prevPage = prevLink;

  return pagination;
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

// ============================================================
// MAIN PAGE: Latest videos
// ============================================================
export async function getMain(
  page = 1,
  sort?: string
): Promise<PaginatedResponse<VideoResult>> {
  const url = buildUrl("/main", page, sort);
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  // Source may only render a few page links even when more pages exist.
  // If this page has videos, assume there's at least a next page.
  if (videos.length > 0 && pagination.totalPages <= page) {
    pagination.totalPages = page + 1;
  } else if (videos.length === 0 && pagination.totalPages <= page) {
    // We've gone past the last page. Show current page as the last one.
    pagination.totalPages = page;
  }

  return {
    source: "main",
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// TRENDING: Popular videos
// ============================================================
export async function getTrending(
  page = 1,
  sort?: string
): Promise<PaginatedResponse<VideoResult>> {
  const url = buildUrl("/trending", page, sort);
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  if (videos.length > 0 && pagination.totalPages <= page) {
    pagination.totalPages = page + 1;
  } else if (videos.length === 0 && pagination.totalPages <= page) {
    pagination.totalPages = page;
  }

  return {
    source: "trending",
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// CENSORED: Censored videos listing
// ============================================================
export async function getCensored(
  page = 1,
  sort?: string
): Promise<PaginatedResponse<VideoResult>> {
  const url = buildUrl("/censored", page, sort);
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  if (videos.length > 0 && pagination.totalPages <= page) {
    pagination.totalPages = page + 1;
  } else if (videos.length === 0 && pagination.totalPages <= page) {
    pagination.totalPages = page;
  }

  return {
    source: "censored",
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// UNCENSORED: Uncensored videos listing
// ============================================================
export async function getUncensored(
  page = 1,
  sort?: string
): Promise<PaginatedResponse<VideoResult>> {
  const url = buildUrl("/uncensored", page, sort);
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  if (videos.length > 0 && pagination.totalPages <= page) {
    pagination.totalPages = page + 1;
  } else if (videos.length === 0 && pagination.totalPages <= page) {
    pagination.totalPages = page;
  }

  return {
    source: "uncensored",
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// REDUCING-MOSAIC: Reducing mosaic videos listing
// ============================================================
export async function getReducingMosaic(
  page = 1,
  sort?: string
): Promise<PaginatedResponse<VideoResult>> {
  const url = buildUrl("/reducing-mosaic", page, sort);
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  if (videos.length > 0 && pagination.totalPages <= page) {
    pagination.totalPages = page + 1;
  } else if (videos.length === 0 && pagination.totalPages <= page) {
    pagination.totalPages = page;
  }

  return {
    source: "reducing-mosaic",
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// CATEGORIES: List all categories
// ============================================================
export async function getCategories(): Promise<{
  source: string;
  totalCategories: number;
  categories: CategoryItem[];
}> {
  const { data } = await client.get("/categories");
  const $ = cheerio.load(data);

  const categories: CategoryItem[] = [];
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
  page = 1
): Promise<PaginatedResponse<VideoResult> & { category: string }> {
  const url =
    page > 1 ? `/category/${slug}?page=${page}` : `/category/${slug}`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  return {
    source: "category",
    category: slug,
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
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

  return {
    source: "actresses",
    totalActresses: actresses.length,
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
  page = 1
): Promise<PaginatedResponse<VideoResult> & { actress: string }> {
  const url =
    page > 1 ? `/actress/${slug}?page=${page}` : `/actress/${slug}`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  return {
    source: "actress",
    actress: slug,
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
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

  return {
    source: "channels",
    totalChannels: channels.length,
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
  page = 1
): Promise<PaginatedResponse<VideoResult> & { channel: string }> {
  const url =
    page > 1 ? `/channel/${slug}?page=${page}` : `/channel/${slug}`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  return {
    source: "channel",
    channel: slug,
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
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

  return {
    source: "search",
    query,
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
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
  let url: string;
  if (slug) {
    url = `/video/${id}/${slug}`;
  } else {
    try {
      const searchRes = await client.get(`/search?q=${id}`);
      const search$ = cheerio.load(searchRes.data);
      const firstLink = search$(`a[href*="/video/${id}/"]`)
        .first()
        .attr("href");
      if (firstLink) {
        url = firstLink;
      } else {
        throw new Error(
          "Cannot find video slug. Please provide both id and slug (e.g., /api/video/108365/hrsm-146)"
        );
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Cannot find")) throw e;
      throw new Error(
        `Video /video/${id} not found. The site requires a slug. Try /api/video/${id}/<slug>`
      );
    }
  }

  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  // Extract the frontWatchConfig JSON blob
  const configScript = $("#frontWatchConfig").html();
  let config: Record<string, unknown> = {};
  if (configScript) {
    try {
      config = JSON.parse(configScript);
    } catch (_e) {
      const allScripts = $('script[type="application/json"]');
      allScripts.each((_, el) => {
        try {
          const parsed = JSON.parse($(el).html() || "{}");
          if (parsed.playerSources || parsed.videoTitle) {
            config = parsed;
            return false;
          }
        } catch (_ex) {
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

  // Extract metadata
  const metaDescription = $('meta[name="description"]').attr("content") || "";
  const metaKeywords = $('meta[name="keywords"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const publishedTime =
    $('meta[property="article:published_time"]').attr("content") || "";

  const videoCode = $('[class*="video-code"], [class*="code"]')
    .first()
    .text()
    .trim();
  const releaseDate = $('[class*="release"], [class*="date"]')
    .first()
    .text()
    .trim();
  const description = $('[class*="description"], .video-description')
    .first()
    .text()
    .trim();

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

  // Extract preview thumbnail URLs
  const previewSources: string[] = [];
  $("[data-front-video-preview-src]").each((_, el) => {
    const src = $(el).attr("data-front-video-preview-src");
    if (src) previewSources.push(src);
  });

  // Extract all thumbnail images
  const thumbnails: string[] = [];
  $("[data-front-lazy-src], [data-front-lazy-fallback-src]").each((_, el) => {
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
    duration: null,
    quality: (config.defaultQuality as number)
      ? `${config.defaultQuality}p`
      : null,
    views: null,
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
      downloadLink: `/video/${id}/download-link`,
      favorite: `/video/${id}/favorite`,
      report: `/video/${id}/report`,
    },
  };
}

// ============================================================
// COMMENTS
// ============================================================
export async function getComments(videoId: string): Promise<Record<string, unknown>> {
  try {
    const { data } = await client.get(`/video/${videoId}/comments`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
      },
    });

    if (typeof data === "object") {
      return data;
    }

    const $ = cheerio.load(data);
    const comments: { author: string; content: string; date: string }[] = [];
    $(`.comment, [class*="comment-item"]`).each((_, el) => {
      comments.push({
        author: $(el)
          .find(`[class*="author"], [class*="user"]`)
          .first()
          .text()
          .trim(),
        content: $(el)
          .find(`[class*="content"], [class*="text"], [class*="body"]`)
          .first()
          .text()
          .trim(),
        date: $(el)
          .find(`[class*="date"], [class*="time"]`)
          .first()
          .text()
          .trim(),
      });
    });

    return { videoId, comments, total: comments.length };
  } catch (_err) {
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
  } catch (_err) {
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
