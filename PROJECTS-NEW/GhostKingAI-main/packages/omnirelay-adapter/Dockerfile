# Omnirelay Adapter Dockerfile
# Multi-stage build for production deployment

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/omnirelay-adapter/package*.json ./packages/omnirelay-adapter/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/omnirelay-adapter/ ./packages/omnirelay-adapter/
COPY shared/ ./shared/

# Build the adapter
WORKDIR /app/packages/omnirelay-adapter
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S omari -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=omari:nodejs /app/packages/omnirelay-adapter/dist ./dist
COPY --from=builder --chown=omari:nodejs /app/packages/omnirelay-adapter/package*.json ./
COPY --from=builder --chown=omari:nodejs /app/node_modules ./node_modules

# Copy OpenAPI documentation
COPY --from=builder --chown=omari:nodejs /app/packages/omnirelay-adapter/src/server/openapi.yaml ./openapi.yaml

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/relay/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Switch to non-root user
USER omari

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Labels for metadata
LABEL maintainer="GodsIMiJ Empire <james@godsimij-ai-solutions.com>"
LABEL description="Omnirelay Adapter - Secure bridge for Empire grid integration with Omari AI"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/GodsIMiJ1/pembroke-clinic-pitch"
