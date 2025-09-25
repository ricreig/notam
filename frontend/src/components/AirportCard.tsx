import { useMemo } from 'react';
import { Airport, Notam } from '../types/notam';
import { useDashboardStore } from '../store/useDashboardStore';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface AirportCardProps {
  airport: Airport;
  notams: Notam[];
}

export default function AirportCard({ airport, notams }: AirportCardProps) {
  const toggleFavorite = useDashboardStore((state) => state.toggleFavorite);
  const favorites = useDashboardStore((state) => state.favorites);

  const chips = useMemo(() => {
    const statusCounts = notams.reduce(
      (acc, notam) => {
        const status = notam.status.toUpperCase();
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  }, [notams]);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 transition hover:border-sky-500/70">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{airport.icao}</h2>
          <p className="text-sm text-slate-400">{airport.name}</p>
        </div>
        <div className="flex gap-2">
          {chips.map((chip) => (
            <span
              key={chip.status}
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-semibold uppercase',
                chip.status.includes('UNSERVICEABLE') && 'bg-severity-uns/20 text-severity-uns',
                chip.status.includes('RESTRICTED') && 'bg-severity-res/20 text-severity-res',
                chip.status.includes('CAUTION') && 'bg-severity-cau/20 text-severity-cau',
                chip.status.includes('INFO') && 'bg-severity-info/20 text-severity-info',
              )}
            >
              {chip.status} {chip.count}
            </span>
          ))}
        </div>
      </header>
      <div className="space-y-4">
        {notams.map((notam) => (
          <article
            key={notam.id}
            className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 shadow-inner shadow-slate-900/30"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-mono text-slate-200">{notam.number}</h3>
                <p className="text-sm text-slate-400">{notam.subject ?? notam.text.slice(0, 60)}</p>
              </div>
              <button
                className={clsx(
                  'rounded-full border px-3 py-1 text-xs uppercase transition-colors',
                  favorites.includes(notam.id)
                    ? 'border-amber-400 text-amber-300'
                    : 'border-slate-700 text-slate-300 hover:border-amber-300 hover:text-amber-200',
                )}
                onClick={() => toggleFavorite(notam.id)}
              >
                {favorites.includes(notam.id) ? 'Favorited' : 'Favorite'}
              </button>
            </div>
            <div className="mt-3 grid gap-3 text-xs text-slate-400 md:grid-cols-2">
              <span>
                <strong className="text-slate-300">Severity:</strong> {notam.severity}
              </span>
              <span>
                <strong className="text-slate-300">Relevance:</strong> {notam.relevance}
              </span>
              <span>
                <strong className="text-slate-300">Start:</strong>{' '}
                {notam.start_at ? `${format(new Date(notam.start_at), 'dd MMM HH:mm')}Z` : 'N/A'}
              </span>
              <span>
                <strong className="text-slate-300">End:</strong>{' '}
                {notam.end_at ? `${format(new Date(notam.end_at), 'dd MMM HH:mm')}Z` : 'N/A'}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{notam.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
