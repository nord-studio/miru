FROM node:22-alpine AS base

# Install libc6-compat
RUN apk update ; apk add --no-cache libc6-compat

# Install corepack and pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Prune the web app
FROM base AS builder

# Set working directory
WORKDIR /app

# Copy entire project and prune the web app
COPY . .
RUN pnpm dlx turbo prune --scope=@miru/web --docker

# First install the dependencies (as they change less often)
COPY /app/out/json/ .
COPY /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Set default PUBLIC environment variables
ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build the project
COPY /app/out/full/ .
RUN pnpm dlx turbo run build --filter=@miru/web

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy over the package.json for Docker and install required deps for Drizzle ORM
COPY --from=installer /app/apps/web/package.docker.json .
RUN mv package.docker.json package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile

COPY --from=installer /app/apps/web/drizzle.config.ts .
COPY --from=installer /app/apps/web/lib/db/migrations ./lib/db/migrations

# NextJS
COPY --from=installer /app/apps/web/next.config.ts .
COPY --from=installer /app/apps/web/.next ./.next
COPY --from=installer /app/apps/web/public ./public

EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

USER nextjs
CMD ["pnpm", "start"]