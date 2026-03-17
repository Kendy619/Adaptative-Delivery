# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars MUST be available at build time
# because Next.js inlines them into the client JS bundle.
ARG NEXT_PUBLIC_APP_NAME=AdaptiveDelivery
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 3: Production ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what's needed for production
# public/ is optional — only copy if it exists
RUN mkdir -p ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Runtime env vars (pass via docker run -e or --env-file):
# - AWS_REGION
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - DYNAMODB_TABLE_NAME
# - DYNAMODB_ENDPOINT (optional)
# - SESSION_TTL_SECONDS

CMD ["npm", "start"]
