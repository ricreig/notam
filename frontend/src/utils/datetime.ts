export function formatUtc(value?: string | null, fallback = '—') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString('es-MX', {
    timeZone: 'UTC',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatUtcRange(start?: string | null, end?: string | null, fallback = '—') {
  return `${formatUtc(start, fallback)} → ${formatUtc(end, fallback)}`;
}

export function formatUtcWithSuffix(value?: string | null, fallback = '—') {
  const formatted = formatUtc(value, fallback);
  if (formatted === fallback) return fallback;
  return `${formatted} UTC`;
}

export function formatUtcRangeWithSuffix(start?: string | null, end?: string | null, fallback = '—') {
  return `${formatUtcWithSuffix(start, fallback)} → ${formatUtcWithSuffix(end, fallback)}`;
}
