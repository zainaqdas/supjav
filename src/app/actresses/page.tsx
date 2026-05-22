import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import Pagination from '@/components/Pagination';
import { getActresses } from '@/lib/api';
import type { ActressItem } from '@/lib/types';

export default async function ActressesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1');
  const data = await getActresses(page).catch(() => ({ actresses: [] as ActressItem[], totalPages: 1, page: 1, totalActresses: 0, source: 'actresses' }));
  const actresses = data.actresses || [];

  if (!actresses.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-white/30">No actresses found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <SectionHeader
          title="Actresses"
          subtitle={`Page ${data.page || page} of ${data.totalPages || 1} — ${data.totalActresses || actresses.length} actresses on this page`}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {actresses.map((a, i) => (
          <Link
            key={a.slug}
            href={`/actress/${a.slug}`}
            className="glass-card p-4 flex flex-col items-center text-center gap-3 animate-fade-in-up"
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600/20 to-blue-600/20 flex items-center justify-center border border-white/5">
              <span className="text-white/60 font-semibold text-lg">
                {a.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-white/70 text-sm font-medium line-clamp-1">{a.name}</h3>
              {a.videoCount !== null && (
                <span className="text-white/30 text-xs">{a.videoCount.toLocaleString()} videos</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={data.totalPages || 1} baseUrl="/actresses" />
    </div>
  );
}
