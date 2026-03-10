FROM node:20-alpine AS builder
WORKDIR /app

# Copie des manifestes pour profiter du cache des layers
COPY package*.json turbo.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/typescript-config/package*.json ./packages/typescript-config/

RUN npm ci

# Copie du code source
COPY apps/web ./apps/web
COPY packages/ui ./packages/ui
COPY packages/shared-types ./packages/shared-types
COPY packages/typescript-config ./packages/typescript-config

RUN npm run build --workspace=apps/web

# --- Production ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/typescript-config/package*.json ./packages/typescript-config/

RUN npm ci --omit=dev

COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "start"]
