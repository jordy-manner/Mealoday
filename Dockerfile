# syntax=docker/dockerfile:1

# ── Stage 1: production deps ──────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# postinstall runs prisma generate; DATABASE_URL is not needed for generation
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npm ci --omit=dev

# ── Stage 2: full build ───────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Placeholder URL: Next.js static analysis must not hit a real DB at build time.
# Pages that query Prisma are dynamic (cookies/headers), so no actual connection
# is made during build.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: lean runtime image ───────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Next.js standalone server (bundles its own minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

# Prisma CLI + generated client for migrate deploy
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules/prisma       ./node_modules/prisma
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules/@prisma      ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma      ./node_modules/.prisma
# dotenv is required by prisma.config.ts at migrate time
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules/dotenv       ./node_modules/dotenv

# Schema + migrations + Prisma config
COPY --from=builder --chown=nextjs:nodejs /app/prisma          ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./

COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["/app/docker-entrypoint.sh"]
