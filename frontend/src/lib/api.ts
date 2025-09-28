const BASE = (import.meta.env.VITE_API_URL || "https://notam-api-ctareig.fly.dev").replace(/\/+$/,'');
export async function getJSON(path: string) {
  const url = `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
