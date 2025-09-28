import clsx from 'clsx';
import { mapSeverity } from '../utils/severity';

interface SeverityBadgeProps {
  value: number | null | undefined;
  className?: string;
}

export function SeverityBadge({ value, className }: SeverityBadgeProps) {
  const { label, className: baseClass } = mapSeverity(value);
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        baseClass,
        className,
      )}
      aria-label={`Severidad ${label}`}
    >
      {label}
    </span>
  );
}

export default SeverityBadge;
