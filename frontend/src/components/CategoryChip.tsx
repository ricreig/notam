import clsx from 'clsx';

export interface CategoryChipProps {
  label: string;
  color?: string | null;
  className?: string;
}

function getContrastText(color?: string | null) {
  if (!color) return 'text-slate-900';
  const hex = color.replace('#', '');
  if (hex.length !== 6) return 'text-slate-900';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? 'text-slate-900' : 'text-white';
}

export function CategoryChip({ label, color, className }: CategoryChipProps) {
  const textClass = getContrastText(color);
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm',
        textClass,
        className,
      )}
      style={{ backgroundColor: color ?? '#CBD5F5' }}
    >
      {label}
    </span>
  );
}

export default CategoryChip;
