#!/bin/sh
set -e

# wait for Postgres to be ready
echo "Waiting for Postgres at $DB_HOST:$DB_PORT…"
until pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; do
  sleep 1
done
echo "Postgres is up!"

# apply schema
echo "Applying schema…"
export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -f db/schema.sql

# seed data
echo "Seeding database…"
node seed.js

# start your server
echo "Starting app…"
exec node server.js
