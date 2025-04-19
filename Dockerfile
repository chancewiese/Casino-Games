FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy root package.json
COPY package.json ./

# Copy both apps
COPY backend ./backend
COPY frontend ./frontend

# Install dependencies and build frontend
RUN npm run postinstall

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]