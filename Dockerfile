# ==============================================================================
# HOTEL SAI INTERNATIONAL - PRODUCTION SECURE MULTI-STAGE DOCKERFILE
# Stage 1: Build & Bundle with Node 20 Alpine
# Stage 2: Serve with Hardened Non-Root NGINX Alpine
# ==============================================================================

# STAGE 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Cache package dependencies
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

# Copy source code and build production assets
COPY . .
RUN npm run build

# STAGE 2: Hardened Runtime
FROM nginx:alpine AS runner

# Create non-root user & group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy build artifacts to Nginx public root
COPY --from=builder --chown=nextjs:nodejs /app/dist /usr/share/nginx/html

# Custom hardened Nginx configuration
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Security Headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self)" always; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Static Assets Cache \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|woff)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Give non-root user write access to cache and pid
RUN touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid /var/cache/nginx /var/log/nginx

USER nextjs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
