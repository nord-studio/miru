FROM alpine:3.22 AS base

# Install libc6-compat, nodejs, and pnpm
RUN apk update ; apk add --no-cache libc6-compat nodejs pnpm

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS prune

# Set working directory
WORKDIR /app

# Copy entire project and prune the docs app
COPY . .
RUN pnpm dlx turbo prune --scope=@miru/docs --docker

FROM base AS builder

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /app/out/full/apps/docs/source.config.ts ./apps/docs/source.config.ts

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Set default environment variables
ENV NEXT_TELEMETRY_DISABLED=1

# Build the project
COPY --from=prune /app/out/full/ .
RUN pnpm dlx turbo run build --filter=@miru/docs

FROM base AS runner
WORKDIR /app

# Install nodejs to runner
RUN apk add nodejs

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the build output
COPY --from=builder --chown=nextjs:nodejs /app/apps/docs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/docs/.next/static ./apps/docs/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/docs/public ./apps/docs/public

EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

USER nextjs
CMD ["node", "./apps/docs/server.js"]