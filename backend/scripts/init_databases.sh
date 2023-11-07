#!/bin/bash

# Prompt user for PostgreSQL username and password
read -p "Enter PostgreSQL username: " PGUSER
read -sp "Enter PostgreSQL password: " PGPASSWORD
echo ""

# Connect to the PostgreSQL database and create a new database named "profiles"
PGPASSWORD=$PGPASSWORD psql -h localhost -U $PGUSER -c "CREATE DATABASE profiles;"

# enter docker container and run the migrations on the database
docker compose exec profiles /bin/bash -c "python manage.py migrate"

# Prompt user for MongoDB username and password
read -p "Enter MongoDB username: " MONGO_INITDB_ROOT_USERNAME
read -sp "Enter MongoDB password: " MONGO_INITDB_ROOT_PASSWORD
echo ""


# Connect to MongoDB using environment variables for username and password connecting to the admin database
echo "run the following if the below commands fail"
echo "
use domain_pulse_domains
db.createUser({user: "dpadmin", pwd: "$MONGO_INITDB_ROOT_PASSWORD", roles: [{role: "readWrite", db: "domain_pulse_domains" }] })
use domain_pulse_warehouse
db.createUser({user: "dpadmin", pwd: "$MONGO_INITDB_ROOT_PASSWORD", roles: [{role: "readWrite", db: "domain_pulse_warehouse" }] })
"


mongo --host localhost --port 27019 -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin <<EOF
use domain_pulse_domains
db.createUser({user: "dpadmin", pwd: "$MONGO_INITDB_ROOT_PASSWORD", roles: [{role: "readWrite", db: "domain_pulse_domains"}], passwordDigestor: "server"})
use domain_pulse_warehouse
db.createUser({user: "dpadmin", pwd: "$MONGO_INITDB_ROOT_PASSWORD", roles: [{role: "readWrite", db: "domain_pulse_warehouse"}], passwordDigestor: "server"})
EOF
