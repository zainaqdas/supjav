'use client';

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

// Defensive bound. totalPages now comes from a validated helper, but this is a
// client component fed by props and we never want to build thousands of links.
const MAX_RENDERED_PAGES = 200;

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  // Clamp before doing anything else: these arrive as props from page
  // components and a NaN/negative here used to render "Page null of null"
  // with no highlighted link.
  const safeTotal = Number.isFinite(totalPages)
    ? Math.min(Math.max(Math.floor(totalPages), 1), MAX_RENDERED_PAGES)
    : 1;
  const safeCurrent = Number.isFinite(currentPage)
    ? Math.min(Math.max(Math.floor(currentPage), 1), safeTotal)
    : 1;

  if (safeTotal <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  // Build only the window we actually render (first, last, and current ±1)
  // rather than iterating every page up to totalPages.
  const window = new Set<number>([1, safeTotal]);
  for (let i = safeCurrent - 1; i <= safeCurrent + 1; i++) {
    if (i >= 1 && i <= safeTotal) window.add(i);
  }

  const sorted = [...window].sort((a, b) => a - b);
  const pages: (number | '...')[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) pages.push('...');
    pages.push(page);
    previous = page;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {safeCurrent > 1 && (
        <Link
          href={buildUrl(safeCurrent - 1)}
          className="px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          Prev
        </Link>
      )}
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-3 py-2 text-white/20 text-sm">...</span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            aria-current={page === safeCurrent ? 'page' : undefined}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              page === safeCurrent
                ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {page}
          </Link>
        )
      )}
      {safeCurrent < safeTotal && (
        <Link
          href={buildUrl(safeCurrent + 1)}
          className="px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          Next
        </Link>
      )}
    </div>
  );
}