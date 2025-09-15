FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create storage directory
RUN mkdir -p storage

# Expose port
EXPOSE 7070

# Start development server
CMD ["npm", "run", "dev"]