# STAGE 1 : Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2 : Production (L'image finale qui sera scannée)
FROM nginx:alpine
# On met à jour l'OS pour corriger les failles système
RUN apk update && apk upgrade --no-cache
# On copie uniquement le site web compilé
COPY --from=build /app/dist /usr/share/nginx/html
# On crée un utilisateur non-root pour Nginx
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html
USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]