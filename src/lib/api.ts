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

function proxyImageUrl(url: string | null): string | null {
  if (!url) return null;
  // Proxy javtiful.com images through our API to avoid CORS/referer blocking
  if (url.includes('javtiful.com')) {
    return `/api/proxy/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function mapVideoResult(v: scraper.VideoResult): VideoResult {
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

function mapVideoDetail(v: scraper.VideoDetail): VideoDetail {
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
  };
}

export async function getMain(page = 1): Promise<PaginatedResponse<VideoResult>> {
  const data = await scraper.getMain(page);
  return {
    source: data.source,
    page: data.page,
    totalPages: data.totalPages,
    totalResults: data.totalResults,
    videos: data.videos.map(mapVideoResult),
  };
}

export async function getTrending(page = 1): Promise<PaginatedResponse<VideoResult>> {
  const data = await scraper.getTrending(page);
  return {
    source: data.source,
    page: data.page,
    totalPages: data.totalPages,
    totalResults: data.totalResults,
    videos: data.videos.map(mapVideoResult),
  };
}

export async function getCategories(): Promise<CategoryListResponse> {
  const data = await scraper.getCategories();
  return {
    source: data.source,
    totalCategories: data.totalCategories,
    categories: data.categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      videoCount: c.videoCount,
      url: c.url,
    })),
  };
}

export async function getCategory(slug: string, page = 1): Promise<CategoryDetailResponse> {
  const data = await scraper.getCategory(slug, page);
  return {
    source: data.source,
    category: data.category,
    page: data.page,
    totalPages: data.totalPages,
    totalResults: data.totalResults,
    videos: data.videos.map(mapVideoResult),
  };
}

export async function getActresses(): Promise<ActressListResponse> {
  const data = await scraper.getActresses();
  return {
    source: data.source,
    totalActresses: data.totalActresses,
    actresses: data.actresses.map((a) => ({
      slug: a.slug,
      name: a.name,
      videoCount: a.videoCount,
      url: a.url,
    })),
  };
}

export async function getActress(slug: string, page = 1): Promise<ActressDetailResponse> {
  const data = await scraper.getActress(slug, page);
  return {
    source: data.source,
    actress: data.actress,
    page: data.page,
    totalPages: data.totalPages,
    totalResults: data.totalResults,
    videos: data.videos.map(mapVideoResult),
  };
}

export async function getChannels(): Promise<ChannelListResponse> {
  const data = await scraper.getChannels();
  return {
    source: data.source,
    totalChannels: data.totalChannels,
    channels: data.channels.map((c) => ({
      slug: c.slug,
      name: c.name,
      videoCount: c.videoCount,
      url: c.url,
    })),
  };
}

export async function getChannel(slug: string, page = 1): Promise<ChannelDetailResponse> {
  const data = await scraper.getChannel(slug, page);
  return {
    source: data.source,
    channel: data.channel,
    page: data.page,
    totalPages: data.totalPages,
    totalResults: data.totalResults,
    videos: data.videos.map(mapVideoResult),
  };
}

export async function search(query: string, page = 1): Promise<SearchResponse> {
  const data = await scraper.search(query, page);
  return {
    source: data.source,
    query: data.query,
    page: data.page,
    totalPages: data.totalPages,
    totalResults: data.totalResults,
    videos: data.videos.map(mapVideoResult),
  };
}

export async function getVideoDetail(id: string, slug: string): Promise<VideoDetail> {
  const data = await scraper.getVideoDetail(id, slug);
  return mapVideoDetail(data);
}

export async function getVideoStream(id: string): Promise<{
  id: string;
  title: string;
  streams: VideoDetail['streams'];
  qualityOptions: number[];
  defaultQuality: number | null;
}> {
  // getVideoDetail fetches all video data including streams.
  // For the stream-specific endpoint, extract just stream info.
  const detail = await scraper.getVideoDetail(id);
  return {
    id: detail.id,
    title: detail.title,
    streams: detail.streams.map((s) => ({
      url: s.url || '',
      type: s.type || '',
      quality: s.quality || '',
    })),
    qualityOptions: detail.qualityOptions,
    defaultQuality: detail.defaultQuality,
  };
}
