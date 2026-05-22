'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'popular_week', label: 'Popular This Week' },
  { value: 'popular_today', label: 'Popular Today' },
  { value: 'popular_month', label: 'Popular This Month' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked', label: 'Most Liked' },
  { value: 'added_today', label: 'Added Today' },
  { value: 'added_week', label: 'Added This Week' },
  { value: 'added_month', label: 'Added This Month' },
];

export default function SortSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || '';
  const currentPage = searchParams.get('page') || '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams();
    const sort = e.target.value;
    if (sort) params.set('sort', sort);
    if (currentPage && currentPage !== '1') params.set('page', currentPage);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm focus:outline-none focus:border-red-500/50 hover:border-white/20 transition-all cursor-pointer appearance-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '36px',
      }}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#1a1a2e] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
