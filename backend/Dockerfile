# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install OS deps (if you need sharp or native modules, add build-base, python3, etc.)
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy only necessary files
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
