import { useState } from 'react';
import { useUTCClock } from '../hooks/useUTCClock';
import { useDashboardStore } from '../store/useDashboardStore';
import TimeSelector from './TimeSelector';
import GlobalCategoryFilter from './filters/GlobalCategoryFilter';
import logo1x from '../assets/SENEAM_Logo_H.webp';
import logo2x from '../assets/SENEAM_Logo_H@2x.webp';

const viewOptions: { label: string; value: 'globe' | 'list' | 'cards' }[] = [
  { label: 'Globe', value: 'globe' },
  { label: 'List', value: 'list' },
  { label: 'Cards', value: 'cards' },
];

export default function TopBar() {
  const clock = useUTCClock();
  const [isAdding, setIsAdding] = useState(false);
  const { view, setMode, refreshNotams } = useDashboardStore((state) => ({
    view: state.view,
    setMode: state.setMode,
    refreshNotams: state.refreshNotams,
  }));

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center justify-start">
            <a href="/" className="inline-flex items-center" aria-label="Inicio SENEAM">
              <img
                src={logo1x}
                srcSet={`${logo1x} 260w, ${logo2x} 520w`}
                sizes="(max-width: 768px) 180px, 260px"
                alt="SENEAM"
                className="h-auto max-h-16 w-auto"
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center text-center">
            <p className="text-base font-semibold uppercase tracking-[0.2em] text-slate-200 sm:text-lg">
              NOTAM Operational Dashboard
            </p>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/70 p-1 shadow-inner shadow-slate-900/40">
              {viewOptions.map((option) => (
                <button
                  key={option.value}
                  className={`rounded-full px-4 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                    view.mode === option.value
                      ? 'bg-sky-500 text-white shadow shadow-sky-500/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  onClick={() => setMode(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-slate-950"
              onClick={() => setIsAdding(true)}
            >
              Add Airport
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-lg shadow-slate-900/30 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-widest text-slate-500">UTC</p>
              <p className="font-mono text-lg text-slate-100">{clock}</p>
            </div>
            <button
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              onClick={() => refreshNotams({})}
            >
              Refresh data
            </button>
          </div>
          <div className="flex flex-1 flex-wrap items-stretch gap-4">
            <div className="min-w-[260px] flex-1">
              <TimeSelector />
            </div>
            <div className="min-w-[220px]">
              <GlobalCategoryFilter />
            </div>
          </div>
        </div>
      </div>
      {isAdding && <AddAirportDialog onClose={() => setIsAdding(false)} />}
    </header>
  );
}

function AddAirportDialog({ onClose }: { onClose: () => void }) {
  const [icao, setIcao] = useState('');
  const [name, setName] = useState('');
  const [lat, setLat] = useState('0');
  const [lon, setLon] = useState('0');
  const [base, setBase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const addAirport = useDashboardStore((state) => state.addAirport);
  const titleId = 'add-airport-title';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await addAirport({
        icao: icao.toUpperCase(),
        name,
        lat: Number(lat),
        lon: Number(lon),
        base,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-sky-500/10"
      >
        <h2 id={titleId} className="text-lg font-semibold text-slate-100">
          Add airport
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-1 text-sm" htmlFor="airport-icao">
            <span className="text-slate-400">ICAO</span>
            <input
              id="airport-icao"
              value={icao}
              onChange={(event) => setIcao(event.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="MMMX"
              maxLength={4}
              required
            />
          </label>
          <label className="space-y-1 text-sm" htmlFor="airport-name">
            <span className="text-slate-400">Name</span>
            <input
              id="airport-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Aeropuerto"
              required
            />
          </label>
          <label className="space-y-1 text-sm" htmlFor="airport-latitude">
            <span className="text-slate-400">Latitude</span>
            <input
              id="airport-latitude"
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              type="number"
              step="0.0001"
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </label>
          <label className="space-y-1 text-sm" htmlFor="airport-longitude">
            <span className="text-slate-400">Longitude</span>
            <input
              id="airport-longitude"
              value={lon}
              onChange={(event) => setLon(event.target.value)}
              type="number"
              step="0.0001"
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300" htmlFor="airport-base">
          <input
            id="airport-base"
            type="checkbox"
            checked={base}
            onChange={(event) => setBase(event.target.checked)}
            className="rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500"
          />
          Mark as base
        </label>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            className="rounded border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
