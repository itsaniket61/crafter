FROM node:lts-alpine

ENV NODE_ENV=production

# Install dependencies needed for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy both package.json and package-lock.json (if exists)
COPY package*.json ./

COPY start.sh ./
RUN chmod +x start.sh

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN chmod +x start.sh

# Build the application (if needed)
RUN npm run build

CMD ["sh","./start.sh"]