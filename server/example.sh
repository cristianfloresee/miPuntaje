#!/bin/bash?
export PGPASSWORD="admin"
database="example_db"
username="example_user"
psql -U postgres -c CREATE ROLE $username WITH SUPERUSER PASSWORD 'example_password';

echo "configuring database: $database..."

dropdb -U example_user $database;
createdb -U example_user $database;