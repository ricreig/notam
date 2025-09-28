import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import FiltersBar from '../components/FiltersBar';
import type { Filters } from '../types/filters';
import type { Airport, Catalogs, Notam } from '../types/notam';
import type { StationSuggestion } from '../components/StationSearch';
import StationSearch from '../components/StationSearch';
import SeverityBadge from '../components/SeverityBadge';
import { formatUtcRangeWithSuffix } from '../utils/datetime';
import { getNotamSummarySnippet } from '../utils/notamText';
import { mapSeverity } from '../utils/severity';

interface FavoritesViewProps {
  notams: Notam[];
  airports: Airport[];
  catalogs?: Catalogs | null;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  stationSuggestions: StationSuggestion[];
  favorites: string[];
  onToggleFavorite: (icao: string) => void;
  onSelectStation: (icao: string) => void;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const ITEMS_PER_PAGE = 5;

function getTimeline(notams: Notam[]) {
  const entries = notams
    .map((notam) => {
      const start = notam.start_at ? new Date(notam.start_at).getTime() : null;
      const end = notam.end_at ? new Date(notam.end_at).getTime() : null;
      if (!start || !end || end <= start) return null;
      const severity = mapSeverity(notam.severity);
      return { notam, start, end, severity };
    })
    .filter(Boolean) as { notam: Notam; start: number; end: number; severity: ReturnType<typeof mapSeverity> }[];
  if (entries.length === 0) return [];
  const minStart = Math.min(...entries.map((entry) => entry.start));
  const maxEnd = Math.max(...entries.map((entry) => entry.end));
  const span = Math.max(maxEnd - minStart, 1);
  return entries.map((entry) => ({
    notam: entry.notam,
    left: ((entry.start - minStart) / span) * 100,
    width: Math.max(((entry.end - entry.start) / span) * 100, 3),
    severity: entry.severity,
  }));
}

export function FavoritesView({
  notams,
  airports,
  catalogs,
  filters,
  onFiltersChange,
  onClearFilters,
  stationSuggestions,
  favorites,
  onToggleFavorite,
  onSelectStation,
  loading,
  error,
  onRetry,
}: FavoritesViewProps) {
  const [page, setPage] = useState(0);
  const [newFavorite, setNewFavorite] = useState('');

  const airportIndex = useMemo(() => new Map(airports.map((airport) => [airport.icao, airport])), [airports]);
  const categoryIndex = useMemo(() => new Map((catalogs?.categories ?? []).map((category) => [category.id, category])), [catalogs]);

  const paginatedFavorites = favorites.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  const dataByStation = useMemo(() => {
    const groups = new Map<string, Notam[]>();
    for (const notam of notams) {
      if (!favorites.includes(notam.icao)) continue;
      if (!groups.has(notam.icao)) {
        groups.set(notam.icao, []);
      }
      groups.get(notam.icao)?.push(notam);
    }
    return groups;
  }, [notams, favorites]);

  const totalPages = Math.max(Math.ceil(favorites.length / ITEMS_PER_PAGE), 1);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [page, totalPages]);

  const airportSuggestions: StationSuggestion[] = useMemo(
    () =>
      airports
        .map((airport) => ({ icao: airport.icao, name: airport.name }))
        .sort((a, b) => a.icao.localeCompare(b.icao)),
    [airports],
  );

  const now = Date.now();
  const next24h = now + 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      <FiltersBar
        filters={filters}
        catalogs={catalogs}
        onChange={onFiltersChange}
        onClear={onClearFilters}
        stationSuggestions={stationSuggestions}
      />

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <header className="flex flex-wrap items-center gap-3">
          <div className="min-w-[240px] flex-1">
            <StationSearch
              value={newFavorite}
              onImmediateChange={setNewFavorite}
              onDebouncedChange={(value) => {
                const trimmed = value.trim().toUpperCase();
                if (trimmed.length === 4) {
                  setNewFavorite(trimmed);
                }
              }}
              suggestions={airportSuggestions}
              placeholder="Añadir estación favorita"
            />
          </div>
          <button
            type="button"
            className="rounded-full border border-sky-500/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-sky-200 transition hover:bg-slate-900/70"
            onClick={() => {
              const trimmed = newFavorite.trim().toUpperCase();
              if (trimmed.length === 4 && !favorites.includes(trimmed)) {
                onToggleFavorite(trimmed);
                setNewFavorite('');
              }
            }}
          >
            Añadir
          </button>
        </header>
        <div className="flex flex-wrap gap-2">
          {favorites.map((icao) => (
            <button
              key={icao}
              type="button"
              className="rounded-full border border-amber-400 bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100 hover:bg-amber-500/30"
              onClick={() => onToggleFavorite(icao)}
            >
              {icao} ✕
            </button>
          ))}
          {favorites.length === 0 && <p className="text-xs text-slate-400">No hay estaciones favoritas seleccionadas.</p>}
        </div>
      </section>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Mostrando {paginatedFavorites.length} de {favorites.length} estaciones favoritas
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
          >
            Anterior
          </button>
          <span>
            Página {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          >
            Siguiente
          </button>
        </div>
      </div>

      {loading && <p className="text-xs text-slate-400">Cargando datos…</p>}
      {error && (
        <div className="text-xs text-rose-300">
          Error al cargar información.
          {onRetry && (
            <button type="button" className="ml-2 rounded border border-rose-400 px-2 py-1" onClick={onRetry}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {paginatedFavorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-300">
          Agrega estaciones favoritas para ver su dashboard.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {paginatedFavorites.map((icao) => {
            const stationNotams = dataByStation.get(icao) ?? [];
            const airport = airportIndex.get(icao);
            const active = stationNotams.filter((item) => item.status === 'ACTIVE').length;
            const upcoming = stationNotams.filter((item) => item.status === 'UPCOMING').length;
            const upcoming24 = stationNotams.filter((item) => {
              const start = item.start_at ? new Date(item.start_at).getTime() : null;
              return start && start >= now && start <= next24h;
            }).length;

            const categoryCounts = stationNotams.reduce<Record<string, number>>((acc, item) => {
              if (!item.category) return acc;
              acc[item.category] = (acc[item.category] ?? 0) + 1;
              return acc;
            }, {});

            const barData = Object.entries(categoryCounts).map(([categoryId, count]) => {
              const category = categoryIndex.get(categoryId);
              return {
                label: category?.label ?? categoryId,
                count,
                color: category?.color ?? '#38bdf8',
              };
            });

            const timeline = getTimeline(stationNotams);
            const topNotams = [...stationNotams].sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0)).slice(0, 3);

            return (
              <section
                key={icao}
                className="flex min-w-0 flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/30"
              >
                <header className="flex flex-col gap-2">
                  <div className="min-h-[3.75rem]">
                    <h2 className="text-base font-semibold uppercase tracking-[0.18em] text-slate-100">{icao}</h2>
                    <p
                      className="text-[13px] text-slate-400"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {airport?.name ?? 'Aeródromo desconocido'}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-200">
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-2 py-2">
                      <p className="text-sm font-semibold text-slate-100">{active}</p>
                      <p className="uppercase tracking-[0.24em] text-slate-400">Activos</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-2 py-2">
                      <p className="text-sm font-semibold text-slate-100">{upcoming}</p>
                      <p className="uppercase tracking-[0.24em] text-slate-400">Próximos</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-2 py-2">
                      <p className="text-sm font-semibold text-slate-100">{upcoming24}</p>
                      <p className="uppercase tracking-[0.24em] text-slate-400">Próx. 24h</p>
                    </div>
                  </div>
                </header>

                <div className="h-40 w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-2">
                  {barData.length === 0 ? (
                    <p className="flex h-full items-center justify-center text-xs text-slate-400">Sin datos de categorías</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical" margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                        <XAxis type="number" allowDecimals={false} hide />
                        <YAxis dataKey="label" type="category" width={140} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                          cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
                        />
                        <Bar dataKey="count">
                          {barData.map((entry) => (
                            <Cell key={entry.label} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Timeline</p>
                  <div className="relative h-14 rounded-xl border border-slate-800 bg-slate-900/70">
                    {timeline.length === 0 ? (
                      <p className="flex h-full items-center justify-center text-xs text-slate-500">Sin vigencias programadas</p>
                    ) : (
                      timeline.map((item) => (
                        <div
                          key={item.notam.id}
                          className={`absolute top-2 bottom-2 rounded-lg border border-slate-900/60 ${item.severity.className}`}
                          style={{
                            left: `${item.left}%`,
                            width: `${item.width}%`,
                          }}
                          title={`${item.notam.number ?? item.notam.id} • ${formatUtcRangeWithSuffix(item.notam.start_at, item.notam.end_at)}`}
                        >
                          <span className="sr-only">{item.notam.number}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Top 3 por severidad</p>
                  {topNotams.length === 0 ? (
                    <p className="text-xs text-slate-500">Sin NOTAM en esta estación</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {topNotams.map((notam) => {
                        const category = notam.category ? categoryIndex.get(notam.category) : null;
                        return (
                          <li
                            key={notam.id}
                            className="relative flex h-full flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 pb-3 pt-4"
                          >
                            <SeverityBadge
                              value={notam.severity}
                              className="absolute right-3 top-3 px-2 py-0.5 text-[10px] tracking-[0.18em]"
                            />
                            <div className="pr-16">
                              <p className="text-sm font-semibold text-slate-100">{notam.number ?? notam.id}</p>
                              <p className="text-xs text-slate-400">{category?.label ?? 'Sin categoría'}</p>
                              <p className="text-xs text-slate-400">
                                {formatUtcRangeWithSuffix(notam.start_at, notam.end_at)}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-300">
                                {getNotamSummarySnippet(notam, 140) || 'Sin descripción disponible'}
                              </p>
                            </div>
                            <div className="mt-auto flex justify-end">
                              <button
                                type="button"
                                className="rounded-full border border-sky-500/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200 transition hover:bg-slate-900/80"
                                onClick={() => onSelectStation(notam.icao)}
                              >
                                Detalles
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FavoritesView;
