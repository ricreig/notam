# --- build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# copia migraciones compiladas dentro de dist (si tu postbuild no lo hizo)
# RUN mkdir -p dist/db/migrations && cp -r src/db/migrations/*.sql dist/db/migrations/ || true

# --- runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/db/migrations ./dist/db/migrations
CMD ["node","dist/server.js"]
