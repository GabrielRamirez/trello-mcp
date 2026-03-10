# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsup.config.ts ./
COPY src/ ./src/
RUN npm run build
# Prune to production-only deps
RUN npm ci --omit=dev

# Prepare a clean runtime base with all upgrades applied
FROM node:22-alpine AS runtime-base
RUN apk upgrade --no-cache \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
 && rm -rf /var/cache/apk/* /tmp/*

# Final stage — copy clean filesystem from runtime-base
FROM scratch
COPY --from=runtime-base / /
RUN addgroup -g 1001 -S mcpuser && adduser -S mcpuser -u 1001
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER mcpuser
EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/health || exit 1
ENTRYPOINT ["node", "dist/remote.js"]
