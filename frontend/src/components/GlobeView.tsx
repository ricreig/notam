import Map, { Layer, Source, ViewState } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMemo, useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

const defaultView: ViewState = {
  longitude: -99.1332,
  latitude: 19.4326,
  zoom: 4,
  bearing: 0,
  pitch: 45,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

export default function GlobeView() {
  const refreshNotams = useDashboardStore((s) => s.refreshNotams);
  const setMode = useDashboardStore((s) => s.setMode);
  const airports = useDashboardStore((s) => s.airports);
  const notams = useDashboardStore((s) => s.notams);
  const [viewState, setViewState] = useState(defaultView);

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: (airports ?? []).map((a) => {
        const aNotams = (notams ?? []).filter((n) => (n as any).icao === a.icao);
        const maxSeverity = aNotams.reduce((m, n) => Math.max(m, (n as any).severity ?? 0), 0);
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [a.lon, a.lat] },
          properties: { icao: a.icao, count: aNotams.length, severity: maxSeverity },
        };
      }),
    }),
    [airports, notams],
  );

  const token = import.meta.env.VITE_MAPBOX_TOKEN ?? '';
  if (!token) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-sm text-slate-400">
        Configure VITE_MAPBOX_TOKEN to enable the globe view.
      </div>
    );
  }

  return (
    <div className="relative h-[520px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60 shadow-xl shadow-slate-950/40">
      <Map
        mapboxAccessToken={token}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['airports-heat']}
        onClick={(e) => {
          // Prefer feature from interactive layer (react-map-gl)
          const f = (e.features && e.features[0]) as any;
          let icao = f?.properties?.icao as string | undefined;

          // Fallback: queryRenderedFeatures
          if (!icao) {
            const map = (e.target as any).getMap?.() || (e.target as any);
            if (map?.queryRenderedFeatures) {
              const feats = map.queryRenderedFeatures(e.point, { layers: ['airports-heat'] });
              icao = feats?.[0]?.properties?.icao as string | undefined;
            }
          }

          if (icao) {
            refreshNotams({ aerodrome: icao });
            setMode('list');
          }
        }}
      >
        <Source id="airports" type="geojson" data={geojson}>
          <Layer
            id="airports-heat"
            type="circle"
            paint={{
              'circle-color': ['interpolate', ['linear'], ['get', 'severity'], 0, '#3B82F6', 50, '#F59E0B', 80, '#EF4444'],
              'circle-radius': ['interpolate', ['linear'], ['get', 'count'], 1, 6, 10, 20],
              'circle-opacity': 0.75,
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
