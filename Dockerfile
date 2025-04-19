FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json files
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install backend dependencies
RUN cd backend && npm install

# Install frontend dependencies
RUN cd frontend && npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 3000

# Set host to 0.0.0.0 to allow external connections
ENV HOST=0.0.0.0

# Start the app
CMD ["node", "backend/server.js"]