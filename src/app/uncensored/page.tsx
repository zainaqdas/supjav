import SectionHeader from '@/components/SectionHeader';
import VideoGrid from '@/components/VideoGrid';
import Pagination from '@/components/Pagination';
import { getUncensored } from '@/lib/api';
import type { VideoResult } from '@/lib/types';

// ISR: cache for 60s to reduce calls to source website
export const revalidate = 60;

export default async function UncensoredPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1');
  const data = await getUncensored(page).catch(() => ({ videos: [] as VideoResult[], totalPages: 1, page: 1 }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <SectionHeader
          title="Uncensored"
          subtitle={`Page ${data.page} of ${data.totalPages} — Uncensored JAV videos`}
        />
      </div>
      <VideoGrid videos={data.videos} />
      <Pagination currentPage={page} totalPages={data.totalPages} baseUrl="/uncensored" />
    </div>
  );
}
