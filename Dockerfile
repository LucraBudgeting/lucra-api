# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy the rest of the application code to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port that the app listens on
ENV PORT=8085
EXPOSE 8085

# Define the command to run the app
CMD [ "node", "./dist/index.js" ]
