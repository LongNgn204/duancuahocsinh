# Node.js WebSocket Proxy for Voice Call
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Cloud Run uses PORT environment variable
ENV PORT=8080

# Start the server
CMD ["npm", "start"]
