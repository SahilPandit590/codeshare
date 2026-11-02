# Multi-stage production build
FROM node:22-alpine AS builder

WORKDIR /app

# Monaco's language workers make the Vite production bundle memory-intensive.
# Keep the runtime stage unchanged; this only gives the build process enough
# heap on Render and local Docker builds.
ENV NODE_OPTIONS=--max-old-space-size=4096

# Copy root manifests
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY prisma ./prisma/

# Install all dependencies including devDependencies
RUN npm ci

# Copy full source
COPY shared ./shared
COPY backend ./backend
COPY frontend ./frontend

# Generate Prisma Client
RUN npm run prisma:generate

# Build all packages
RUN npm run build:shared
RUN npm run build:backend
RUN npm run build:frontend

# Runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy root manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy generated Prisma Client and built outputs from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/types ./shared/types
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Non-root user for security
USER node

EXPOSE 3000

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma && node backend/dist/server.js"]
