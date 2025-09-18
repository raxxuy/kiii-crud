# Stage 1: Build the Vite app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json bun.lock* ./
RUN npm install

COPY . .

# Declare build argument
ARG VITE_API_URL
# Make it available to Vite via environment
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
