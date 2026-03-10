FROM node:20-alpine AS builder
WORKDIR /app

# Copie des manifestes pour profiter du cache des layers
COPY package*.json turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/typescript-config/package*.json ./packages/typescript-config/

RUN npm ci

# Copie du code source
COPY apps/api ./apps/api
COPY packages/shared-types ./packages/shared-types
COPY packages/typescript-config ./packages/typescript-config

RUN npm run build --workspace=apps/api

# --- Production ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/typescript-config/package*.json ./packages/typescript-config/

RUN npm ci --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main"]
