# Use Node.js official image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose app port (change if needed)
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "start"]
