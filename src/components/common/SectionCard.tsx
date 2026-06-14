import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  badge?: ReactNode;
  rightSlot?: ReactNode;
}

export function SectionCard({ title, description, children, badge, rightSlot }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-card sm:p-5">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
            {badge}
          </div>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
              {description}
            </p>
          )}
        </div>
        {rightSlot}
      </header>
      {children}
    </section>
  );
}
