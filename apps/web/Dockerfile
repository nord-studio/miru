FROM alpine:3.21 AS base

# Install libc6-compat, nodejs, and pnpm
RUN apk update ; apk add --no-cache libc6-compat nodejs pnpm

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

###
### prune - Prune the web app from the monorepo
###
FROM base AS prune

# Set working directory
WORKDIR /app

# Copy entire project and prune the web app
COPY . .
RUN pnpm dlx turbo prune --scope=@miru/web --docker

###
### builder - Install dependencies and build the project
###
FROM base AS builder

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Set default environment variables
ENV APP_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1

# Build the project
COPY --from=prune /app/out/full/ .
RUN pnpm dlx turbo run build --filter=@miru/web

###
### Runner
###
FROM base AS runner
WORKDIR /app

# Install nodejs to runner
RUN apk add nodejs

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the build output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy the migrations and drizzle.config.ts file
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/lib/db/migrations ./apps/web/lib/db/migrations

# Copy the default config.toml file
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/config.toml ./apps/web/config.toml

EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

USER nextjs
CMD ["node", "./apps/web/server.js"]