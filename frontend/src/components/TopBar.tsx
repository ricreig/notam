import { useState } from 'react';
import { useUTCClock } from '../hooks/useUTCClock';
import { useDashboardStore } from '../store/useDashboardStore';
import TimeSelector from './TimeSelector';
import GlobalCategoryFilter from './filters/GlobalCategoryFilter';

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
    <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="mx-auto flex h-16 items-center gap-4 px-6">
        <div className="text-left">
          <p className="text-xs uppercase tracking-wide text-slate-400">UTC</p>
          <p className="text-lg font-mono">{clock}</p>
        </div>
        <button
          className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          onClick={() => refreshNotams({})}
        >
          Refresh
        </button>
        <div className="flex flex-1 items-center gap-4">
          <TimeSelector />
          <GlobalCategoryFilter />
        </div>
        <div className="flex items-center gap-2">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                view.mode === option.value ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => setMode(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          onClick={() => setIsAdding(true)}
        >
          Add Airport
        </button>
        {isAdding && <AddAirportDialog onClose={() => setIsAdding(false)} />}
      </div>
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
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/70">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-sky-500/10"
      >
        <h2 className="text-lg font-semibold text-slate-100">Add airport</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-1 text-sm">
            <span className="text-slate-400">ICAO</span>
            <input
              value={icao}
              onChange={(event) => setIcao(event.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="MMMX"
              maxLength={4}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-400">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Aeropuerto"
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-400">Latitude</span>
            <input
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              type="number"
              step="0.0001"
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-400">Longitude</span>
            <input
              value={lon}
              onChange={(event) => setLon(event.target.value)}
              type="number"
              step="0.0001"
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
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
            className="rounded border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
