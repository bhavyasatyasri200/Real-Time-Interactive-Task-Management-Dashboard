# Multi-stage Docker build for TaskFlow
# Stage 1: Build the Vite React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy all source files
COPY . .

# Build production bundle (outputs to /app/dist)
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Serve the static build with Nginx (lightweight, production-grade)
FROM nginx:alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config to handle SPA routing (client-side routes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the HTTP port
EXPOSE 80

# Health check — verifies nginx is responding to requests
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
