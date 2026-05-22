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

// Uses relative /api path (API routes are now internal to the Next.js app).
// Set NEXT_PUBLIC_API_URL to an external scraper URL if running separately.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getMain(page = 1): Promise<PaginatedResponse<VideoResult>> {
  return fetchJson(`${API_BASE}/main?page=${page}`);
}

export async function getTrending(page = 1): Promise<PaginatedResponse<VideoResult>> {
  return fetchJson(`${API_BASE}/trending?page=${page}`);
}

export async function getCategories(): Promise<CategoryListResponse> {
  return fetchJson(`${API_BASE}/categories`);
}

export async function getCategory(slug: string, page = 1): Promise<CategoryDetailResponse> {
  return fetchJson(`${API_BASE}/category/${encodeURIComponent(slug)}?page=${page}`);
}

export async function getActresses(): Promise<ActressListResponse> {
  return fetchJson(`${API_BASE}/actresses`);
}

export async function getActress(slug: string, page = 1): Promise<ActressDetailResponse> {
  return fetchJson(`${API_BASE}/actress/${encodeURIComponent(slug)}?page=${page}`);
}

export async function getChannels(): Promise<ChannelListResponse> {
  return fetchJson(`${API_BASE}/channels`);
}

export async function getChannel(slug: string, page = 1): Promise<ChannelDetailResponse> {
  return fetchJson(`${API_BASE}/channel/${encodeURIComponent(slug)}?page=${page}`);
}

export async function search(query: string, page = 1): Promise<SearchResponse> {
  return fetchJson(`${API_BASE}/search?q=${encodeURIComponent(query)}&page=${page}`);
}

export async function getVideoDetail(id: string, slug: string): Promise<VideoDetail> {
  return fetchJson(`${API_BASE}/video/${encodeURIComponent(id)}/${encodeURIComponent(slug)}`);
}

export async function getVideoStream(id: string): Promise<{
  id: string;
  title: string;
  streams: VideoDetail['streams'];
  qualityOptions: number[];
  defaultQuality: number | null;
}> {
  return fetchJson(`${API_BASE}/video/${encodeURIComponent(id)}/stream`);
}
