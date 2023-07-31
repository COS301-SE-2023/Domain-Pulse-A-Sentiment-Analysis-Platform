#!/bin/bash

# Replace the paths below with the paths to your Django projects' manage.py files
domains_path="../domains/manage.py"
engine_path="../engine/manage.py"
profiles_path="../profiles/manage.py"
sourceconnector_path="../sourceconnector/manage.py"
warehouse_path="../warehouse/manage.py"

function run_django_project {
    path=$1
    port=$2
    python3 "$path" runserver "localhost:$port" &
}

run_django_project "$domains_path" 8000
run_django_project "$engine_path" 8001
run_django_project "$profiles_path" 8002
run_django_project "$sourceconnector_path" 8003
run_django_project "$warehouse_path" 8004

wait