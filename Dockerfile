FROM node:22-alpine AS builder

RUN apk add --no-cache ffmpeg

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Production
FROM node:22-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and lockfile
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built assets and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

EXPOSE 5550

# The start:prod script runs 'node dist/main'
CMD ["npm", "run", "start:prod"]
