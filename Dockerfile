# Stage 1: Build Angular Application
FROM node:18.19.0 AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
#RUN npm install --force

# Copy the rest of the application source code
COPY . .

# Build the Angular application
#RUN npm run build

FROM nginx:latest

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates to the proper location
COPY ssl/global-csg.com.pem /etc/ssl/global-csg.com.pem
COPY ssl/global-csg.com.key /etc/ssl/global-csg.com.key

# Copy the built Angular application from the build stage
COPY --from=build /app/ /usr/share/nginx/html

# Expose HTTP (80) and HTTPS (443) ports
EXPOSE 3000

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]

