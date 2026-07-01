# Stage 1: install production dependencies
FROM node:24-alpine@sha256:fb71d01345f11b708a3553c66e7c74074f2d506400ea81973343d915cb64eef0 AS dependencies

# metadata
LABEL maintainer="Wan Hua Wu <wwu104@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# set working directory
WORKDIR /app

# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/

# Install dependencies from package-lock.json, but omit devDependencies.
RUN npm ci --omit=dev

# Stage 2: production image
FROM node:24-alpine@sha256:fb71d01345f11b708a3553c66e7c74074f2d506400ea81973343d915cb64eef0 AS production

# define environment variables
# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# enable production optimizations in many Node.js libraries
ENV NODE_ENV=production

# set working directory
WORKDIR /app

# Install curl for health checks and tini for init process
RUN apk add --no-cache \
    curl-8.21.0-r0 \
    tini=0.19.0-r3

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package*.json /app/

# Change ownership of files AND Copy src to /app/src/
COPY --chown=node:node ./src ./src

# Change ownership of files AND Copy HTPASSWD file
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Switch to non-root user
USER node

# We run our service on port 8080
EXPOSE 8080

# Using entry point with tini
ENTRYPOINT ["tini", "--"]

HEALTHCHECK --interval=3m --timeout=30s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start the container by running our server
CMD ["npm", "start"]