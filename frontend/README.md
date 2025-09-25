# NOTAM Dashboard Frontend

React + Vite dashboard to visualize NOTAM activity with globe, cards, filters and timeline views.

## Getting started

```bash
npm install
npm run dev
```

The app expects the API to be available at `VITE_API_URL` (defaults to `http://localhost:3001`). For the globe view configure `VITE_MAPBOX_TOKEN` with a Mapbox access token.

Create a `.env.local` file:

```
VITE_API_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## Available commands

- `npm run dev` – start the Vite dev server
- `npm run build` – build the production bundle
- `npm run preview` – serve the build locally
- `npm run test` – run component tests with Vitest (placeholder)

## Architecture highlights

- **Zustand** manages persistent filters, favorites and saved views.
- **TailwindCSS** delivers the requested dark-mode aesthetic with chips, cards and timeline components.
- **MapboxGL** globe illustrates airport severity intensity with interpolated colors (red/amber/blue/gray).
- **Accessibility** considerations include focus rings, color contrast and keyboard-friendly controls.

Key components:

- `TopBar` – UTC clock, refresh button, global category filter, view toggles and add-airport dialog.
- `TimeSelector` – absolute/relative/daily selectors with UTC-only semantics.
- `AirportCard` – per-airport summary with severity chips, status tags and favorite toggle.
- `AffectedElements` – atomic element grouping (runways, taxiways, lighting, etc.) tied to Manual Código NOTAM taxonomy.
- `NotamTimeline` – chronological visualization for situational awareness.
- `GlobeView` – Mapbox layer to highlight hotspots by severity.
