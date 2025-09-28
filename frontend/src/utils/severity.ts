export type SeverityLevel = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export function mapSeverity(value: number | null | undefined) {
  const v = typeof value === 'number' ? value : 0;
  if (v > 75) {
    return { label: 'Crítica' as SeverityLevel, className: 'bg-red-600 text-white' };
  }
  if (v > 50) {
    return { label: 'Alta' as SeverityLevel, className: 'bg-orange-500 text-white' };
  }
  if (v > 25) {
    return { label: 'Media' as SeverityLevel, className: 'bg-yellow-400 text-slate-900' };
  }
  return { label: 'Baja' as SeverityLevel, className: 'bg-emerald-500 text-white' };
}

export function severityColor(value: number | null | undefined) {
  return mapSeverity(value).className;
}

export function severityLabel(value: number | null | undefined) {
  return mapSeverity(value).label;
}
