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
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код проекта
COPY . .

# Копируем и делаем скрипты исполняемыми
COPY wait-for-it.sh .
COPY entrypoint.sh .
RUN chmod +x wait-for-it.sh entrypoint.sh

# Запуск через entrypoint
CMD ["./entrypoint.sh"]





#FROM python:3.11-slim

# # Устанавливаем зависимости для psycopg2 и psql
# RUN apt-get update && apt-get install -y \
#     gcc \
#     libpq-dev \
#     postgresql-client \
#  && rm -rf /var/lib/apt/lists/*

# WORKDIR /app

# # Копируем зависимости и устанавливаем их
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Копируем весь код проекта
# COPY . .

# # Копируем и делаем скрипт исполняемым
# COPY wait-for-it.sh .
# RUN chmod +x wait-for-it.sh

# # COPY entrypoint.sh .
# # RUN chmod +x entrypoint.sh

# # Запуск Django через скрипт ожидания БД
# CMD ["./wait-for-it.sh", "db", "python", "manage.py", "runserver", "0.0.0.0:8000"]
