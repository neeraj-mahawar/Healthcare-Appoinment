# Use Node 20+
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
