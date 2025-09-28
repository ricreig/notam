import { useState } from 'react';
import clsx from 'clsx';
import SeverityBadge from './SeverityBadge';
import CategoryChip from './CategoryChip';
import type { Notam } from '../types/notam';
import { formatUtcRangeWithSuffix } from '../utils/datetime';
import { extractNotamSummary } from '../utils/notamText';

interface NotamCardProps {
  notam: Notam;
  airportName?: string | null;
  categoryLabel?: string | null;
  categoryColor?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: (icao: string) => void;
  onViewOnMap?: (notam: Notam) => void;
  onSeeAllFromStation?: (icao: string) => void;
  expanded?: boolean;
}

function computeTimeline(notam: Notam) {
  const start = notam.start_at ? new Date(notam.start_at).getTime() : null;
  const end = notam.end_at ? new Date(notam.end_at).getTime() : null;
  if (!start || !end || end <= start) {
    return null;
  }
  const now = Date.now();
  const duration = end - start;
  const progress = Math.min(Math.max((now - start) / duration, 0), 1);
  return { progress, start, end };
}

export function NotamCard({
  notam,
  airportName,
  categoryLabel,
  categoryColor,
  isFavorite = false,
  onToggleFavorite,
  onViewOnMap,
  onSeeAllFromStation,
  expanded = false,
}: NotamCardProps) {
  const [showFull, setShowFull] = useState(expanded);
  const summary = extractNotamSummary(notam);
  const timeline = computeTimeline(notam);

  return (
    <article className={clsx('flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/40', expanded && 'ring-2 ring-sky-500')}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-100">{notam.number ?? 'SIN NÚMERO'}</p>
          <p className="text-sm font-medium text-slate-300">
            {notam.icao}
            {airportName ? ` · ${airportName}` : ''}
          </p>
        </div>
        {categoryLabel && <CategoryChip label={categoryLabel} color={categoryColor} />}
      </header>

      <div className="space-y-3 text-sm text-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vigencia</p>
        <p className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
          {formatUtcRangeWithSuffix(notam.start_at, notam.end_at)}
        </p>
        {summary && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resumen</p>
            <p className="text-sm leading-relaxed text-slate-100">
              {showFull ? summary : summary.slice(0, 220)}
              {summary.length > 220 && !showFull && '…'}
            </p>
            {summary.length > 220 && (
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-sky-300 hover:text-sky-200"
                onClick={() => setShowFull((value) => !value)}
              >
                {showFull ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        )}
        {notam.q_line && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Q-line</p>
            <p className="font-mono text-xs text-slate-200">{notam.q_line}</p>
          </div>
        )}
      </div>

      {timeline && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Timeline</p>
          <div className="h-2 w-full rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500"
              style={{ width: `${Math.max(timeline.progress * 100, 4)}%` }}
            />
          </div>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SeverityBadge value={notam.severity} />
          {typeof notam.relevance === 'number' && (
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
              Relevancia {notam.relevance}
            </span>
          )}
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase text-slate-300">
            {notam.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {onSeeAllFromStation && (
            <button
              type="button"
              onClick={() => onSeeAllFromStation(notam.icao)}
              className="rounded-full border border-sky-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200 transition hover:bg-slate-900"
            >
              Ver todos de {notam.icao}
            </button>
          )}
          {onViewOnMap && (
            <button
              type="button"
              onClick={() => onViewOnMap(notam)}
              className="rounded-full border border-emerald-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-slate-900"
            >
              Ver en mapa
            </button>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(notam.icao)}
              className={clsx(
                'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition',
                isFavorite
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-slate-700 text-slate-200 hover:bg-slate-900',
              )}
            >
              {isFavorite ? 'Favorito' : 'Agregar a favoritos'}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}

export default NotamCard;
