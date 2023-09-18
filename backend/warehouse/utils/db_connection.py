import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_ENV_FILE = BASE_DIR.parent / '.postgresql.env'
load_dotenv(DATABASE_ENV_FILE)

HOST = os.getenv("MONGO_HOST")
DB_NAME = "domain_pulse_warehouse"
PORT = os.getenv("MONGO_PORT")
USER = os.getenv("MONGO_USER")
PASSWORD = os.getenv("MONGO_PASSWORD") 

#maps database name to db handle
db_connections = {}

def get_db_handle(database_name=DB_NAME):
    if database_name in db_connections:
        return db_connections[database_name]
    else:
        connection_string = f"mongodb://{USER}:{PASSWORD}@{HOST}:{PORT}/{database_name}?directConnection=true"
        client = MongoClient(connection_string)
        db_handle = client[database_name]
        db_connections[database_name] = db_handle
        return db_handle