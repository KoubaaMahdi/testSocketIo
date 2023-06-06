# Use the base image for Node.js
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the server.js file and index.html
COPY server.js .
COPY index.html .

# Expose the port your application listens on
EXPOSE 3000

# Run the server.js file
CMD [ "node", "server.js" ]
