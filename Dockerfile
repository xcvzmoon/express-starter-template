# syntax=docker/dockerfile:1.7

ARG BUN_VERSION=1.3.14

FROM oven/bun:${BUN_VERSION}-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
RUN bun run build

FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:${BUN_VERSION}-slim AS runtime

LABEL org.opencontainers.image.title="express-starter-template" \
      org.opencontainers.image.description="Express + TypeScript starter API" \
      org.opencontainers.image.licenses="MIT"

RUN apt-get update \
    && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 appgroup \
    && useradd --uid 1001 --gid appgroup --shell /usr/sbin/nologin --create-home appuser

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5001

COPY --from=prod-deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --chown=appuser:appgroup package.json ./

USER appuser

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD bun -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5001) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bun", "run", "start"]
