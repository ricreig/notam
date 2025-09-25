import { useDashboardStore } from '../store/useDashboardStore';
import { clsx } from 'clsx';

const modes: { value: 'absolute' | 'relative' | 'daily'; label: string }[] = [
  { value: 'absolute', label: 'Absolute' },
  { value: 'relative', label: 'Relative' },
  { value: 'daily', label: 'Daily' },
];

export default function TimeSelector() {
  const view = useDashboardStore((state) => state.view);
  const refreshNotams = useDashboardStore((state) => state.refreshNotams);
  const setTimeMode = useDashboardStore((state) => state.setTimeMode);
  const setAbsoluteRange = useDashboardStore((state) => state.setAbsoluteRange);
  const setRelativeHours = useDashboardStore((state) => state.setRelativeHours);
  const setDailyWindow = useDashboardStore((state) => state.setDailyWindow);

  const handleModeChange = (mode: 'absolute' | 'relative' | 'daily') => {
    setTimeMode(mode);
    refreshNotams({});
  };

  const handleAbsoluteChange = (field: 'from' | 'to', value: string) => {
    const current = useDashboardStore.getState().view.absoluteRange;
    const updated = { ...current, [field]: value } as { from: string | null; to: string | null };
    setAbsoluteRange(updated);
    refreshNotams({ from: updated.from ?? undefined, to: updated.to ?? undefined });
  };

  const handleRelativeChange = (hours: number) => {
    setRelativeHours(hours);
    refreshNotams({});
  };

  const handleDailyChange = (field: 'start' | 'end', value: string) => {
    const current = useDashboardStore.getState().view.dailyWindow;
    setDailyWindow({ ...current, [field]: value });
    refreshNotams({});
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
      <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-400">Time Selector</div>
      <div className="flex gap-2">
        {modes.map((mode) => (
          <button
            key={mode.value}
            className={clsx(
              'rounded px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500',
              view.timeMode === mode.value ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
            )}
            onClick={() => handleModeChange(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      {view.timeMode === 'absolute' && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="space-y-1">
            <span className="text-slate-400">From</span>
            <input
              type="datetime-local"
              value={view.absoluteRange.from ?? ''}
              onChange={(event) => handleAbsoluteChange('from', event.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">To</span>
            <input
              type="datetime-local"
              value={view.absoluteRange.to ?? ''}
              onChange={(event) => handleAbsoluteChange('to', event.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
        </div>
      )}
      {view.timeMode === 'relative' && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Hours</span>
          <input
            type="range"
            min={1}
            max={72}
            value={view.relativeHours}
            onChange={(event) => handleRelativeChange(Number(event.target.value))}
            className="w-40 accent-sky-500"
          />
          <span className="font-mono text-sm text-slate-100">{view.relativeHours}h</span>
        </div>
      )}
      {view.timeMode === 'daily' && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="space-y-1">
            <span className="text-slate-400">Start</span>
            <input
              type="time"
              value={view.dailyWindow.start}
              onChange={(event) => handleDailyChange('start', event.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">End</span>
            <input
              type="time"
              value={view.dailyWindow.end}
              onChange={(event) => handleDailyChange('end', event.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
        </div>
      )}
    </div>
  );
}
