@echo off
set CONTAINER=polisem_postgres
set USER=postgres
set DB=build_store
set BACKUP_FILE=backup_new.sql

if not exist %BACKUP_FILE% (
    echo File %BACKUP_FILE% not found!
    pause
    exit /b
)

echo Copying dump into container...
docker cp %BACKUP_FILE% %CONTAINER%:/tmp/backup.sql

echo Dropping and recreating database...
docker exec -i %CONTAINER% psql -U %USER% -c "DROP DATABASE IF EXISTS %DB%;"
docker exec -i %CONTAINER% psql -U %USER% -c "CREATE DATABASE %DB% WITH ENCODING='UTF8';"

echo Restoring database from dump...
docker exec -i %CONTAINER% psql -U %USER% -d %DB% -f /tmp/backup.sql

echo Cleaning up temporary file...
docker exec -i %CONTAINER% rm /tmp/backup.sql

echo Done. Database restored.
pause
