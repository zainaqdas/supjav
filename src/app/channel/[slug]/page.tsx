import { cache, Suspense } from 'react';
import type { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';
import VideoGrid from '@/components/VideoGrid';
import Pagination from '@/components/Pagination';
import SortSelector, { DETAIL_SORT_OPTIONS } from '@/components/SortSelector';
import JsonLd from '@/components/JsonLd';
import { getChannel } from '@/lib/api';
import { SITE_URL } from '@/lib/site';
import type { VideoResult } from '@/lib/types';

// ISR: cache for 1 hour to reduce calls to source website
export const revalidate = 3600;

const getChannelVideos = cache(async function getChannelVideos(
  slug: string,
  page: number,
  sort?: string
): Promise<{ videos: VideoResult[]; totalPages: number; page: number; totalResults: number; name?: string }> {
  try {
    return await getChannel(slug, page, sort);
  } catch {
    return { videos: [], totalPages: 1, page: 1, totalResults: 0 };
  }
});

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { page: pageStr, sort } = await searchParams;
  const page = parseInt(pageStr || '1');
  const data = await getChannelVideos(slug, page, sort);
  const name = data.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name} JAV Videos — Watch Studio Movies`,
    description: `Watch ${name} JAV videos online in HD for free. Stream ${data.totalResults ? data.totalResults.toLocaleString() : ''} movies from the ${name} studio with instant playback, sorting, and pagination on JavOnlineHD.`,
    alternates: { canonical: `/channel/${slug}` },
    openGraph: {
      title: `${name} JAV Videos — Watch Studio Movies`,
      description: `Watch ${name} JAV movies online in HD for free on JavOnlineHD.`,
      url: `${SITE_URL}/channel/${slug}`,
    },
  };
}

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { page: pageStr, sort } = await searchParams;
  const page = parseInt(pageStr || '1');
  const data = await getChannelVideos(slug, page, sort);
  const name = data.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Channels', item: `${SITE_URL}/channels` },
            { '@type': 'ListItem', position: 3, name },
          ],
        }}
      />
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            title={name}
            subtitle={`Page ${data.page} of ${data.totalPages} — ${data.totalResults} videos`}
          />
          <Suspense>
            <SortSelector options={DETAIL_SORT_OPTIONS} />
          </Suspense>
        </div>
      </div>
      <VideoGrid videos={data.videos} />
      <Pagination currentPage={page} totalPages={data.totalPages} baseUrl={`/channel/${slug}`} searchParams={sort ? { sort } : {}} />
    </div>
  );
}
