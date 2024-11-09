# Stage 1: Build Stage
FROM ubuntu:latest AS builder

# Install curl and dependencies for Bun
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
ENV PATH="/root/.bun/bin:$PATH"

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb (Bun’s lock file)
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN bun run build

# Stage 2: Production Stage
FROM ubuntu:latest AS runner

# Install curl for runtime
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# Install Bun runtime
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Set environment variable to use production mode
ENV NODE_ENV=production NEXT_PUBLIC_APP_URI=http://localhost:3000 NEXT_PUBLIC_APP_NAME=Jira NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 NEXT_PUBLIC_APPWRITE_PROJECT_ID=67082217002fec4c7cb0 NEXT_PUBLIC_APPWRITE_DATABASE_ID=6709735e00220444e49a NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=670973a800212e3b19bd NEXT_PUBLIC_APPWRITE_MEMBERS_ID=670a40e60011887b83cc NEXT_PUBLIC_APPWRITE_PROJECTS_ID=6715f593001aebba2f34 NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=670a17df00353dd6d444 NEXT_APPWRITE_API_KEY=standard_16d908375eddd04c67c23402490b0ba77fcddf90db8db003f25ad296e24bec9058c7857f25579749bbaf0b1a91f51bb38bcb64689a466223a6fd74a17080e491b156a8c9dae050599ecdbf57490bc9770ba8e125cad7cff6b5cca09ea5a92b6213d43a11e17e17ceb6737700603febef00d4b0f334ee29038e78ce52f981d811

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/bun.lockb ./bun.lockb
COPY --from=builder /app/node_modules ./node_modules

# Expose port 3000
EXPOSE 3000

# Start the Next.js application using Bun
CMD ["bun", "run", "start"]
