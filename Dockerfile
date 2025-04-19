# Use Node.js as the base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for backend
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /usr/src/app/backend
RUN npm install

# Copy package.json and package-lock.json for frontend
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
WORKDIR /usr/src/app/frontend
RUN npm install

# Copy all backend files
WORKDIR /usr/src/app
COPY backend ./backend

# Copy all frontend files
COPY frontend ./frontend

# Build the frontend
WORKDIR /usr/src/app/frontend
RUN npm run build

# Set up environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Expose the backend port
EXPOSE 3000

# Start the application
WORKDIR /usr/src/app/backend
CMD ["node", "server.js"]