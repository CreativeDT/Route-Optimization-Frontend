# Stage 1: Build React App
FROM node:18.19.0 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --force

COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:latest

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates
COPY ssl/global-csg.com.pem /etc/ssl/global-csg.com.pem
COPY ssl/global-csg.com.key /etc/ssl/global-csg.com.key

# Copy the React build output to the NGINX html directory
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
