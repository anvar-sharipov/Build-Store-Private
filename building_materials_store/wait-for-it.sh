#!/bin/bash
set -e

host="$1"
shift

echo "Waiting for PostgreSQL at $host:5432..."

until PGPASSWORD="$DATABASE_PASSWORD" psql -h "$host" -p 5432 -U "$DATABASE_USER" -d "$DATABASE_NAME" -c '\q' 2>/dev/null; do
  echo "Postgres is unavailable - sleeping for 2 seconds"
  sleep 2
done

echo "Postgres is up - executing command"
exec "$@"

