# Development-only image for the Express API. Not a deployment artifact.
# Build context is the REPO ROOT so the pnpm workspace (packages/shared) is
# available. Source is bind-mounted at runtime (see docker-compose.yml) so tsx
# watch picks up edits.
FROM node:24-bookworm-slim

# pnpm via corepack, pinned by the root package.json "packageManager" field.
RUN corepack enable
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

# Install dependencies first for better layer caching. Copy only the manifests
# the API and its workspace deps need.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter "@pcic/api..."

# Copy the rest of the source (overlaid by bind-mounts in development).
COPY . .

EXPOSE 4000
CMD ["pnpm", "--filter", "api", "dev"]
