# Guía completa de lanzamiento de NOTAM Dashboard

Esta guía explica, paso a paso y sin asumir conocimientos previos, cómo preparar el entorno local, ejecutar la aplicación y desplegarla en producción usando Fly.io y un hosting estático para el frontend (por ejemplo Hostinger). Incluye indicaciones explícitas para Windows (PowerShell) y macOS/Linux (terminal bash/zsh).

## 1. Requisitos previos

1. **Cuenta de GitHub** (para clonar el repositorio) y acceso al repositorio `notam`.
2. **Herramientas a instalar**:
   - [Git](https://git-scm.com/downloads).
   - [Node.js 20 LTS](https://nodejs.org/en/download) (incluye `npm`).
   - [Docker Desktop](https://www.docker.com/products/docker-desktop) (habilita contenedores para la base de datos y los servicios).
   - [Fly.io CLI (`flyctl`)](https://fly.io/docs/hands-on/install-flyctl/) para desplegar la API.
   - Editor de texto recomendado: VS Code o similar.
3. **Credenciales necesarias**:
   - Token de Mapbox (gratuito) para la vista del globo. Regístrate en [mapbox.com](https://www.mapbox.com) y copia el token.
   - Si no usas Fly Postgres administrado, prepara una URL de conexión PostgreSQL (usuario, contraseña, host, puerto, base de datos).

> **Consejo:** En Windows ejecuta todos los comandos dentro de **PowerShell** con permisos de administrador. En macOS/Linux usa la **terminal** (bash o zsh). Los comandos son idénticos salvo que se indica explícitamente.

## 2. Clonar el repositorio

1. Abre PowerShell (Windows) o Terminal (macOS/Linux).
2. Elige una carpeta de trabajo, por ejemplo `Documents`.
3. Ejecuta:

   ```powershell
   git clone https://github.com/<tu-organizacion>/notam.git
   cd notam
   ```

4. Copia la configuración de entorno base:

   ```powershell
   Copy-Item .env.example .env
   ```

   En macOS/Linux:

   ```bash
   cp .env.example .env
   ```

5. Edita `.env` y reemplaza `VITE_MAPBOX_TOKEN` por tu token real. Si vas a usar un PostgreSQL externo también actualiza `DATABASE_URL` y los campos de `DB_*`.

## 3. Levantar el entorno local con Docker

1. Asegúrate de que Docker Desktop esté corriendo.
2. Desde la carpeta raíz del proyecto ejecuta:

   ```powershell
   docker compose up --build
   ```

   Este comando prepara tres contenedores:

   - `db`: PostgreSQL 15 con las credenciales del archivo `.env`.
   - `api`: servidor Express en `http://localhost:3001`.
   - `frontend`: servidor Vite en `http://localhost:5173`.

3. Abre otra terminal en la misma carpeta y ejecuta las migraciones de la base de datos:

   ```powershell
   docker compose exec api npm run migrate
   docker compose exec api npm run seed
   ```

   El script `seed` carga la base de aeropuertos controlados de México y los NOTAM iniciales para cada FIR (incluyendo MMFR y MMFO).

4. Comprueba que la API responde:

   ```powershell
   curl http://localhost:3001/health
   ```

   Deberías recibir `{ "status": "ok" }`.

5. Abre `http://localhost:5173` en tu navegador. Si no carga, revisa que el contenedor `frontend` esté "healthy" en Docker Desktop.

## 4. Ejecución de pruebas y compilación

1. **Pruebas del backend**:

   ```powershell
   cd api
   npm test -- --runInBand
   cd ..
   ```

2. **Compilación del backend** para generar `dist/` (necesario en el despliegue):

   ```powershell
   cd api
   npm run build
   cd ..
   ```

3. **Compilación del frontend** para obtener los archivos estáticos:

   ```powershell
   cd frontend
   npm install
   npm run build
   cd ..
   ```

   El resultado queda en `frontend/dist`. Para revisar el build localmente puedes ejecutar `npm run preview -- --host 0.0.0.0 --port 4173` y abrir `http://localhost:4173`.

## 5. Despliegue de la API en Fly.io

> Todos los comandos a continuación se ejecutan desde la carpeta `api/`.

1. **Inicia sesión en Fly**:

   ```powershell
   fly auth login
   ```

2. **Verifica el archivo `fly.toml`**: ya viene configurado con el nombre de la app `notam-api-ctareig`, región `sjc` y un `release_command` que corre migraciones y seeds automáticamente.

3. **Base de datos en Fly** (elige una opción):
   > El backend **no crea un PostgreSQL interno**. Tanto las migraciones como el `seed` se conectan usando las variables `DATABASE_URL`/`DB_*` que tengas configuradas. Si defines una base externa, todo el proceso se ejecutará contra esa instancia.

   - **Usar Fly Postgres administrado** (recomendado si aún no existe):
     ```powershell
     fly postgres create --name notam-postgres --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 10
     fly postgres attach notam-postgres
     ```
     El comando `attach` inyecta `DATABASE_URL`, `DB_HOST`, `DB_USER`, etc. como secretos.
   - **Usar una base externa**: añade los valores manualmente con `fly secrets set` (ver paso 4). Verifica previamente que la base exista y que el usuario tenga permisos para crear tablas, ya que el `release_command` únicamente ejecuta migraciones y seeds sobre la conexión indicada.

4. **Configura secretos obligatorios**:

   ```powershell
   fly secrets set VITE_MAPBOX_TOKEN=<tu_token_mapbox>
   fly secrets set NODE_ENV=production
   ```

   Si usas una base externa añade también:

   ```powershell
   fly secrets set DATABASE_URL=postgres://usuario:clave@host:puerto/base
   fly secrets set DB_HOST=<host> DB_PORT=5432 DB_USER=<usuario> DB_PASSWORD=<clave> DB_NAME=<base> DB_SSL=true
   ```

5. **Despliega la API**:

   ```powershell
   npm run build
   fly deploy
   ```

   - Durante el despliegue Fly compila la imagen Docker, ejecuta `npm run build`, copia `dist/` y, gracias al `release_command`, corre migraciones y seeds.
   - El archivo `fly.toml` está ajustado para mantener la máquina encendida (`auto_stop_machines = 'off'` y `min_machines_running = 1`) y expone un chequeo de salud `GET /health` cada 30 segundos, evitando que la app se apague sola.

6. **Verifica el estado**:

   ```powershell
   fly status
   fly logs
   fly open
   ```

   `fly open` abrirá `https://notam-api-ctareig.fly.dev/health`, que debe responder `{"status":"ok"}`.

## 6. Publicación del frontend estático

1. Asegúrate de haber corrido `npm run build` en `frontend/`. Esto crea la carpeta `frontend/dist` con archivos HTML, CSS y JS estáticos.
2. **Configura la URL de la API de producción** editando `frontend/.env.production` (crea el archivo si no existe):

   ```
   VITE_API_URL=https://notam-api-ctareig.fly.dev
   VITE_MAPBOX_TOKEN=<tu_token_mapbox>
   ```

   Luego recompila:

   ```powershell
   cd frontend
   npm run build
   cd ..
   ```

3. **Sube el build a un hosting estático**:

   - **Hostinger (hPanel)**:
     1. Comprime la carpeta `frontend/dist` en tu computadora (`dist.zip`).
     2. En hPanel entra a *Archivos → Administrador de archivos*.
     3. Sube `dist.zip` a la raíz pública (`public_html`) y descomprímelo.
     4. Renombra la carpeta descomprimida a algo como `notam` y asegúrate de que `index.html` quede en `public_html/notam/index.html`.
     5. Configura tu dominio o subdominio para apuntar a esa carpeta (Opciones → Administrar dominios → Directorio raíz).
   - **Fly.io (opcional)**: crea una app Fly separada con `fly launch --name notam-frontend --no-deploy`, añade un `Dockerfile` que sirva los archivos estáticos (por ejemplo con `nginx`) y despliega con `fly deploy`.

4. **Verifica la integración**: abre el sitio estático y confirma que las peticiones a `https://notam-api-ctareig.fly.dev` funcionen (revisa la consola del navegador; no debe haber errores CORS gracias al middleware `cors()` en la API).

## 7. Operación y mantenimiento

- **Mantén la máquina activa**: si necesitas escalar, usa `fly machines list` y `fly scale vm shared-cpu-1x --memory 1024` según demanda.
- **Monitoreo**: usa `fly logs` para revisar errores, o integra herramientas externas (Grafana, Sentry) conectándolas en la API.
- **Actualizaciones de datos**: cuando modifiques seeds o catálogos, vuelve a ejecutar `fly deploy` para que el `release_command` los aplique.
- **Respaldo de la base**: con Fly Postgres puedes ejecutar `fly pg dump notam-postgres` para obtener respaldos periódicos.

Siguiendo estos pasos, cualquier persona puede levantar la plataforma desde cero, validarla en local y dejarla disponible en producción sin que la instancia se apague automáticamente.
