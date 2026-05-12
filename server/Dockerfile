# SafeNest Backend — Node.js + Express + MySQL (Drizzle ORM)
# Optimized for Google Cloud Run

FROM node:20-alpine

WORKDIR /app

# Install deps first for layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Remove SQLite artifacts (not needed in production)
RUN rm -f sqlite.db

# Cloud Run provides PORT env var (default 8080)
ENV PORT=8080
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Health check (Cloud Run readiness probe)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

# Start server
CMD ["node", "index.js"]
