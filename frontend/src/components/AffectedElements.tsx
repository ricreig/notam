import { Notam } from '../types/notam';
import { useMemo } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

interface AffectedElementsProps {
  notams: Notam[];
}

export default function AffectedElements({ notams }: AffectedElementsProps) {
  const catalogs = useDashboardStore((state) => state.catalogs);

  const grouped = useMemo(() => {
    const map = new Map<string, Notam[]>();
    for (const notam of notams) {
      const key = notam.element ?? 'unknown';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(notam);
    }
    return Array.from(map.entries());
  }, [notams]);

  if (!grouped.length) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
        No NOTAMs for the selected filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {grouped.map(([elementId, items]) => {
        const element = catalogs?.elements.find((el) => el.id === elementId);
        const label = element?.label ?? 'Otros elementos';
        const severityAverage = Math.round(items.reduce((sum, item) => sum + item.severity, 0) / items.length || 0);

        return (
          <article key={elementId} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 shadow-inner shadow-slate-900/30">
            <header className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">{label}</h3>
              <span className="text-xs uppercase text-slate-400">{items.length} NOTAMs</span>
            </header>
            <div className="mb-2 h-2 w-full overflow-hidden rounded bg-slate-800">
              <div
                className="h-full rounded bg-gradient-to-r from-sky-500 via-amber-400 to-rose-500"
                style={{ width: `${severityAverage}%` }}
                aria-hidden
              />
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {items.slice(0, 4).map((notam) => (
                <li key={notam.id} className="line-clamp-2">
                  <strong className="font-mono text-slate-200">{notam.number}</strong> {notam.text}
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
