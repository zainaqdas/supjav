import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}

export default function SectionHeader({ title, subtitle, href, linkLabel }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-text">{title}</span>
        </h2>
        {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
        >
          {linkLabel || 'View All'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
