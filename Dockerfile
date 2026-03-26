FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source.
COPY . .

# Ensure the server is reachable from outside the container.
ENV APP_HOST=0.0.0.0

EXPOSE 7676

CMD ["npm", "start"]