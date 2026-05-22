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

// On Vercel, use the deployment URL; in local dev, use relative /api.
// Set NEXT_PUBLIC_API_URL to an external scraper URL if running separately.
const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  // VERCEL_URL is set automatically by Vercel (server-side only, e.g. "supjav-beige.vercel.app")
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  return '/api';
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

const BASE = getApiBase();

export async function getMain(page = 1): Promise<PaginatedResponse<VideoResult>> {
  return fetchJson(`${BASE}/main?page=${page}`);
}

export async function getTrending(page = 1): Promise<PaginatedResponse<VideoResult>> {
  return fetchJson(`${BASE}/trending?page=${page}`);
}

export async function getCategories(): Promise<CategoryListResponse> {
  return fetchJson(`${BASE}/categories`);
}

export async function getCategory(slug: string, page = 1): Promise<CategoryDetailResponse> {
  return fetchJson(`${BASE}/category/${encodeURIComponent(slug)}?page=${page}`);
}

export async function getActresses(): Promise<ActressListResponse> {
  return fetchJson(`${BASE}/actresses`);
}

export async function getActress(slug: string, page = 1): Promise<ActressDetailResponse> {
  return fetchJson(`${BASE}/actress/${encodeURIComponent(slug)}?page=${page}`);
}

export async function getChannels(): Promise<ChannelListResponse> {
  return fetchJson(`${BASE}/channels`);
}

export async function getChannel(slug: string, page = 1): Promise<ChannelDetailResponse> {
  return fetchJson(`${BASE}/channel/${encodeURIComponent(slug)}?page=${page}`);
}

export async function search(query: string, page = 1): Promise<SearchResponse> {
  return fetchJson(`${BASE}/search?q=${encodeURIComponent(query)}&page=${page}`);
}

export async function getVideoDetail(id: string, slug: string): Promise<VideoDetail> {
  return fetchJson(`${BASE}/video/${encodeURIComponent(id)}/${encodeURIComponent(slug)}`);
}

export async function getVideoStream(id: string): Promise<{
  id: string;
  title: string;
  streams: VideoDetail['streams'];
  qualityOptions: number[];
  defaultQuality: number | null;
}> {
  return fetchJson(`${BASE}/video/${encodeURIComponent(id)}/stream`);
}
