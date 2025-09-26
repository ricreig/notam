import { useDashboardStore } from '../../store/useDashboardStore';

export default function GlobalCategoryFilter() {
  const catalogs = useDashboardStore((state) => state.catalogs);
  const category = useDashboardStore((state) => state.view.categoryFilter);
  const setCategory = useDashboardStore((state) => state.setCategoryFilter);
  const refresh = useDashboardStore((state) => state.refreshNotams);

  const handleChange = (value: string) => {
    const next = value === 'all' ? null : value;
    setCategory(next);
    refresh({});
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm">
      <label htmlFor="global-category" className="text-xs uppercase tracking-wide text-slate-400">
        Global category
      </label>
      <select
        id="global-category"
        name="global-category"
        value={category ?? 'all'}
        onChange={(event) => handleChange(event.target.value)}
        className="min-w-[200px] rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <option value="all">All categories</option>
        {catalogs?.categories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
