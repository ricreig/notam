# NOTAM Dashboard Frontend

React + Vite single page app that consumes the public NOTAM API and presents synchronized Globe, List, Cards and Favorites views with shared filters.

## Getting started

```bash
npm install
npm run dev
```

Environment variables:

```ini
VITE_API_URL=https://notam-api-ctareig.fly.dev
VITE_MAPBOX_TOKEN=your_mapbox_token
```

`VITE_API_URL` defaults to the production API. A Mapbox token is required to render the globe view.

## Filters and query behaviour

A shared `FiltersBar` component sits above every view and emits requests to `/notams` with the exact parameters expected by the backend:

- **Time mode**
  - **Relativo** – discrete hours (2, 6, 12, 24, 48, 72, 168) mapped to the `hours` query param.
  - **Absoluto** – UTC `from`/`to` pickers that send ISO timestamps.
  - **Hoy UTC** – computes the current UTC day and sends `from`/`to` covering 00:00–24:00.
- **Categoría** – dropdown populated from `/catalogs`. Selecting a category adds `category=<id>` to the request; `Todas` omits the param.
- **Búsqueda de estación** – typeahead with debounce (250 ms).
  - If the input is exactly four alphabetic characters (e.g. `MMTJ`) the hook sends `icao=MMTJ` to the API.
  - For any other string (length ≥ 3) the results are filtered client-side by ICAO prefix and by the airport name (case insensitive) without changing the network query.
- **Limpiar filtros** restores the default state (`RELATIVE 24h`, all categories, no station query).

The current filters are reused across Globe, List, Cards and Favorites to keep the experience consistent.

## Severity scale

NOTAM severity values are mapped to textual labels and Tailwind utility colors everywhere (chips, map markers, timeline bars):

| Rango | Etiqueta | Color |
|-------|----------|-------|
| 0–25  | Baja     | `bg-emerald-500 text-white` |
| 26–50 | Media    | `bg-yellow-400 text-slate-900` |
| 51–75 | Alta     | `bg-orange-500 text-white` |
| >75   | Crítica  | `bg-red-600 text-white` |

A compact legend is available via a `<details>` disclosure inside the filters bar for accessibility.

## Favoritos workflow

The Favorites view persists a list of ICAO codes in `localStorage` (`notam:favorites:icao`).

- Use the typeahead to add a station; click a chip to remove it.
- Dashboards show active/upcoming counts, a category bar chart (Recharts), a severity timeline and the top three NOTAM ordered by severity.
- Filters for time and category still apply. The station query is ignored in this view unless it matches one of the favorite ICAO codes, in which case only that station is displayed.

## Layout decisions

- **Globe** – responsive grid with the Mapbox globe in 6 of 12 columns and the detail panel in the remaining six.
- **List** – table without the internal UUID column; default sort by severity (desc) with a toggle for validity.
- **Cards** – responsive grid (3 cards on `xl`, 2 on `md`, 1 on `sm`) using the shared `NotamCard` component.
- **Favorites** – paginated (6 stations per page) dashboards with recharts visualisations and severity timelines.
- A sticky top bar provides the view toggles, UTC clock (`HH:MM:SS UTC`) via `useUtcClock`, and a manual refresh button.

## Available commands

- `npm run dev` – start the Vite dev server
- `npm run build` – build the production bundle
- `npm run preview` – serve the build locally
- `npm run test` – run component tests with Vitest
