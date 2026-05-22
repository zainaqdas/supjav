const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://javtiful.com';

// Common axios instance with browser-like headers
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
});

// ============================================================
// HELPER: Parse a listing page (main, trending, search, category, actress, channel)
// ============================================================
function parseVideoCards($) {
  const videos = [];

  // Find all video cards - they use <article class="front-video-card">
  $('.front-video-card').each((i, el) => {
    const card = $(el);

    // Title: specifically the .front-video-title link inside the card body
    const titleEl = card.find('.front-video-card-body .front-video-title').first();
    const href = titleEl.attr('href') || '';
    const title = titleEl.text().trim();

    // Parse ID and slug from href: /video/{id}/{slug}
    const urlMatch = href.match(/\/video\/(\d+)\/([^/]+)/);
    const id = urlMatch ? urlMatch[1] : '';
    const slug = urlMatch ? urlMatch[2] : '';

    // Thumbnail - from data-front-lazy-src on img
    const imgEl = card.find('.front-video-thumb img, img').first();
    const thumbnail =
      imgEl.attr('data-front-lazy-src') ||
      imgEl.attr('data-src') ||
      imgEl.attr('src') ||
      '';

    // Duration - from .front-duration-tag
    const duration = card.find('.front-duration-tag').first().text().trim();

    // Quality - from .front-quality-tag
    const quality = card.find('.front-quality-tag').first().text().trim();

    // Views - from .front-video-stat
    const views = card.find('.front-video-stat').first().text().trim();

    // Time ago - from .front-video-meta span (the one without .front-video-stat)
    const metaSpans = card.find('.front-video-meta span');
    let timeAgo = '';
    metaSpans.each((_, span) => {
      const text = $(span).text().trim();
      // Skip the views stat (identified by its class) and bullet separators
      if (text && !$(span).hasClass('front-video-stat') && text !== '\u2022' && text !== '•') {
        timeAgo = text;
        return false;
      }
    });

    // Badges: look for uncensored, reducing mosaic, etc. in the overlay
    const badges = [];
    card.find('.front-video-overlay span, .front-quality-tag').each((_, badge) => {
      const text = $(badge).text().trim();
      if (text && text !== duration && text !== quality) {
        badges.push(text);
      }
    });

    // Preview video URL (from data-front-video-preview-src, can be on multiple elements)
    const previewSrc =
      card.find('[data-front-video-preview-src]').first().attr('data-front-video-preview-src') ||
      '';

    // Filter out ad cards (no valid video ID)
    if (id && title) {
      // Ensure the href is actually a video link, not an ad
      if (href.includes('/video/')) {
        videos.push({
          id,
          slug,
          title,
          url: href ? `${BASE_URL}${href}` : null,
          thumbnail: thumbnail.startsWith('http') ? thumbnail : (thumbnail ? `${BASE_URL}${thumbnail}` : null),
          previewVideo: previewSrc || null,
          duration: duration || null,
          quality: quality || null,
          views: views || null,
          timeAgo: timeAgo || null,
          badges: badges.length > 0 ? badges : null,
        });
      }
    }
  });

  // Fallback: if no cards found with the expected selectors, try broader matching
  if (videos.length === 0) {
    $('.front-video-title').each((i, el) => {
      if (i >= 50) return false;
      const href = $(el).attr('href');
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

function parsePagination($) {
  const pagination = {
    currentPage: 1,
    totalPages: 1,
    nextPage: null,
    prevPage: null,
  };

  // Look for pagination elements
  const activePage = $('.pagination .active, .page-item.active, [class*="pagination"] .active');
  if (activePage.length) {
    pagination.currentPage = parseInt(activePage.text().trim()) || 1;
  }

  // Look for total pages
  const pageItems = $('.pagination .page-item, .pagination a, [class*="pagination"] a');
  const pageNumbers = [];
  pageItems.each((_, el) => {
    const num = parseInt($(el).text().trim());
    if (!isNaN(num)) pageNumbers.push(num);
  });
  if (pageNumbers.length > 0) {
    pagination.totalPages = Math.max(...pageNumbers);
  }

  // Next/Prev links
  const nextLink = $('.pagination .next a, .pagination [rel="next"], a[rel="next"]').attr('href');
  const prevLink = $('.pagination .prev a, .pagination [rel="prev"], a[rel="prev"]').attr('href');
  if (nextLink) pagination.nextPage = nextLink;
  if (prevLink) pagination.prevPage = prevLink;

  return pagination;
}

// ============================================================
// MAIN PAGE: Latest videos
// ============================================================
async function getMain(page = 1) {
  const url = page > 1 ? `/main?page=${page}` : '/main';
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  return {
    source: 'main',
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// TRENDING: Popular videos
// ============================================================
async function getTrending(page = 1) {
  const url = page > 1 ? `/trending?page=${page}` : '/trending';
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  return {
    source: 'trending',
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// CATEGORIES: List all categories
// ============================================================
async function getCategories() {
  const { data } = await client.get('/categories');
  const $ = cheerio.load(data);

  const categories = [];
  $('a[href*="/category/"]').each((i, el) => {
    const href = $(el).attr('href');
    const name = $(el).text().trim();
    const match = href.match(/\/category\/([^/]+)/);
    if (match && name) {
      // Avoid duplicates
      const existing = categories.find((c) => c.slug === match[1]);
      if (!existing) {
        // Try to find video count
        const parent = $(el).parent();
        const countText = parent.text().trim();
        const countMatch = countText.match(/(\d+)\s*Videos?/i);

        categories.push({
          slug: match[1],
          name: name.replace(/\d+\s*Videos?/i, '').trim(),
          videoCount: countMatch ? parseInt(countMatch[1]) : null,
          url: `${BASE_URL}${href}`,
        });
      }
    }
  });

  return {
    source: 'categories',
    totalCategories: categories.length,
    categories,
  };
}

// ============================================================
// CATEGORY DETAIL: Videos in a specific category
// ============================================================
async function getCategory(slug, page = 1) {
  const url = page > 1 ? `/category/${slug}?page=${page}` : `/category/${slug}`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  return {
    source: 'category',
    category: slug,
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// ACTRESSES: List all actresses
// ============================================================
async function getActresses() {
  const { data } = await client.get('/actresses');
  const $ = cheerio.load(data);

  const actresses = [];
  $('a[href*="/actress/"]').each((i, el) => {
    const href = $(el).attr('href');
    const name = $(el).text().trim();
    const match = href.match(/\/actress\/([^/]+)/);
    if (match && name) {
      const existing = actresses.find((a) => a.slug === match[1]);
      if (!existing) {
        const parent = $(el).parent();
        const countText = parent.text().trim();
        const countMatch = countText.match(/(\d+)\s*Videos?/i);

        actresses.push({
          slug: match[1],
          name: name.replace(/\d+\s*Videos?/i, '').trim(),
          videoCount: countMatch ? parseInt(countMatch[1]) : null,
          url: `${BASE_URL}${href}`,
        });
      }
    }
  });

  return {
    source: 'actresses',
    totalActresses: actresses.length,
    actresses,
  };
}

// ============================================================
// ACTRESS DETAIL: Videos by a specific actress
// ============================================================
async function getActress(slug, page = 1) {
  const url = page > 1 ? `/actress/${slug}?page=${page}` : `/actress/${slug}`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  return {
    source: 'actress',
    actress: slug,
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// CHANNELS: List all channels/studios
// ============================================================
async function getChannels() {
  const { data } = await client.get('/channels');
  const $ = cheerio.load(data);

  const channels = [];
  $('a[href*="/channel/"]').each((i, el) => {
    const href = $(el).attr('href');
    const name = $(el).text().trim();
    const match = href.match(/\/channel\/([^/]+)/);
    if (match && name) {
      const existing = channels.find((c) => c.slug === match[1]);
      if (!existing) {
        const parent = $(el).parent();
        const countText = parent.text().trim();
        const countMatch = countText.match(/(\d+)\s*Videos?/i);

        channels.push({
          slug: match[1],
          name: name.replace(/\d+\s*Videos?/i, '').trim(),
          videoCount: countMatch ? parseInt(countMatch[1]) : null,
          url: `${BASE_URL}${href}`,
        });
      }
    }
  });

  return {
    source: 'channels',
    totalChannels: channels.length,
    channels,
  };
}

// ============================================================
// CHANNEL DETAIL: Videos by a specific channel
// ============================================================
async function getChannel(slug, page = 1) {
  const url = page > 1 ? `/channel/${slug}?page=${page}` : `/channel/${slug}`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  return {
    source: 'channel',
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
async function search(query, page = 1) {
  const url = page > 1
    ? `/search?q=${encodeURIComponent(query)}&page=${page}`
    : `/search?q=${encodeURIComponent(query)}`;
  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  const videos = parseVideoCards($);
  const pagination = parsePagination($);

  return {
    source: 'search',
    query,
    page: pagination.currentPage || page,
    totalPages: pagination.totalPages,
    totalResults: videos.length,
    videos,
  };
}

// ============================================================
// VIDEO DETAIL: Extract full video info including stream URLs
// ============================================================
async function getVideoDetail(id, slug) {
  // Build URL - slug is required by the site, try to discover it if not provided
  let url;
  if (slug) {
    url = `/video/${id}/${slug}`;
  } else {
    // Try to discover the slug by searching for the video ID
    try {
      const searchRes = await client.get(`/search?q=${id}`);
      const search$ = cheerio.load(searchRes.data);
      const firstLink = search$(`a[href*="/video/${id}/"]`).first().attr('href');
      if (firstLink) {
        url = firstLink;
      } else {
        throw new Error('Cannot find video slug. Please provide both id and slug (e.g., /api/video/108365/hrsm-146)');
      }
    } catch (e) {
      if (e.message.includes('Cannot find')) throw e;
      throw new Error(`Video /video/${id} not found. The site requires a slug. Try /api/video/${id}/<slug>`);
    }
  }

  const { data } = await client.get(url);
  const $ = cheerio.load(data);

  // Extract the frontWatchConfig JSON blob
  const configScript = $('#frontWatchConfig').html();
  let config = {};
  if (configScript) {
    try {
      config = JSON.parse(configScript);
    } catch (e) {
      // Try to find it in a broader script tag
      const allScripts = $('script[type="application/json"]');
      allScripts.each((_, el) => {
        try {
          const parsed = JSON.parse($(el).html() || '{}');
          if (parsed.playerSources || parsed.videoTitle) {
            config = parsed;
            return false;
          }
        } catch (_) {}
      });
    }
  }

  // Parse stream sources
  const streams = (config.playerSources || []).map((source) => ({
    url: source.src || null,
    type: source.type || null,
    quality: source.size ? `${source.size}p` : null,
  }));

  // Extract metadata from the page
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const publishedTime = $('meta[property="article:published_time"]').attr('content') || '';

  // Extract additional metadata from the page
  const videoCode = $('[class*="video-code"], [class*="code"]').first().text().trim();
  const releaseDate = $('[class*="release"], [class*="date"]').first().text().trim();
  const description = $('[class*="description"], .video-description').first().text().trim();

  // Related tags/categories
  const tags = [];
  $('a[href*="/category/"], a[href*="/tag/"]').each((_, el) => {
    const tagHref = $(el).attr('href') || '';
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
  const actresses = [];
  $('a[href*="/actress/"]').each((_, el) => {
    const aHref = $(el).attr('href') || '';
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
  const previewSources = [];
  $('[data-front-video-preview-src]').each((_, el) => {
    const src = $(el).attr('data-front-video-preview-src');
    if (src) previewSources.push(src);
  });

  // Extract all thumbnail images
  const thumbnails = [];
  $('[data-front-lazy-src], [data-front-lazy-fallback-src]').each((_, el) => {
    const src = $(el).attr('data-front-lazy-src') || $(el).attr('data-front-lazy-fallback-src');
    if (src) {
      // Handle pipe-separated fallback sources
      src.split('|').forEach((s) => {
        const trimmed = s.trim();
        if (trimmed && !thumbnails.includes(trimmed)) {
          thumbnails.push(trimmed.startsWith('http') ? trimmed : `${BASE_URL}${trimmed}`);
        }
      });
    }
  });

  return {
    id: String(id),
    slug: slug || (config.videoTitle ? config.videoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : ''),
    title: config.videoTitle || $('title').text().split('|')[0].trim() || '',
    url: `${BASE_URL}/video/${id}/${slug || ''}`,
    poster: config.videoPoster
      ? (config.videoPoster.startsWith('http') ? config.videoPoster : `${BASE_URL}${config.videoPoster}`)
      : ogImage || null,
    description: description || metaDescription || null,
    keywords: metaKeywords ? metaKeywords.split(',').map((k) => k.trim()) : [],
    videoCode: videoCode || null,
    releaseDate: releaseDate || publishedTime || null,
    qualityOptions: config.qualityOptions || [],
    defaultQuality: config.defaultQuality || null,
    streams,
    previewSources,
    thumbnails,
    actresses,
    tags,
    // API endpoints for this video
    endpoints: {
      comments: config.commentsEndpoint || `/video/${id}/comments`,
      playlist: (config.playlist && config.playlist.endpoint) || `/video/${id}/playlist`,
      downloadLink: `/video/${id}/download-link`,
      favorite: `/video/${id}/favorite`,
      report: `/video/${id}/report`,
    },
  };
}

// ============================================================
// COMMENTS: Get comments for a video
// ============================================================
async function getComments(videoId) {
  try {
    const { data } = await client.get(`/video/${videoId}/comments`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    // If JSON response
    if (typeof data === 'object') {
      return data;
    }

    // If HTML response, parse it
    const $ = cheerio.load(data);
    const comments = [];
    $('.comment, [class*="comment-item"]').each((_, el) => {
      comments.push({
        author: $(el).find('[class*="author"], [class*="user"]').first().text().trim(),
        content: $(el).find('[class*="content"], [class*="text"], [class*="body"]').first().text().trim(),
        date: $(el).find('[class*="date"], [class*="time"]').first().text().trim(),
      });
    });

    return { videoId, comments, total: comments.length };
  } catch (err) {
    return { videoId, error: 'Failed to fetch comments', comments: [] };
  }
}

// ============================================================
// CSRF TOKEN: Get CSRF token for authenticated requests
// ============================================================
async function getCsrfToken() {
  try {
    const { data } = await client.get('/csrf-token', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });
    return data;
  } catch (err) {
    return { error: 'Failed to get CSRF token' };
  }
}

// ============================================================
// DOWNLOAD LINK: Attempt to get download link
// ============================================================
async function getDownloadLink(videoId, csrfToken) {
  try {
    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await client.post(
      `/video/${videoId}/download-link`,
      {},
      {
        headers,
        responseType: 'json',
      }
    );
    // Ensure the response is actually JSON
    if (typeof response.data === 'object') {
      return response.data;
    }
    return { success: false, message: 'Unexpected response format' };
  } catch (err) {
    return { success: false, message: `Error: ${err.message}` };
  }
}

module.exports = {
  client,
  BASE_URL,
  getMain,
  getTrending,
  getCategories,
  getCategory,
  getActresses,
  getActress,
  getChannels,
  getChannel,
  search,
  getVideoDetail,
  getComments,
  getCsrfToken,
  getDownloadLink,
};
