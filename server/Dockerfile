# QDX API — production image
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY .env.production ./.env.production
RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 5001
CMD ["node", "src/index.js"]
