FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Продакшен сервер — Nginx
FROM nginx:alpine

# Устанавливаем openssl для генерации сертификатов
RUN apk add --no-cache openssl

# Копируем билд
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем nginx конфигурацию
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем скрипт генерации сертификата
COPY generate-cert.sh /docker-entrypoint.d/10-generate-cert.sh
RUN chmod +x /docker-entrypoint.d/10-generate-cert.sh

EXPOSE 80 443
