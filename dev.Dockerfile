# Multi-stage build for LunarLens monorepo
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm turbo

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all workspace packages
COPY apps ./apps
COPY packages ./packages
COPY shared ./shared
COPY types ./types
COPY middleware ./middleware

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages first
RUN pnpm run build --filter=@lunarlens/*

# Auth Server Stage
FROM base AS auth-server
WORKDIR /app
RUN pnpm --filter=auth_server run build 2>/dev/null || echo "No build script"
EXPOSE 4000
CMD ["pnpm", "--filter=auth_server", "run", "dev"]

# Web Frontend Stage
FROM base AS web
WORKDIR /app
# Build Next.js app
RUN pnpm --filter=web run build
EXPOSE 3000
CMD ["pnpm", "--filter=web", "run", "start"]