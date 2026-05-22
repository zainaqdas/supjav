import SectionHeader from '@/components/SectionHeader';
import VideoGrid from '@/components/VideoGrid';
import Pagination from '@/components/Pagination';
import { search } from '@/lib/api';
import type { VideoResult, SearchResponse } from '@/lib/types';

async function doSearch(query: string, page: number): Promise<SearchResponse> {
  try {
    return await search(query, page);
  } catch {
    return { videos: [] as VideoResult[], totalPages: 1, page: 1, source: 'search', query, totalResults: 0 };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: query = '', page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1');
  const data = query ? await doSearch(query, page) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search form */}
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            <span className="gradient-text">Search</span>
          </h1>
          <p className="text-white/40 text-sm text-center mb-6">Find videos, actresses, and more</p>
          <form className="relative" method="GET" action="/search">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search videos..."
              className="w-full px-5 py-4 pl-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-all text-lg"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white text-sm font-semibold hover:shadow-xl transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      {data ? (
        <>
          <SectionHeader
            title={`Results for "${query}"`}
            subtitle={`${data.totalResults} videos found — Page ${data.page} of ${data.totalPages}`}
          />
          <VideoGrid videos={data.videos} />
          <Pagination currentPage={page} totalPages={data.totalPages} baseUrl="/search" searchParams={{ q: query }} />
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-white/30 text-lg">Enter a search term to find videos</p>
        </div>
      )}
    </div>
  );
}
