FROM node:22-alpine AS base

WORKDIR /app

# Install git, tsx, and pnpm
RUN apk add --no-cache git
RUN npm install -g tsx jscodeshift pnpm@10.9.0

# Clone the repository and copy the example
RUN git clone --depth 1 https://github.com/code-hike/examples.git /tmp/examples && \
    cp -r /tmp/examples/with-nextra-3/* /app/ && \
    rm -rf /tmp/examples

# Install dependencies with pnpm
RUN pnpm install

# Create a temporary directory for our project
FROM base AS builder
WORKDIR /nextra-codemods

# Copy package.json and install dependencies
COPY ./package.json ./tsconfig.json ./tsup.config.ts ./pnpm-lock.yaml ./.npmrc ./
RUN pnpm install

# Copy source files and build
COPY ./src ./src
# Skip TypeScript declaration files generation
RUN cat tsup.config.ts && \
    sed -i 's/"dts": true/"dts": false/' tsup.config.ts && \
    cat tsup.config.ts && \
    pnpm run build

# Final stage
FROM base AS final
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /nextra-codemods/dist /app/dist
# Also copy source for development with tsx
COPY ./src /app/src

# Copy start script
COPY ./ops/scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Run fix-tailwind.ts during build
RUN tsx /app/src/fixes/fix-tailwind.ts

EXPOSE 3000

CMD ["/app/start.sh"]
