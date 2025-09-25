CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS airports (
  icao VARCHAR(4) PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  base BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icao VARCHAR(4) NOT NULL REFERENCES airports(icao) ON DELETE CASCADE,
  number VARCHAR(16) NOT NULL,
  q_line TEXT,
  subject TEXT,
  condition TEXT,
  modifier TEXT,
  text TEXT NOT NULL,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  lower_ft INTEGER,
  upper_ft INTEGER,
  coords_geojson JSONB,
  category TEXT,
  element TEXT,
  services TEXT[] NOT NULL DEFAULT '{}',
  severity INTEGER NOT NULL DEFAULT 0,
  relevance INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'INFO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(number, icao)
);

CREATE TABLE IF NOT EXISTS views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID,
  filters_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
