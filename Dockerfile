
# Base Image
FROM node:20-alpine AS base

RUN npm install -g pnpm


# Dependencies
FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG MONGODB_URI
ARG CLERK_SECRET_KEY
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG ADMIN_EMAIL

ENV MONGODB_URI=mongodb+srv://aman:aman@cluster0.vmv97za.mongodb.net/
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Zmlyc3QtaGFkZG9jay02NC5jbGVyay5hY2NvdW50cy5kZXYk
ENV CLERK_SECRET_KEY=sk_test_TA6oroMUohxv3gT7QUC5SG8qqncRwVv1QOauCySzqn
ENV ADMIN_EMAIL=mca-reg202527223@timscdrmumbai.in

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build


# Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nextjs
RUN adduser -S nextjs -G nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]