# NOTAM Operational Dashboard

This monorepo contains the backend API, frontend dashboard and infrastructure required to parse, score and visualise NOTAMs following the Manual Código NOTAM (México, 2020).

## Project structure

```
api/       Node.js + Express + PostgreSQL API
frontend/  React + Vite + Tailwind dashboard
scripts/   (API) database migrations and seeds
docs/      Instrucciones para descargar manuales de referencia externos
```

## Getting started

1. Copy `.env.example` to `.env` and adjust variables (Mapbox token, database credentials, etc.).
2. Start the stack:

```bash
docker compose up --build
```

This launches:

- **db** – PostgreSQL 15
- **api** – Express server on `http://localhost:3001`
- **frontend** – Vite dev server on `http://localhost:5173`

Run database migrations and seed catalogs once the containers are up:

```bash
docker compose exec api npm run migrate
docker compose exec api npm run seed
```

The frontend connects to the API, providing management of airports, parsing of raw NOTAM messages (`POST /notams/parse`), scoring (severity/relevance) and advanced visualisations (globe, cards, timeline, affected elements).

## Manual de referencia

Consulta [`docs/README.md`](docs/README.md) para descargar el Manual Código NOTAM 2020 y la propuesta de diseño oficial desde sus fuentes externas. Los catálogos y clasificadores implementados (categorías, elementos atómicos) se alinean a ese manual.

## Tests

Ejecuta las pruebas unitarias del parser y del scoring desde `api/`:

```bash
cd api
npm test
```

Vitest está configurado en `frontend/` para futuras pruebas de componentes (`npm run test`).

## Exportaciones y favoritos

La API guarda filtros personalizados en la tabla `views`, soporta overrides de severidad y relevancia, y expone datos listos para exportar (CSV/JSON/iCal) a través de las colecciones de NOTAM recuperadas con filtros (`GET /notams`).

## Próximos pasos sugeridos

- Completar autenticación y multiusuario para vistas guardadas.
- Añadir generación directa de archivos CSV/JSON/iCal desde endpoints dedicados.
- Incluir pruebas E2E para validar interacción entre frontend y API.
