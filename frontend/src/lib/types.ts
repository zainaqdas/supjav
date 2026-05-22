export interface VideoStream {
  url: string;
  type: string;
  quality: string;
}

export interface VideoEndpoints {
  comments: string;
  playlist: string;
  downloadLink: string;
  favorite: string;
  report: string;
}

export interface Tag {
  type: string;
  slug: string;
  name: string;
}

export interface Actress {
  slug: string;
  name: string;
}

export interface VideoResult {
  id: string;
  slug: string;
  title: string;
  url: string;
  thumbnail: string | null;
  previewVideo: string | null;
  duration: string | null;
  quality: string | null;
  views: string | null;
  timeAgo: string | null;
  badges: string[] | null;
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
  actresses: Actress[];
  tags: Tag[];
  endpoints: VideoEndpoints;
}

export interface PaginatedResponse<T> {
  source: string;
  page: number;
  totalPages: number;
  totalResults: number;
  videos: T[];
}

export interface Category {
  slug: string;
  name: string;
  videoCount: number | null;
  url: string;
}

export interface CategoryListResponse {
  source: string;
  totalCategories: number;
  categories: Category[];
}

export interface ActressItem {
  slug: string;
  name: string;
  videoCount: number | null;
  url: string;
}

export interface ActressListResponse {
  source: string;
  totalActresses: number;
  actresses: ActressItem[];
}

export interface ChannelItem {
  slug: string;
  name: string;
  videoCount: number | null;
  url: string;
}

export interface ChannelListResponse {
  source: string;
  totalChannels: number;
  channels: ChannelItem[];
}

export interface SearchResponse extends PaginatedResponse<VideoResult> {
  query: string;
}

export interface CategoryDetailResponse extends PaginatedResponse<VideoResult> {
  category: string;
}

export interface ActressDetailResponse extends PaginatedResponse<VideoResult> {
  actress: string;
}

export interface ChannelDetailResponse extends PaginatedResponse<VideoResult> {
  channel: string;
}
