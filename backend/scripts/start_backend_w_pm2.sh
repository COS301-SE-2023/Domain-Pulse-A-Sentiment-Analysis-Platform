#!bin/bash

# Checking for pipfile in current dir
if [ ! -f Pipfile ]; then
    echo "Pipfile not found!, run from directory with Pipfile"
    exit 1
fi

# Check if pm2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "Error: pm2 is not installed. Please install pm2 before running this script."
  exit 1
fi

#activate virtual environment
FULL_CURRENT_DIR=$(dirname $(dirname "$(readlink -f "$0")"))
VENV_DIR=$FULL_CURRENT_DIR/.venv

echo "Activating virtual environment: $VENV_DIR"

# Activate the virtual environment if not there
if [[ -n $VENV_DIR ]]; then
  source "$VENV_DIR/bin/activate"
else
    # Create virtual environment if not there
    echo "Please create virtual environment first"
    exit 1
fi

# identify process by parent directory 
PROCESS_IDENT=$(dirname "$FULL_CURRENT_DIR")
PROCESS_IDENT=$(basename "$PROCESS_IDENT")

echo "VENV_DIR: $VENV_DIR"
echo "PROCESS_IDENT: $PROCESS_IDENT"

#Set the pythong interpreter to use because we are in a virtual environment
PYTHON_INTERPRETER="$(which python)"

#List of django projects
declare -a PROJECT_NAMES=("domains" "engine" "profiles" "sourceconnector" "warehouse")

# Generate the ecosystem.config.js file
ECOSYSTEM_FILE="ecosystem.config.js"

# Remove existing ecosystem.config.js file if it exists
if [ -f "$ECOSYSTEM_FILE" ]; then
  rm "$ECOSYSTEM_FILE"
fi

# Generate the ecosystem.config.js file content dynamically
echo "module.exports = {" >> "$ECOSYSTEM_FILE"
echo "  apps: [" >> "$ECOSYSTEM_FILE"

for PROJECT_NAME in "${PROJECT_NAMES[@]}"
do
  # Construct the process name
  PROCESS_NAME="$PROJECT_NAME ($PROCESS_IDENT)"

  pm2 stop "$PROCESS_NAME"

  echo "    {" >> "$ECOSYSTEM_FILE"
  echo "      name: \"$PROCESS_NAME\"," >> "$ECOSYSTEM_FILE"
  echo "      script: \""$PROJECT_NAME"/manage.py\"," >> "$ECOSYSTEM_FILE"
  echo "      args: \"runserver\"," >> "$ECOSYSTEM_FILE"
  echo "      interpreter: \"$PYTHON_INTERPRETER\"," >> "$ECOSYSTEM_FILE"
  echo "      interpreter_args: \"-u\"," >> "$ECOSYSTEM_FILE"
  echo "      watch: false," >> "$ECOSYSTEM_FILE"
  echo "    }," >> "$ECOSYSTEM_FILE"
done

echo "  ]," >> "$ECOSYSTEM_FILE"
echo "};" >> "$ECOSYSTEM_FILE"

pm2 start "$ECOSYSTEM_FILE"

# Remove the ecosystem.config.js file after starting the projects (optional)
# rm "$ECOSYSTEM_FILE"