import { useEffect, useMemo, useState } from 'react';
import MapGL, { Marker, NavigationControl, ViewState } from 'react-map-gl';
import clsx from 'clsx';
import FiltersBar from '../components/FiltersBar';
import type { Filters } from '../types/filters';
import type { Airport, Catalogs, Notam } from '../types/notam';
import type { StationSuggestion } from '../components/StationSearch';
import NotamCard from '../components/NotamCard';
import SeverityBadge from '../components/SeverityBadge';
import { getNotamSummarySnippet } from '../utils/notamText';
import { mapSeverity } from '../utils/severity';

interface GlobeViewProps {
  notams: Notam[];
  filteredNotams: Notam[];
  airports: Airport[];
  catalogs?: Catalogs | null;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  stationSuggestions: StationSuggestion[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  favorites: string[];
  onToggleFavorite: (icao: string) => void;
  onSelectStation: (icao: string) => void;
  selectedNotamId?: string | null;
  onSelectedNotamChange?: (id: string | null) => void;
}

const INITIAL_VIEW: ViewState = {
  longitude: -99.1332,
  latitude: 19.4326,
  zoom: 4,
  bearing: 0,
  pitch: 30,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

interface MarkerInfo {
  icao: string;
  latitude: number;
  longitude: number;
  count: number;
  maxSeverity: number;
  previewNotamId: string | null;
  previewSummary: string | null;
  previewStartAt: number | null;
}

export function GlobeView({
  notams,
  filteredNotams,
  airports,
  catalogs,
  filters,
  onFiltersChange,
  onClearFilters,
  stationSuggestions,
  loading,
  error,
  onRetry,
  favorites,
  onToggleFavorite,
  onSelectStation,
  selectedNotamId: externalSelectedNotamId,
  onSelectedNotamChange,
}: GlobeViewProps) {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW);
  const [selectedNotamId, setSelectedNotamId] = useState<string | null>(externalSelectedNotamId ?? null);

  useEffect(() => {
    if (externalSelectedNotamId !== undefined) {
      setSelectedNotamId(externalSelectedNotamId);
    }
  }, [externalSelectedNotamId]);

  const markers = useMemo<MarkerInfo[]>(() => {
    const byIcao = new Map<string, MarkerInfo>();
    const airportIndex = new Map(airports.map((airport) => [airport.icao, airport]));
    for (const notam of notams) {
      const airport = airportIndex.get(notam.icao);
      const coords = notam.coords_geojson?.coordinates;
      const latitude = coords?.[1] ?? airport?.lat;
      const longitude = coords?.[0] ?? airport?.lon;
      if (latitude == null || longitude == null) continue;
      const existing = byIcao.get(notam.icao);
      const severity = notam.severity ?? 0;
      const summary = getNotamSummarySnippet(notam, 160);
      const startAt = notam.start_at ? new Date(notam.start_at).getTime() : null;
      if (existing) {
        existing.count += 1;
        if (
          severity > existing.maxSeverity ||
          (severity === existing.maxSeverity && (startAt ?? -Infinity) > (existing.previewStartAt ?? -Infinity)) ||
          existing.previewNotamId === null
        ) {
          existing.previewNotamId = notam.id;
          existing.previewSummary = summary;
          existing.previewStartAt = startAt;
        }
        existing.maxSeverity = Math.max(existing.maxSeverity, severity);
      } else {
        byIcao.set(notam.icao, {
          icao: notam.icao,
          latitude,
          longitude,
          count: 1,
          maxSeverity: severity,
          previewNotamId: notam.id,
          previewSummary: summary,
          previewStartAt: startAt,
        });
      }
    }
    return Array.from(byIcao.values());
  }, [notams, airports]);

  const selectedNotam = useMemo(() => filteredNotams.find((item) => item.id === selectedNotamId) ?? null, [filteredNotams, selectedNotamId]);

  const categories = useMemo(() => catalogs?.categories ?? [], [catalogs]);
  const categoryIndex = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const airportIndex = useMemo(() => new Map(airports.map((airport) => [airport.icao, airport])), [airports]);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  return (
    <div className="space-y-6">
      <FiltersBar
        filters={filters}
        onChange={onFiltersChange}
        catalogs={catalogs}
        onClear={onClearFilters}
        stationSuggestions={stationSuggestions}
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <div className="relative h-[520px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60 shadow-xl shadow-slate-950/40">
            {!token ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Configura <code className="mx-1 rounded bg-slate-800 px-1">VITE_MAPBOX_TOKEN</code> para habilitar el mapa.
              </div>
            ) : (
              <MapGL
                {...viewState}
                mapboxAccessToken={token}
                onMove={(event) => {
                  setViewState(event.viewState as ViewState);
                }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                style={{ width: '100%', height: '100%' }}
              >
                <NavigationControl position="top-left" showCompass={false} />
                {markers.map((marker) => {
                  const severity = mapSeverity(marker.maxSeverity);
                  return (
                    <Marker key={marker.icao} longitude={marker.longitude} latitude={marker.latitude} anchor="bottom">
                      <button
                        type="button"
                        className={clsx(
                          'group flex -translate-y-2 flex-col items-center gap-1 text-xs font-semibold text-slate-100 focus:outline-none',
                          selectedNotam?.icao === marker.icao && 'text-sky-300',
                        )}
                        onClick={() => {
                          setViewState((current) => ({
                            ...current,
                            longitude: marker.longitude,
                            latitude: marker.latitude,
                            zoom: Math.max(current.zoom ?? INITIAL_VIEW.zoom, 6),
                          }));
                          const notamForStation = filteredNotams
                            .filter((item) => item.icao === marker.icao)
                            .sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0));
                          if (notamForStation.length > 0) {
                            const id = notamForStation[0].id;
                            setSelectedNotamId(id);
                            onSelectedNotamChange?.(id);
                          } else {
                            const fallback = notams.find((item) => item.icao === marker.icao);
                            const id = fallback?.id ?? null;
                            setSelectedNotamId(id);
                            onSelectedNotamChange?.(id);
                          }
                        }}
                        title={marker.previewSummary ?? undefined}
                      >
                        <span className="rounded-full bg-slate-900/80 px-2 py-1 shadow-lg shadow-slate-950/50">
                          {marker.icao}
                        </span>
                        <span
                          className={clsx(
                            'flex h-6 min-w-[2.5rem] items-center justify-center rounded-full px-2 text-xs font-bold uppercase shadow-lg shadow-slate-950/50 transition',
                            severity.className,
                          )}
                        >
                          {marker.count}
                        </span>
                      </button>
                    </Marker>
                  );
                })}
              </MapGL>
            )}
          </div>
        </div>
        <aside className="space-y-4 xl:col-span-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Resultados</p>
              <p className="text-lg font-semibold text-slate-100">{filteredNotams.length} NOTAM</p>
            </div>
            {loading && <p className="text-xs text-slate-400">Cargando datos…</p>}
            {error && (
              <div className="flex items-center gap-3 text-xs text-rose-300">
                Error al cargar.
                {onRetry && (
                  <button
                    type="button"
                    className="rounded border border-rose-400 px-2 py-1 text-[11px] uppercase tracking-wide"
                    onClick={onRetry}
                  >
                    Reintentar
                  </button>
                )}
              </div>
            )}
          </header>

          {filteredNotams.length === 0 && !loading ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-300">
              No hay NOTAM para los filtros seleccionados.
            </div>
          ) : null}

          {selectedNotam && (
            <NotamCard
              notam={selectedNotam}
              airportName={airportIndex.get(selectedNotam.icao)?.name}
              categoryLabel={selectedNotam.category ? categoryIndex.get(selectedNotam.category)?.label ?? selectedNotam.category : null}
              categoryColor={selectedNotam.category ? categoryIndex.get(selectedNotam.category)?.color ?? undefined : undefined}
              isFavorite={favorites.includes(selectedNotam.icao)}
              onToggleFavorite={onToggleFavorite}
              onSeeAllFromStation={onSelectStation}
              expanded
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredNotams.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                title={getNotamSummarySnippet(item, 160)}
              >
                <p className="text-sm font-semibold text-slate-100">{item.number ?? item.id}</p>
                <p className="text-xs text-slate-400">{item.icao}</p>
                <div className="mt-2">
                  <SeverityBadge value={item.severity} />
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  {getNotamSummarySnippet(item, 120) || 'Sin descripción disponible'}
                </p>
                <button
                  type="button"
                  className="mt-3 text-xs font-semibold uppercase tracking-wide text-sky-300 hover:text-sky-200"
                  onClick={() => {
                    setSelectedNotamId(item.id);
                    onSelectedNotamChange?.(item.id);
                  }}
                >
                  Ver detalle
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default GlobeView;
