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
  const airports = useDashboardStore((state) => state.airports);
  const notams = useDashboardStore((state) => state.notams);
  const [viewState, setViewState] = useState(defaultView);

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: airports.map((airport) => {
        const airportNotams = notams.filter((notam) => notam.icao === airport.icao);
        const maxSeverity = airportNotams.reduce((max, notam) => Math.max(max, notam.severity), 0);
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [airport.lon, airport.lat],
          },
          properties: {
            icao: airport.icao,
            count: airportNotams.length,
            severity: maxSeverity,
          },
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
    <div className="h-[420px] overflow-hidden rounded-xl border border-slate-800 shadow-lg shadow-slate-900/40">
      <Map
        mapboxAccessToken={token}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
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
