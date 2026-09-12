FROM node:20

# Set working directory
WORKDIR /app

# Force IPv4 to fix "Client network socket disconnected" error on Hugging Face
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure the container listens for signals to cleanly stop the polling bot
STOPSIGNAL SIGINT

# Start the bot
CMD ["npm", "start"]
