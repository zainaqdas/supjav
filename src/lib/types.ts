export interface VideoStream {
  url: string | null;
  type: string | null;
  quality: string | null;
}

export interface VideoEndpoints {
  comments: string;
  playlist: string;
  downloadLink: string;
  favorite: string;
  report: string;
  embed: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string | null;
  children: Comment[];
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
  url: string | null;
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
  related: VideoResult[];
  comments: Comment[];
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
  page: number;
  totalPages: number;
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
  page: number;
  totalPages: number;
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
