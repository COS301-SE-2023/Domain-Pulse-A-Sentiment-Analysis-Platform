#!/bin/bash

# Check the number of arguments
if [ $# -lt 1 ]; then
  echo "Usage: $0 <environment> (e.g., dev or prod"
  exit 1
fi

#Check for .env and .postgres.env in currend directory
if [ ! -f .env ] || [ ! -f .postgresql.env ]; then
  echo "Missing .env or .postgres.env file in current directory."
  exit 1
fi

# Define the first argument as the environment
environment="$1"

# Define the list of nodes based on the environment
if [ "$environment" == "dev" ]; then
  nodes=("dp-node-01")
  compose_prefix="dev-"
  branch="dev"
elif [ "$environment" == "prod" ]; then
  nodes=("dp-node-02" "dp-node-03")
  compose_prefix="prod-"
  branch="main"
else
  echo "Invalid environment argument. Use 'dev' or 'prod'."
  exit 1
fi

# Define the docker-compose directory on the remote hosts
compose_dir="/home/rocky/domain-pulse"

# Define the commands to execute on each node
# make space on the server because there isnt enough, there will be some downtime
delete_command="cd $compose_dir && docker compose -f ${compose_prefix}server-compose.yml down && docker image prune -all --force && sudo rm -rf /var/lib/docker/overlay2"

pull_command="cd $compose_dir && git pull && git checkout $branch && docker compose -f ${compose_prefix}server-compose.yml pull"
up_command="cd $compose_dir && docker compose -f ${compose_prefix}server-compose.yml up -d"

# Iterate through the nodes and execute the commands
for node in "${nodes[@]}"; do
  echo "Connecting to $node..."
  ssh "$node" "$pull_command"
  scp .env "$node:$compose_dir/backend/.env"
  scp .postgres.env "$node:$compose_dir/backend/.postgres.env"
  ssh "$node" "$up_command"
  echo "Finished on $node."
done

echo "Deployment for $environment environment on branch $branch is complete."
