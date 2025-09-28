import { useMemo, useState } from 'react';
import FiltersBar from '../components/FiltersBar';
import type { Filters } from '../types/filters';
import type { Airport, Catalogs, Notam } from '../types/notam';
import type { StationSuggestion } from '../components/StationSearch';
import CategoryChip from '../components/CategoryChip';
import SeverityBadge from '../components/SeverityBadge';
import { formatUtcRangeWithSuffix } from '../utils/datetime';
import { extractNotamSummary, getNotamSummarySnippet } from '../utils/notamText';
import { mapSeverity } from '../utils/severity';

interface ListViewProps {
  notams: Notam[];
  airports: Airport[];
  catalogs?: Catalogs | null;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  stationSuggestions: StationSuggestion[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

type SortKey = 'severity' | 'validity';

function buildTooltip(notam: Notam) {
  const summary = extractNotamSummary(notam);
  const qLine = notam.q_line ? `\nQ-line: ${notam.q_line}` : '';
  return `${summary ?? ''}${qLine}`.trim();
}

export function ListView({
  notams,
  airports,
  catalogs,
  filters,
  onFiltersChange,
  onClearFilters,
  stationSuggestions,
  loading,
  error,
  onRetry,
}: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('severity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const airportIndex = useMemo(() => new Map(airports.map((airport) => [airport.icao, airport])), [airports]);
  const categoryIndex = useMemo(() => new Map((catalogs?.categories ?? []).map((category) => [category.id, category])), [catalogs]);

  const sorted = useMemo(() => {
    const items = [...notams];
    items.sort((a, b) => {
      if (sortKey === 'severity') {
        const diff = (b.severity ?? 0) - (a.severity ?? 0);
        return sortDir === 'asc' ? -diff : diff;
      }
      const aDate = new Date(a.start_at ?? 0).getTime();
      const bDate = new Date(b.start_at ?? 0).getTime();
      const diff = bDate - aDate;
      return sortDir === 'asc' ? -diff : diff;
    });
    return items;
  }, [notams, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'severity' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="space-y-6">
      <FiltersBar
        filters={filters}
        catalogs={catalogs}
        onChange={onFiltersChange}
        onClear={onClearFilters}
        stationSuggestions={stationSuggestions}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {sorted.length} NOTAM ordenados por {sortKey === 'severity' ? 'severidad' : 'vigencia'} ({sortDir})
        </p>
        {loading && <span className="text-xs text-slate-400">Cargando…</span>}
        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-300">
            Error al cargar datos.
            {onRetry && (
              <button type="button" className="rounded border border-rose-400 px-2 py-1" onClick={onRetry}>
                Reintentar
              </button>
            )}
          </div>
        )}
      </div>

      {sorted.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-300">
          No hay NOTAM para los filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-100">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">NOTAM</th>
                <th className="px-4 py-3 text-left">Estación</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Resumen</th>
                <th className="px-4 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort('validity')}
                    className="flex items-center gap-1 font-semibold text-slate-300 hover:text-white"
                  >
                    Vigencia
                    <span className="text-[10px]">{sortKey === 'validity' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort('severity')}
                    className="flex items-center gap-1 font-semibold text-slate-300 hover:text-white"
                  >
                    Severidad
                    <span className="text-[10px]">{sortKey === 'severity' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sorted.map((notam) => {
                const airport = airportIndex.get(notam.icao);
                const category = notam.category ? categoryIndex.get(notam.category) : null;
                const tooltip = buildTooltip(notam);
                const severity = mapSeverity(notam.severity);
                return (
                  <tr key={notam.id} className="hover:bg-slate-900/70">
                    <td className="px-4 py-3 font-semibold" title={tooltip}>
                      {notam.number ?? notam.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-100">{notam.icao}</p>
                      <p className="text-xs text-slate-400">{airport?.name ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      {category ? <CategoryChip label={category.label} color={category.color} /> : <span className="text-xs text-slate-400">Sin categoría</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300" title={tooltip}>
                      {getNotamSummarySnippet(notam, 160) || 'Sin descripción disponible'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {formatUtcRangeWithSuffix(notam.start_at, notam.end_at)}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge value={notam.severity} className="text-xs" />
                      <span className="ml-2 text-xs uppercase text-slate-400">({severity.label})</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListView;
