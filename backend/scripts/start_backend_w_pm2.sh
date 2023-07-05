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
VENV_DIR=$(find /home/$USER/.local/share/virtualenvs -maxdepth 1 -type d -name "backend*" -print -quit)
# Get the last part of the VENV_DIR
VENV_NAME=$(basename "$VENV_DIR")

echo "Activating virtual environment: $VENV_DIR"

# Activate the virtual environment if not there
if [[ -n $VENV_DIR ]]; then
  source "$VENV_DIR/bin/activate"
else
    # Create virtual environment if not there
    echo "Please create virtual environment first"
    exit 1
fi

#Set the pythong interpreter to use because we are in a virtual environment
PYTHON_INTERPRETER="$(which python)"

#List of django projects
declare -a PROJECT_NAMES=("domains" "engine" "profiles" "sourceconnector" "warehouse")

for PROJECT_NAME in "${PROJECT_NAMES[@]}"
do
  # Construct the process name
  PROCESS_NAME="$PROJECT_NAME ($VENV_NAME)"

  # Check if the PM2 process is already running
  PM2_PROCESS_CHECK=$(pm2 describe "$PROCESS_NAME" | grep "status" | cut -d':' -f2 | tr -d '[:space:]')

  if [[ "$PM2_PROCESS_CHECK" == "online" ]]; then
    echo "The PM2 process '$PROCESS_NAME' is already running."
  else
    # Start the Django project using PM2
    pm2 start --name="$PROCESS_NAME" --interpreter="$PYTHON_INTERPRETER" -- "$CURRENT_DIR/$PROJECT_NAME/manage.py" runserver
  fi
done