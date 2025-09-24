FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/cli

COPY . .

# Extract version from package.json and store it
ARG VERSION
RUN if [ -z "$VERSION" ]; then \
        VERSION=$(node -p "require('./package.json').version") && \
        echo "Using version from package.json: $VERSION"; \
    else \
        echo "Using provided version: $VERSION"; \
    fi && \
    echo "APP_VERSION=$VERSION" > /app/.env.version

RUN npm run build

CMD ["npm", "run", "docker-start"]
