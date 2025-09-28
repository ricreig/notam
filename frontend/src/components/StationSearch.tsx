import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

export interface StationSuggestion {
  icao: string;
  name?: string | null;
  count?: number;
}

interface StationSearchProps {
  value: string;
  onDebouncedChange: (value: string) => void;
  onImmediateChange?: (value: string) => void;
  suggestions?: StationSuggestion[];
  placeholder?: string;
  debounceMs?: number;
}

const DEFAULT_DEBOUNCE = 250;

export function StationSearch({
  value,
  onDebouncedChange,
  onImmediateChange,
  suggestions = [],
  placeholder = 'Buscar estación (ICAO o nombre)',
  debounceMs = DEFAULT_DEBOUNCE,
}: StationSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const debouncedCallbackRef = useRef(onDebouncedChange);
  const lastEmittedRef = useRef(value.trim());

  useEffect(() => {
    debouncedCallbackRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (lastEmittedRef.current === trimmed) {
      return undefined;
    }
    const handle = window.setTimeout(() => {
      lastEmittedRef.current = trimmed;
      debouncedCallbackRef.current(trimmed);
    }, debounceMs);
    return () => window.clearTimeout(handle);
  }, [inputValue, debounceMs]);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return suggestions.slice(0, 8);
    const lower = inputValue.toLowerCase();
    return suggestions
      .filter((item) =>
        item.icao.toLowerCase().startsWith(lower) || (item.name ?? '').toLowerCase().includes(lower),
      )
      .slice(0, 8);
  }, [inputValue, suggestions]);

  return (
    <div className="relative">
      <label className="flex flex-col text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
        Estación
        <input
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            onImmediateChange?.(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
          }}
          placeholder={placeholder}
          className="mt-1 w-full rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </label>
      {open && filteredSuggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
          {filteredSuggestions.map((item) => (
            <li key={item.icao}>
              <button
                type="button"
                className={clsx(
                  'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-800 focus:bg-slate-800',
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  setInputValue(item.icao);
                  onImmediateChange?.(item.icao);
                  const trimmed = item.icao.trim();
                  lastEmittedRef.current = trimmed;
                  debouncedCallbackRef.current(trimmed);
                  setOpen(false);
                }}
              >
                <span className="font-semibold">{item.icao}</span>
                <span className="text-xs text-slate-400">{item.name ?? '—'}{typeof item.count === 'number' ? ` · ${item.count}` : ''}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StationSearch;
