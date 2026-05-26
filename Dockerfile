FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy package management files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your application code
COPY . .

# Build the Next.js application
RUN pnpm build

# Expose Next.js default port
EXPOSE 3000

# Start Next.js in production mode
CMD ["pnpm", "start"]