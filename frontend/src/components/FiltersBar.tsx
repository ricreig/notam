import clsx from 'clsx';
import { useMemo } from 'react';
import StationSearch, { type StationSuggestion } from './StationSearch';
import type { Catalogs } from '../types/notam';
import { DEFAULT_FILTERS, type Filters, RELATIVE_HOURS_OPTIONS } from '../types/filters';
import { mapSeverity } from '../utils/severity';

interface FiltersBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  catalogs?: Catalogs | null;
  onClear: () => void;
  stationSuggestions?: StationSuggestion[];
}

function formatUtcLabel(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleString('es-MX', {
    timeZone: 'UTC',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })} UTC`;
}

function buildDailyRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export function FiltersBar({ filters, onChange, catalogs, onClear, stationSuggestions = [] }: FiltersBarProps) {
  const categories = catalogs?.categories ?? [];

  const handleModeChange = (mode: Filters['mode']) => {
    if (mode === filters.mode) return;
    if (mode === 'RELATIVE') {
      onChange({ ...filters, mode, hours: filters.hours ?? DEFAULT_FILTERS.hours, from: null, to: null });
    } else if (mode === 'ABSOLUTE') {
      onChange({ ...filters, mode, from: filters.from ?? null, to: filters.to ?? null });
    } else {
      onChange({ ...filters, mode, from: null, to: null });
    }
  };

  const severityLegend = useMemo(
    () => [0, 30, 55, 80].map((value) => mapSeverity(value)),
    [],
  );

  const dailyRange = useMemo(() => buildDailyRange(), []);

  return (
    <section className="flex flex-wrap gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
      <div className="flex flex-1 flex-col gap-2 min-w-[220px]">
        <span className="font-semibold uppercase tracking-wide text-slate-400">Modo de tiempo</span>
        <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/70 p-1 text-sm">
          {(
            [
              { label: 'Relativo', value: 'RELATIVE' as const },
              { label: 'Absoluto', value: 'ABSOLUTE' as const },
              { label: 'Hoy UTC', value: 'DAILY' as const },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleModeChange(option.value)}
              className={clsx(
                'rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950',
                filters.mode === option.value
                  ? 'bg-sky-500 text-white shadow shadow-sky-500/40'
                  : 'text-slate-200 hover:bg-slate-800',
              )}
              aria-pressed={filters.mode === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        {filters.mode === 'RELATIVE' && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {RELATIVE_HOURS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange({ ...filters, hours: option })}
                  className={clsx(
                    'rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors',
                    filters.hours === option
                      ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                      : 'border-slate-700 bg-slate-900 hover:border-slate-500',
                  )}
                  aria-pressed={filters.hours === option}
                >
                  {option}h
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Mostrando NOTAM publicados en las últimas {filters.hours ?? DEFAULT_FILTERS.hours} horas (UTC).
            </p>
          </div>
        )}
        {filters.mode === 'ABSOLUTE' && (
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col">
                <span className="font-semibold uppercase tracking-wide text-slate-400">Desde (UTC)</span>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={filters.from ? filters.from.slice(0, 16) : ''}
                  onChange={(event) => {
                    const iso = event.target.value ? new Date(event.target.value).toISOString() : null;
                    onChange({ ...filters, from: iso, mode: 'ABSOLUTE' });
                  }}
                />
              </label>
              <label className="flex flex-col">
                <span className="font-semibold uppercase tracking-wide text-slate-400">Hasta (UTC)</span>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={filters.to ? filters.to.slice(0, 16) : ''}
                  onChange={(event) => {
                    const iso = event.target.value ? new Date(event.target.value).toISOString() : null;
                    onChange({ ...filters, to: iso, mode: 'ABSOLUTE' });
                  }}
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              Selecciona un rango exacto en hora local; lo convertimos automáticamente a UTC para la consulta.
            </p>
          </div>
        )}
        {filters.mode === 'DAILY' && (
          <div className="space-y-1 text-xs">
            <p className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
              {`${formatUtcLabel(dailyRange.start.toISOString())} → ${formatUtcLabel(dailyRange.end.toISOString())}`}
            </p>
            <p className="text-[11px] text-slate-400">Mostrando únicamente los NOTAM activos durante el día UTC actual.</p>
          </div>
        )}
      </div>

      <div className="flex min-w-[200px] flex-1 flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Categoría
          <select
            value={filters.category ?? 'all'}
            onChange={(event) =>
              onChange({ ...filters, category: (event.target.value as Filters['category']) ?? 'all' })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <StationSearch
          value={filters.stationQuery ?? ''}
          onImmediateChange={(value) => onChange({ ...filters, stationQuery: value })}
          onDebouncedChange={(value) => onChange({ ...filters, stationQuery: value })}
          suggestions={stationSuggestions}
        />
      </div>

      <div className="flex min-w-[200px] flex-col gap-2">
        <button
          type="button"
          className="self-start rounded-full border border-slate-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          onClick={() => onClear()}
        >
          Limpiar filtros
        </button>
        <details className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-xs">
          <summary className="cursor-pointer text-slate-200">Leyenda de severidad</summary>
          <ul className="mt-2 space-y-1">
            {severityLegend.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span className={clsx('inline-block h-2 w-6 rounded-full', item.className.replace(' text-white', ''))} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}

export default FiltersBar;
