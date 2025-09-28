# --- build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# copia lock para instalar exacto
COPY package.json package-lock.json ./
RUN npm ci

# copia código y build
COPY . .
# asegúrate que tu build genere dist/server.js y, si aplica, copie migraciones a dist/
RUN npm run build

# --- runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# instala deps de prod usando lockfile
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# copia artefactos de build
COPY --from=builder /app/dist ./dist

# SI y SOLO SI tus migraciones están en dist: (de lo contrario, elimina esta línea)
# OJO: esta línea falla si la ruta no existe. Manténla solo si el build la crea siempre.
# COPY --from=builder /app/dist/db/migrations ./dist/db/migrations

# expón el puerto real
EXPOSE 3001

# entrada
CMD ["node","dist/server.js"]
