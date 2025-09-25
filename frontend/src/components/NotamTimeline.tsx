import { format } from 'date-fns';
import { Notam } from '../types/notam';

interface NotamTimelineProps {
  notams: Notam[];
}

export default function NotamTimeline({ notams }: NotamTimelineProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Timeline</h3>
      <ol className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-700">
        {notams
          .slice()
          .sort((a, b) => (a.start_at ?? '').localeCompare(b.start_at ?? ''))
          .map((notam) => (
            <li key={notam.id} className="relative pl-12">
              <span className="absolute left-2 top-1 h-3 w-3 rounded-full border-2 border-slate-900 bg-sky-500" aria-hidden />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{notam.number}</span>
                <span className="text-xs text-slate-500">
                  {notam.start_at ? format(new Date(notam.start_at), 'dd MMM HH:mm') : 'TBD'}Z →{' '}
                  {notam.end_at ? format(new Date(notam.end_at), 'dd MMM HH:mm') : 'TBD'}Z
                </span>
              </div>
              <p className="text-sm text-slate-200">{notam.text}</p>
            </li>
          ))}
      </ol>
    </div>
  );
}
