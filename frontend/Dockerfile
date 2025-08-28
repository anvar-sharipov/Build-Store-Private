FROM node:20 AS build

WORKDIR /app

# Копируем package.json и package-lock.json/yarn.lock
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь код проекта
COPY . .

# Билдим Vite (dist создаётся по умолчанию)
RUN npm run build

# Продакшен сервер — Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80



# FROM node:20 AS build

# WORKDIR /app

# # Копируем package.json и package-lock.json/yarn.lock
# COPY package*.json ./

# # Устанавливаем зависимости
# RUN npm ci

# # Копируем весь код проекта
# COPY . .

# # Билдим Vite (dist создаётся по умолчанию)
# RUN npm run build

# # Продакшен сервер — Nginx
# FROM nginx:alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80
