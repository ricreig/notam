# Auditoría operativa NOTAM (Fly.io) – Actualización septiembre 2025

## 1. Resumen ejecutivo
El repositorio ahora incluye pipelines de construcción reproducibles para el backend (Docker multistage y scripts `npm ci`/`tsc`), pero el despliegue en Fly.io mantiene configuraciones que apagan todas las máquinas cuando no hay tráfico (`auto_stop_machines = 'stop'` con `min_machines_running = 0`).【F:api/Dockerfile†L1-L19】【F:api/fly.toml†L6-L24】 Esto sigue provocando ventanas de indisponibilidad mientras Fly arranca una instancia en frío. La salud HTTP del backend no está enlazada a checks de Fly aunque el servicio expone `/health`, y el frontend continúa empaquetado con el servidor de desarrollo de Vite, lo que consume recursos extra y carece de caché estática.【F:api/src/app.ts†L8-L18】【F:frontend/Dockerfile†L1-L8】 Para estabilizar la plataforma se recomienda mantener al menos una máquina encendida, añadir health checks HTTP y construir un bundle estático de frontend.

## 2. Metodología
- Revisión del manifiesto `api/fly.toml` y Dockerfiles de backend/frontend.
- Análisis de scripts de despliegue (`package.json`, `release_command`) y configuración de base de datos.
- Inspección de puntos de entrada del backend (`src/app.ts`, `src/server.ts`) y rutas principales.
- Evaluación de la configuración de desarrollo (`docker-compose.yml`) y del empaquetado del frontend (`vite.config.ts`).

## 3. Hallazgos

### 3.1 Configuración Fly.io
- **Autoapagado agresivo:** `auto_stop_machines = 'stop'` combinado con `min_machines_running = 0` permite que Fly detenga todas las VMs tras inactividad, generando errores hasta que arranca otra instancia.【F:api/fly.toml†L11-L17】
- **Acción sugerida:** Deshabilitar el autoapagado (`auto_stop_machines = 'off'`) o fijar `min_machines_running = 1` para conservar una VM caliente. Complementar con `fly scale count` si se requiere redundancia.
- **Comando de release:** Cada deploy ejecuta migraciones y semillas (`release_command = "node dist/scripts/migrate.js && node dist/scripts/seed.js"`).【F:api/fly.toml†L19-L20】 Verificar que el código de semillas sea idempotente para evitar datos duplicados ante reintentos.
- **Recursos:** La VM usa 1 vCPU compartida y 1 GB de RAM.【F:api/fly.toml†L22-L24】 Ajustar según métricas reales (CPU-bound durante parseo de NOTAMs).

### 3.2 Backend Node/Express
- **Imagen reproducible:** El Dockerfile ahora compila TypeScript y copia artefactos al contenedor final, ejecutando `npm ci` en ambas etapas para builds deterministas.【F:api/Dockerfile†L1-L19】
- **Entrada de aplicación:** El backend expone `/health` y monta routers para NOTAMs, aeropuertos y catálogos, pero no hay middleware de logging ni rate limiting.【F:api/src/app.ts†L8-L19】
- **Arranque simple:** `app.listen` corre en primer plano sin gestor de procesos ni probes que reintenten ante fallos; depende de reinicios de Fly si el proceso se cae.【F:api/src/server.ts†L1-L10】
- **Dependencias y scripts:** `package.json` incluye `postbuild` que copia migraciones al `dist`, alineado con el `release_command` de Fly.【F:api/package.json†L1-L34】 Aun así, no hay scripts para pruebas automatizadas en CI.

### 3.3 Base de datos
- **Pool configurable:** El `Pool` de `pg` respeta variables de entorno para host, puerto, usuario y SSL; permite apuntar a Postgres gestionado o a la instancia de Fly.【F:api/src/db/pool.ts†L1-L16】
- **Consultas:** La lista de NOTAMs limita a 500 resultados y permite filtros por ICAO, fechas y severidad, mitigando respuestas gigantes pero sin índices garantizados en la base (revisar schema).【F:api/src/db/queries/notams.ts†L1-L56】
- **Upserts:** La inserción usa `ON CONFLICT (number, icao) DO UPDATE`, por lo que las semillas pueden ejecutarse múltiples veces sin duplicados, siempre que los datos fuente respeten esas claves.【F:api/src/db/queries/notams.ts†L58-L116】

### 3.4 Observabilidad y resiliencia
- **Health check pendiente:** Aunque `/health` devuelve `{ status: 'ok' }`, Fly.io no lo consulta porque no hay sección `[checks]` en `fly.toml`.【F:api/src/app.ts†L12-L15】【F:api/fly.toml†L6-L24】
- **Logs:** No hay estructura de logs JSON ni configuración de alertas; depender de `fly logs` complica diagnóstico.
- **Tests:** El backend define scripts `jest`, pero no existe configuración de CI que los ejecute antes de desplegar.【F:api/package.json†L9-L18】

### 3.5 Frontend React
- **Docker de desarrollo:** El contenedor sirve la app con `npm run dev` (Vite) en puerto 5173; esto no está optimizado para producción y pierde beneficios de caching/CDN.【F:frontend/Dockerfile†L1-L8】
- **Base path:** El build de Vite fija `base: '/notam/'`. Si la app se sirve desde la raíz del dominio, los assets compilados se resolverán en `/notam/...`, causando errores 404. Ajustar la base o configurar el reverse proxy acorde.【F:frontend/vite.config.ts†L1-L13】
- **APIs:** El frontend depende de `VITE_API_URL` (inyectado por Docker Compose) para invocar al backend; documentar el valor real en producción para evitar defaults erróneos.【F:docker-compose.yml†L30-L40】

### 3.6 Entorno local
- `docker-compose.yml` monta volúmenes y usa comandos `npm run dev`, ideales para desarrollo pero no para producción. No reutilizar esta configuración para Fly.【F:docker-compose.yml†L1-L44】

## 4. Recomendaciones priorizadas
1. **Mantener una VM activa en Fly**: Desactivar el autoapagado o establecer `min_machines_running = 1` para eliminar tiempos de arranque en frío.【F:api/fly.toml†L11-L17】
2. **Configurar health checks HTTP**: Añadir `[checks]` o `[[services.http_checks]]` en `fly.toml` apuntando a `/health` para detectar fallos antes que los usuarios.【F:api/src/app.ts†L12-L15】
3. **Empaquetar frontend para producción**: Generar `npm run build` y servir assets estáticos (NGINX, `@flydotio/static` o backend), eliminando el servidor de desarrollo en despliegue.【F:frontend/Dockerfile†L1-L8】
4. **Definir monitoreo y alertas**: Establecer logs estructurados, métricas básicas y alertas sobre reinicios o errores 5xx.
5. **Documentar base path y variables**: Alinear `base` de Vite con la URL final y documentar `VITE_API_URL`/`DATABASE_URL` para despliegues reproducibles.【F:frontend/vite.config.ts†L1-L13】【F:docker-compose.yml†L30-L40】
6. **Automatizar pruebas**: Activar los scripts `lint`/`test` en CI para detectar regresiones antes de liberar.【F:api/package.json†L9-L18】
