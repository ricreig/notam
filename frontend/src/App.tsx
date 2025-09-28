import { useEffect, useMemo, useState } from 'react';
import TopBar, { type ViewKey } from './components/TopBar';
import GlobeView from './views/Globe';
import ListView from './views/List';
import CardsView from './views/Cards';
import FavoritesView from './views/Favorites';
import useCatalogs from './hooks/useCatalogs';
import useAirports from './hooks/useAirports';
import useNotams from './hooks/useNotams';
import { DEFAULT_FILTERS, type Filters } from './types/filters';
import type { Notam } from './types/notam';

const FAVORITES_KEY = 'notam:favorites:icao';
const ICAO_REGEX = /^[A-Z]{4}$/i;

function loadFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((item) => String(item).toUpperCase()).filter((item) => ICAO_REGEX.test(item)) : [];
  } catch (error) {
    console.warn('Error parsing favorites from storage', error);
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export default function App() {
  const [view, setView] = useState<ViewKey>('globe');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [highlightedNotamId, setHighlightedNotamId] = useState<string | null>(null);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const { data: catalogs } = useCatalogs();
  const {
    data: airports,
    loading: airportsLoading,
    error: airportsError,
  } = useAirports();

  const trimmedStation = filters.stationQuery?.trim().toUpperCase() ?? '';
  const isIcaoQuery = ICAO_REGEX.test(trimmedStation);
  const applyStationFilter = !(view === 'favorites' && isIcaoQuery && !favorites.includes(trimmedStation));

  const {
    data: notams,
    loading: notamsLoading,
    error: notamsError,
    refetch: refetchNotams,
  } = useNotams(filters, { applyStationFilter });

  const airportIndex = useMemo(() => new Map(airports.map((airport) => [airport.icao, airport])), [airports]);

  const filteredNotams = useMemo(() => {
    const query = filters.stationQuery?.trim().toLowerCase() ?? '';
    if (!query) return notams;
    if (ICAO_REGEX.test(query.toUpperCase())) {
      return notams;
    }
    if (query.length < 3) return notams;
    return notams.filter((notam) => {
      const airport = airportIndex.get(notam.icao);
      const icaoMatch = notam.icao.toLowerCase().startsWith(query);
      const nameMatch = (airport?.name ?? '').toLowerCase().includes(query);
      return icaoMatch || nameMatch;
    });
  }, [notams, filters.stationQuery, airportIndex]);

  const favoritesDataset = useMemo(() => {
    if (!filters.stationQuery) return notams;
    const trimmed = filters.stationQuery.trim().toUpperCase();
    if (ICAO_REGEX.test(trimmed) && favorites.includes(trimmed)) {
      return notams.filter((notam) => notam.icao === trimmed);
    }
    return notams;
  }, [notams, filters.stationQuery, favorites]);

  const stationSuggestions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const notam of notams) {
      counts.set(notam.icao, (counts.get(notam.icao) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([icao, count]) => ({ icao, name: airportIndex.get(icao)?.name ?? null, count }));
  }, [notams, airportIndex]);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setHighlightedNotamId(null);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setHighlightedNotamId(null);
  };

  const toggleFavorite = (icao: string) => {
    const normalized = icao.toUpperCase();
    setFavorites((prev) =>
      prev.includes(normalized) ? prev.filter((item) => item !== normalized) : [...prev, normalized],
    );
  };

  const handleSelectStation = (icao: string) => {
    const upper = icao.toUpperCase();
    setFilters((prev) => ({ ...prev, stationQuery: upper }));
    setView('list');
    setHighlightedNotamId(null);
  };

  const handleViewOnMap = (notam: Notam) => {
    setFilters((prev) => ({ ...prev, stationQuery: notam.icao }));
    setView('globe');
    setHighlightedNotamId(notam.id);
  };

  const globalLoading = notamsLoading || airportsLoading;
  const [showGlobalLoading, setShowGlobalLoading] = useState(globalLoading);

  useEffect(() => {
    if (globalLoading) {
      setShowGlobalLoading(true);
      return;
    }
    const timeout = window.setTimeout(() => setShowGlobalLoading(false), 600);
    return () => window.clearTimeout(timeout);
  }, [globalLoading]);
  const globalError = notamsError || airportsError;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <TopBar currentView={view} onViewChange={setView} onRefresh={refetchNotams} />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-12">
        <div className="min-h-[1.5rem]">
          {showGlobalLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-400" role="status" aria-live="polite">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" aria-hidden="true" />
              Cargando datos…
            </div>
          )}
        </div>
        {globalError && (
          <p className="rounded-lg border border-rose-400 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
            Ocurrió un error al cargar la información. {globalError.message}
          </p>
        )}

        {view === 'globe' && (
          <GlobeView
            notams={notams}
            filteredNotams={filteredNotams}
            airports={airports}
            catalogs={catalogs}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            stationSuggestions={stationSuggestions}
            loading={notamsLoading}
            error={notamsError}
            onRetry={refetchNotams}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectStation={handleSelectStation}
            selectedNotamId={highlightedNotamId}
            onSelectedNotamChange={setHighlightedNotamId}
          />
        )}

        {view === 'list' && (
          <ListView
            notams={filteredNotams}
            airports={airports}
            catalogs={catalogs}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            stationSuggestions={stationSuggestions}
            loading={notamsLoading}
            error={notamsError}
            onRetry={refetchNotams}
          />
        )}

        {view === 'cards' && (
          <CardsView
            notams={filteredNotams}
            airports={airports}
            catalogs={catalogs}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            stationSuggestions={stationSuggestions}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onViewOnMap={handleViewOnMap}
            onSelectStation={handleSelectStation}
            loading={notamsLoading}
            error={notamsError}
            onRetry={refetchNotams}
          />
        )}

        {view === 'favorites' && (
          <FavoritesView
            notams={favoritesDataset}
            airports={airports}
            catalogs={catalogs}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            stationSuggestions={stationSuggestions}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectStation={handleSelectStation}
            loading={notamsLoading}
            error={notamsError}
            onRetry={refetchNotams}
          />
        )}
      </main>
    </div>
  );
}
