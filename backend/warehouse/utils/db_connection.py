import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_ENV_FILE = BASE_DIR.parent / '.postgresql.env'
load_dotenv(DATABASE_ENV_FILE)

# Ssh tunnel for security
from sshtunnel import SSHTunnelForwarder

ssh_tunnel = SSHTunnelForwarder(
    os.getenv("DB_TUNNEL_HOST"),
    ssh_username=os.getenv("DB_TUNNEL_USERNAME"),
    ssh_pkey=os.getenv("DB_TUNNEL_PRIVATE_KEY"),
    remote_bind_address=('127.0.0.1', int(os.getenv("MONGO_PORT"))),
)

ssh_tunnel.start()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ENV_FILE = BASE_DIR.parent / '.env'
DATABASE_ENV_FILE = BASE_DIR.parent / '.postgresql.env'
# load_dotenv(ENV_FILE)
load_dotenv(DATABASE_ENV_FILE)

# MongoDB connection settings
HOST = os.getenv("MONGO_HOST")
PORT = ssh_tunnel.local_bind_port
DB_NAME = os.getenv("MONGO_DB_NAME")