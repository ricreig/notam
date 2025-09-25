# NOTAM Operational API

This service powers the NOTAM operational dashboard. It exposes REST endpoints for parsing, storing and retrieving NOTAMs, airport metadata and catalog definitions.

## Tech stack

- Node.js + Express + TypeScript
- PostgreSQL
- Jest for unit tests

## Available scripts

```bash
# install dependencies
npm install

# run in watch mode
npm run dev

# type-check + build to dist/
npm run build

# execute tests
npm test

# run SQL migrations
npm run migrate

# seed catalog tables
npm run seed
```

## Environment variables

Create a `.env` file (or use the project level `.env` file) with the following values:

```
PORT=3001
DATABASE_URL=postgres://notam:notam@db:5432/notam
DB_HOST=db
DB_PORT=5432
DB_USER=notam
DB_PASSWORD=notam
DB_NAME=notam
DB_SSL=false
```

## REST endpoints

### `POST /notams/parse`

Parses a raw NOTAM message and persists the structured representation.

Request body:

```json
{
  "raw": "(A1234/24 NOTAMN ...)" ,
  "category": "movement-area",
  "element": "runway",
  "services": ["ATS"],
  "overrideSeverity": 95,
  "overrideRelevance": 90
}
```

### `GET /notams`

Query NOTAMs with filters (`icao`, `from`, `to`, `cat`, `severity`, `search`).

### `GET /airports` / `POST /airports`

Maintain the airport catalog. Airports are stored with coordinates and a `base` flag to influence relevance scoring.

### `GET /catalogs`

Returns the configured categories, atomic elements and severity color palette used by the dashboard.

## Tests

Fixtures derived from Mexican NOTAMs (runway closures, lighting outages) validate the parser and scoring heuristics according to the Manual Código NOTAM 2020.
