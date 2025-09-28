import type { ReactNode } from 'react';
import clsx from 'clsx';
import { useUtcClock } from '../hooks/useUtcClock';
import logo1x from '@/assets/SENEAM_Logo_H.webp';
import logo2x from '@/assets/SENEAM_Logo_H@2x.webp';

const VIEWS: { label: string; value: ViewKey }[] = [
  { label: 'Globe', value: 'globe' },
  { label: 'List', value: 'list' },
  { label: 'Cards', value: 'cards' },
  { label: 'Favorites', value: 'favorites' },
];

export type ViewKey = 'globe' | 'list' | 'cards' | 'favorites';

interface TopBarProps {
  currentView: ViewKey;
  onViewChange: (view: ViewKey) => void;
  rightSlot?: ReactNode;
  onRefresh?: () => void;
}

export function TopBar({ currentView, onViewChange, rightSlot, onRefresh }: TopBarProps) {
  const clock = useUtcClock();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center justify-start">
            <a href="/" className="inline-flex items-center" aria-label="Inicio SENEAM">
              <img
                src={logo1x}
                srcSet={`${logo1x} 260w, ${logo2x} 520w`}
                sizes="(max-width: 768px) 180px, 260px"
                alt="SENEAM"
                className="h-auto max-h-16 w-auto"
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>
          <div className="flex flex-1 flex-col items-center gap-2 text-center md:flex-row md:justify-center">
            <p className="text-base font-semibold uppercase tracking-[0.18em] text-slate-200 sm:text-lg">
              NOTAM Operational Dashboard
            </p>
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-300">
              {clock}
            </span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="rounded-full border border-sky-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-200 transition hover:bg-slate-900"
              >
                Refrescar
              </button>
            )}
            {rightSlot}
          </div>
        </div>
        <nav className="flex justify-center">
          <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 p-1 shadow-inner shadow-slate-900/40">
            {VIEWS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx(
                  'rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950',
                  currentView === option.value
                    ? 'bg-sky-500 text-white shadow shadow-sky-500/40'
                    : 'text-slate-300 hover:bg-slate-800',
                )}
                onClick={() => onViewChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default TopBar;
