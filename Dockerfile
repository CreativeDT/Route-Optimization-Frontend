# Stage 1: Build Angular Application
FROM node:18.19.0 AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --force

# Copy the rest of the application source code
COPY . .

# Build the Angular application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:latest

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

COPY ../ssl/global-csg.com.pem ssl/global-csg.com.pem
COPY ../ssl/global-csg.com.key ssl/global-csg.com.key

# Copy the built Angular application from the build stage
COPY --from=build /app/ /usr/share/nginx/html

# Expose HTTP and HTTPS ports
EXPOSE 80 3000

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
