import { useMemo } from 'react';
import FiltersBar from '../components/FiltersBar';
import type { Filters } from '../types/filters';
import type { Airport, Catalogs, Notam } from '../types/notam';
import type { StationSuggestion } from '../components/StationSearch';
import NotamCard from '../components/NotamCard';

interface CardsViewProps {
  notams: Notam[];
  airports: Airport[];
  catalogs?: Catalogs | null;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  stationSuggestions: StationSuggestion[];
  favorites: string[];
  onToggleFavorite: (icao: string) => void;
  onViewOnMap?: (notam: Notam) => void;
  onSelectStation: (icao: string) => void;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function CardsView({
  notams,
  airports,
  catalogs,
  filters,
  onFiltersChange,
  onClearFilters,
  stationSuggestions,
  favorites,
  onToggleFavorite,
  onViewOnMap,
  onSelectStation,
  loading,
  error,
  onRetry,
}: CardsViewProps) {
  const airportIndex = useMemo(() => new Map(airports.map((airport) => [airport.icao, airport])), [airports]);
  const categoryIndex = useMemo(() => new Map((catalogs?.categories ?? []).map((category) => [category.id, category])), [catalogs]);

  const ordered = useMemo(() => [...notams].sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0)), [notams]);

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
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">{ordered.length} NOTAM</p>
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

      {ordered.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-300">
          No hay NOTAM para los filtros seleccionados.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {ordered.map((notam) => {
            const airport = airportIndex.get(notam.icao);
            const category = notam.category ? categoryIndex.get(notam.category) : null;
            return (
              <NotamCard
                key={notam.id}
                notam={notam}
                airportName={airport?.name}
                categoryLabel={category?.label ?? null}
                categoryColor={category?.color ?? undefined}
                isFavorite={favorites.includes(notam.icao)}
                onToggleFavorite={onToggleFavorite}
                onViewOnMap={onViewOnMap}
                onSeeAllFromStation={onSelectStation}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CardsView;
