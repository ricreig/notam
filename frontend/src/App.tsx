import { useEffect } from 'react';
import TopBar from './components/TopBar';
import { useDashboardStore } from './store/useDashboardStore';
import GlobeView from './components/GlobeView';
import AirportCard from './components/AirportCard';
import AffectedElements from './components/AffectedElements';
import NotamTimeline from './components/NotamTimeline';

function EmptyState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40">
      <p className="text-sm text-slate-400">Add an airport to start tracking NOTAMs.</p>
    </div>
  );
}

export default function App() {
  const { airports, notams, fetchInitial, loading, view } = useDashboardStore((state) => ({
    airports: state.airports,
    notams: state.notams,
    fetchInitial: state.fetchInitial,
    loading: state.loading,
    view: state.view,
  }));

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const notamsByAirport = airports.map((airport) => ({
    airport,
    notams: notams.filter((item) => item.icao === airport.icao),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <TopBar />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        {loading && <p className="text-sm text-slate-400">Loading...</p>}
        {!airports.length && !loading ? (
          <EmptyState />
        ) : (
          <>
            {view.mode === 'globe' && <GlobeView />}
            {view.mode !== 'globe' && (
              <div className="grid gap-6">
                {notamsByAirport.map(({ airport, notams }) => (
                  <AirportCard key={airport.icao} airport={airport} notams={notams} />
                ))}
              </div>
            )}
            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <AffectedElements notams={notams} />
              <NotamTimeline notams={notams} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
