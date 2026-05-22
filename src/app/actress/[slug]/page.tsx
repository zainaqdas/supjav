import SectionHeader from '@/components/SectionHeader';
import VideoGrid from '@/components/VideoGrid';
import Pagination from '@/components/Pagination';
import { getActress } from '@/lib/api';
import type { VideoResult } from '@/lib/types';

async function getActressVideos(slug: string, page: number): Promise<{ videos: VideoResult[]; totalPages: number; page: number; totalResults: number }> {
  try {
    return await getActress(slug, page);
  } catch {
    return { videos: [], totalPages: 1, page: 1, totalResults: 0 };
  }
}

export default async function ActressPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1');
  const data = await getActressVideos(slug, page);
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <SectionHeader
          title={name}
          subtitle={`Page ${data.page} of ${data.totalPages} — ${data.totalResults} videos`}
        />
      </div>
      <VideoGrid videos={data.videos} />
      <Pagination currentPage={page} totalPages={data.totalPages} baseUrl={`/actress/${slug}`} />
    </div>
  );
}
