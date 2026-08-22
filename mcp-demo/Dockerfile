FROM node:22-alpine
WORKDIR /app

# Install only production deps first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Cloud Run (and most PaaS) inject PORT; bind all interfaces inside the container.
ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080

CMD ["node", "website.mjs"]
