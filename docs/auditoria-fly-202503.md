# Auditoría operativa NOTAM (Fly.io)

## 1. Resumen ejecutivo
La aplicación backend `notam-api` está desplegada en Fly.io con una configuración que permite que las máquinas se apaguen automáticamente tras un periodo de inactividad (`auto_stop_machines = 'stop'` y `min_machines_running = 0`). Esto explica la indisponibilidad observada después de algunos minutos sin tráfico: no queda ninguna VM activa para atender nuevas peticiones y los usuarios ven errores de conexión hasta que Fly arranca una instancia en frío. Además, la imagen del frontend está construida sobre el servidor de desarrollo de Vite, lo que no es adecuado para producción y mantiene el contenedor atado a un proceso no optimizado. No se detectaron fallas de código que derriben la aplicación; los síntomas corresponden a decisiones de configuración y empaquetado.

## 2. Metodología
- Revisión del manifiesto de despliegue `fly.toml` y scripts asociados.
- Evaluación de la configuración Docker (backend, frontend y `docker-compose`).
- Inspección de los puntos de entrada del backend (Express) y del frontend (React + Vite).
- Identificación de prácticas de observabilidad y salud del servicio.

## 3. Hallazgos principales

### 3.1 Fly.io
- **Autoapagado habilitado:** `auto_stop_machines = 'stop'` y `min_machines_running = 0` permiten a Fly apagar todas las VMs cuando no hay tráfico【F:api/fly.toml†L11-L17】.
- **Recomendación:** Establecer `auto_stop_machines = 'off'` o, al menos, `min_machines_running = 1` para garantizar una VM siempre disponible. Alternativamente, configurar un cron de keep-alive si se desea conservar el autoapagado pero tolerar el retardo de arranque en frío.
- **Release command:** Cada despliegue ejecuta migraciones y semillas (`release_command = "node dist/scripts/migrate.js && node dist/scripts/seed.js"`). Asegurarse de que las semillas sean idempotentes para evitar duplicados si el comando falla a mitad de proceso.
- **Salud del contenedor:** El backend expone `/health` pero Fly no tiene checks HTTP configurados; se recomienda añadirlos para que la plataforma detecte estados degradados con rapidez.【F:api/src/app.ts†L12-L18】

### 3.2 Backend Node/Express
- **Servidor simple:** El backend se levanta con `app.listen` sin supervisión adicional.【F:api/src/server.ts†L1-L11】 Para resiliencia en producción se sugiere usar `fly scale count` o `fly scale vm` conforme a la carga y habilitar logs estructurados.
- **Pool de conexiones:** El pool de `pg` respeta variables de entorno (`DATABASE_URL`, etc.), por lo que no se evidencian fugas que apaguen las máquinas.【F:api/src/db/pool.ts†L1-L16】
- **Límites y filtros:** Las consultas limitan a 500 NOTAMs, evitando respuestas excesivas, pero no hay índices documentados; revisar la base Fly para confirmar índices sobre `notams (icao, start_at)`.

### 3.3 Frontend React
- **Docker de desarrollo:** El `Dockerfile` expone el servidor de desarrollo de Vite (`npm run dev -- --host 0.0.0.0`).【F:frontend/Dockerfile†L1-L8】 En producción esto implica hot-reload innecesario, más consumo de recursos y falta de assets minificados.
- **Recomendación:** Construir el bundle (`npm run build`) y servirlo con un servidor estático (por ejemplo, `@flydotio/static`). Si se despliega junto al backend, considerar un reverse proxy (NGINX o Fly Machines App).

### 3.4 Local/dev environment
- `docker-compose.yml` está orientado a desarrollo (volúmenes montados, comandos `npm run dev`).【F:docker-compose.yml†L17-L43】 No reutilizar esta configuración en producción.

## 4. Dictamen
El apagado espontáneo de las máquinas proviene de la configuración de auto escalado de Fly y no de fallas internas del servicio. Para recuperar la disponibilidad continua se recomienda:
1. Deshabilitar el autoapagado o mantener al menos una máquina encendida permanentemente.
2. Configurar checks de salud HTTP en Fly y supervisión de logs para detectar incidentes.
3. Reempaquetar el frontend para producción (build + servidor estático) y definir una estrategia de despliegue separada o integrada con un proxy.

Con estas acciones, el sitio debería permanecer accesible y responder sin latencias de arranque en frío.
