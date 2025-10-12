FROM python:3.11-slim

# Устанавливаем зависимости для psycopg2 и psql
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем зависимости и устанавливаем их
COPY requirements.txt .
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код проекта
COPY . .

# Копируем и делаем скрипты исполняемыми
COPY wait-for-it.sh .
COPY entrypoint.sh .
RUN chmod +x wait-for-it.sh entrypoint.sh

# Создаём директории для static и media
RUN mkdir -p /app/staticfiles /app/media

# Собираем статические файлы (admin CSS/JS)
RUN python manage.py collectstatic --noinput || true

# Запуск через entrypoint
CMD ["./entrypoint.sh"]