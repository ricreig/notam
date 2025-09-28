import { useDashboardStore } from '../../store/useDashboardStore';

type Category = { id: string; label: string };

export default function GlobalCategoryFilter() {
  const catalogs = useDashboardStore((s) => s.catalogs);
  const categoryFilter = useDashboardStore((s) => s.view.categoryFilter);
  const setCategoryFilter = useDashboardStore((s) => s.setCategoryFilter);

  // Asegura arreglo tipado
  const categories: Category[] = Array.isArray((catalogs as any)?.categories)
    ? ((catalogs as any).categories as Category[])
    : [];

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value || null;
    setCategoryFilter(v);
  };

  return (
    <label className="flex w-full max-w-xs flex-col gap-1 text-sm">
      <span className="text-slate-400">Category</span>
      <select
        value={categoryFilter ?? ''}
        onChange={onChange}
        className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <option value="">All</option>
        {categories.map((item: Category) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
