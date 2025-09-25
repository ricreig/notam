import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Airport, Catalogs, Notam } from '../types/notam';
import { fetchAirports, fetchCatalogs, fetchNotams, NotamFilters, createAirport } from '../api/client';

export interface ViewState {
  mode: 'globe' | 'list' | 'cards';
  timeMode: 'absolute' | 'relative' | 'daily';
  absoluteRange: { from: string | null; to: string | null };
  relativeHours: number;
  dailyWindow: { start: string; end: string };
  categoryFilter: string | null;
}

interface DashboardState {
  airports: Airport[];
  notams: Notam[];
  catalogs: Catalogs | null;
  loading: boolean;
  view: ViewState;
  favorites: string[];
  savedViews: Record<string, ViewState>;
  fetchInitial: () => Promise<void>;
  refreshNotams: (filters?: NotamFilters) => Promise<void>;
  addAirport: (airport: Airport) => Promise<void>;
  setMode: (mode: ViewState['mode']) => void;
  setCategoryFilter: (category: string | null) => void;
  setTimeMode: (mode: ViewState['timeMode']) => void;
  setAbsoluteRange: (range: { from: string | null; to: string | null }) => void;
  setRelativeHours: (hours: number) => void;
  setDailyWindow: (window: { start: string; end: string }) => void;
  toggleFavorite: (notamId: string) => void;
  saveView: (name: string) => void;
  loadView: (name: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      airports: [],
      notams: [],
      catalogs: null,
      loading: false,
      favorites: [],
      savedViews: {},
      view: {
        mode: 'globe',
        timeMode: 'relative',
        absoluteRange: { from: null, to: null },
        relativeHours: 24,
        dailyWindow: { start: '06:00', end: '18:00' },
        categoryFilter: null,
      },
      fetchInitial: async () => {
        set({ loading: true });
        const [airports, catalogs] = await Promise.all([fetchAirports(), fetchCatalogs()]);
        set({ airports, catalogs, loading: false });
        await get().refreshNotams({});
      },
      refreshNotams: async (filters = {}) => {
        set({ loading: true });
        const state = get();
        const derivedFilters: NotamFilters = {
          ...filters,
        };
        if (state.view.categoryFilter) {
          derivedFilters.cat = state.view.categoryFilter;
        }
        const notams = await fetchNotams(derivedFilters);
        set({ notams, loading: false });
      },
      addAirport: async (airport) => {
        const created = await createAirport(airport);
        set((state) => ({ airports: [...state.airports.filter((a) => a.icao !== created.icao), created] }));
      },
      setMode: (mode) => set((state) => ({ view: { ...state.view, mode } })),
      setCategoryFilter: (category) => set((state) => ({ view: { ...state.view, categoryFilter: category } })),
      setTimeMode: (mode) => set((state) => ({ view: { ...state.view, timeMode: mode } })),
      setAbsoluteRange: (range) =>
        set((state) => ({ view: { ...state.view, absoluteRange: range, timeMode: 'absolute' } })),
      setRelativeHours: (hours) =>
        set((state) => ({ view: { ...state.view, relativeHours: hours, timeMode: 'relative' } })),
      setDailyWindow: (window) =>
        set((state) => ({ view: { ...state.view, dailyWindow: window, timeMode: 'daily' } })),
      toggleFavorite: (notamId) =>
        set((state) => ({
          favorites: state.favorites.includes(notamId)
            ? state.favorites.filter((id) => id !== notamId)
            : [...state.favorites, notamId],
        })),
      saveView: (name) =>
        set((state) => ({
          savedViews: {
            ...state.savedViews,
            [name]: state.view,
          },
        })),
      loadView: (name) => {
        const view = get().savedViews[name];
        if (view) {
          set({ view });
        }
      },
    }),
    {
      name: 'notam-dashboard-store',
      partialize: (state) => ({
        favorites: state.favorites,
        savedViews: state.savedViews,
        view: state.view,
      }),
    },
  ),
);
