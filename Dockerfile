FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfiles and package definitions
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your application code
COPY . .

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

# Mock the database URI so Next.js can compile safely
ENV MONGODB_URI="mongodb+srv://aman:aman@cluster0.vmv97za.mongodb.net/"

# Build the Next.js application
RUN pnpm build

# Expose Next.js default port
EXPOSE 3000

CMD ["pnpm", "start"]