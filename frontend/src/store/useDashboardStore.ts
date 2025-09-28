import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Airport, Notam, Catalogs } from '../types/notam';
import { fetchAirports, fetchCatalogs, fetchNotams, createAirport } from '../api/client';
import type { NotamFilters } from '../api/client';

const asArray = (v: any) => (Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : []);

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
  catalogs: Catalogs | Record<string, unknown>;
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
      catalogs: {} as Record<string, unknown>,
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
        set({
		  airports: asArray(airports),
		  catalogs: (catalogs as any) ?? {},
		  loading: false,
		});
        await get().refreshNotams({});
      },

      refreshNotams: async (filters = {}) => {
        set({ loading: true });
        const state = get();
        const derived: Partial<NotamFilters> & Record<string, any> = { ...filters };
        if (state.view.categoryFilter) { derived.category = state.view.categoryFilter; derived.cat = state.view.categoryFilter; }
        const notams = await fetchNotams(derived as NotamFilters);
        set({ notams: asArray(notams), loading: false });
      },

      addAirport: async (airport) => {
        const created = await createAirport(airport);
        set((state) => ({
          airports: [...state.airports.filter((a) => a.icao !== created.icao), created],
        }));
      },

      setMode: (mode) => set((s) => ({ view: { ...s.view, mode } })),
      setCategoryFilter: (category) => set((s) => ({ view: { ...s.view, categoryFilter: category } })),
      setTimeMode: (mode) => set((s) => ({ view: { ...s.view, timeMode: mode } })),
      setAbsoluteRange: (range) =>
        set((s) => ({ view: { ...s.view, absoluteRange: range, timeMode: 'absolute' } })),
      setRelativeHours: (hours) =>
        set((s) => ({ view: { ...s.view, relativeHours: hours, timeMode: 'relative' } })),
      setDailyWindow: (window) =>
        set((s) => ({ view: { ...s.view, dailyWindow: window, timeMode: 'daily' } })),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),
      saveView: (name) => set((s) => ({ savedViews: { ...s.savedViews, [name]: s.view } })),
      loadView: (name) => {
        const v = get().savedViews[name];
        if (v) set({ view: v });
      },
    }),
    {
      name: 'notam-dashboard-store',
      partialize: (s) => ({ favorites: s.favorites, savedViews: s.savedViews, view: s.view }),
    },
  ),
);
