import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_ENV_FILE = BASE_DIR.parent / '.postgresql.env'
load_dotenv(DATABASE_ENV_FILE)

# Ssh tunnel for security
from sshtunnel import SSHTunnelForwarder

# MongoDB connection settings
HOST = os.getenv("MONGO_HOST")
DB_NAME = os.getenv("MONGO_DB_NAME")
if os.getenv("USE_TUNNEL") != "False":
    ssh_tunnel = SSHTunnelForwarder(
        os.getenv("DB_TUNNEL_HOST"),
        ssh_username=os.getenv("DB_TUNNEL_USERNAME"),
        ssh_pkey=os.getenv("DB_TUNNEL_PRIVATE_KEY"),
        remote_bind_address=('127.0.0.1', int(os.getenv("MONGO_PORT"))),
    )

    print("SSH Tunnel Starting")
    ssh_tunnel.start()

    PORT = ssh_tunnel.local_bind_port
else:
    PORT = int(os.getenv("MONGO_PORT"))