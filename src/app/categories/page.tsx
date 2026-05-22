import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import { getCategories } from '@/lib/api';
import type { Category } from '@/lib/types';

// ISR: cache for 60s to reduce calls to source website
export const revalidate = 60;

export default async function CategoriesPage() {
  const data = await getCategories().catch(() => ({ categories: [] as Category[] }));
  const categories = data.categories || [];

  if (!categories.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-white/30">No categories found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative mb-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-br from-red-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <SectionHeader
          title="Categories"
          subtitle={`${categories.length} categories to explore`}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="glass-card p-5 flex flex-col justify-between min-h-[120px] animate-fade-in-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <h3 className="text-white/80 font-semibold text-sm leading-snug">{cat.name}</h3>
            <div className="flex items-center justify-between mt-3">
              {cat.videoCount !== null && (
                <span className="text-xs text-white/30">{cat.videoCount.toLocaleString()} videos</span>
              )}
              <svg className="w-4 h-4 text-white/10 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
