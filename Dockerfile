FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# -----------------------------
# BUILD ARGUMENTS
# -----------------------------
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG MONGODB_URI

# -----------------------------
# ENV VARIABLES
# -----------------------------
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Zmlyc3QtaGFkZG9jay02NC5jbGVyay5hY2NvdW50cy5kZXYk
ENV CLERK_SECRET_KEY=sk_test_TA6oroMUohxv3gT7QUC5SG8qqncRwVv1QOauCySzqn
ENV MONGODB_URI=mongodb+srv://aman:aman@cluster0.vmv97za.mongodb.net/

# Build app
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]