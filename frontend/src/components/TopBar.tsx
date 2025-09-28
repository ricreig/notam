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
    <header className="sticky top-0 z-30 border-b border-slate-900/70 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[110rem] flex-col gap-3 px-5 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center justify-start">
            <a href="/" className="inline-flex items-center" aria-label="Inicio SENEAM">
              <img
                src={logo1x}
                srcSet={`${logo1x} 260w, ${logo2x} 520w`}
                sizes="(max-width: 768px) 180px, 240px"
                alt="SENEAM"
                className="h-auto max-h-12 w-auto"
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 text-center md:flex-row md:justify-center md:gap-3">
            <p className="whitespace-nowrap text-lg font-semibold uppercase tracking-[0.12em] text-slate-100 font-['Montserrat',_Helvetica,_Arial,_sans-serif]">
              NOTAM Operational Dashboard
            </p>
            <span className="whitespace-nowrap rounded-full border border-slate-700/70 bg-slate-900/70 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-300">
              {clock}
            </span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="rounded-full border border-sky-500/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-200 transition hover:bg-slate-900/70"
              >
                Refrescar
              </button>
            )}
            {rightSlot}
          </div>
        </div>
        <nav className="flex justify-center">
          <div className="inline-flex rounded-full border border-slate-700/70 bg-slate-900/70 p-0.5 shadow-inner shadow-slate-900/30">
            {VIEWS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx(
                  'rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950',
                  currentView === option.value
                    ? 'bg-sky-500 text-white shadow shadow-sky-500/40'
                    : 'text-slate-300 hover:bg-slate-800/70',
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
