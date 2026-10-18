# ==============================================================================
# MediGrid AI — Production Multi-Stage Dockerfile
# Optimized for cloud deployment (Render, Fly.io, Railway, AWS ECS, GCP Cloud Run)
# ==============================================================================

# Stage 1: Build Frontend and Backend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy entire source code
COPY . .

# Build both backend TypeScript and frontend Vite bundle
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend and frontend production builds from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/.env.example ./backend/.env.example
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database
COPY --from=builder /app/api ./api

# Expose server port (Cloud PaaS dynamically overrides with $PORT)
EXPOSE 3001

# Start the unified production server
CMD ["node", "backend/dist/server.js"]
