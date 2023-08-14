import os
from pathlib import Path
from dotenv import load_dotenv
import pymongo

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
print(BASE_DIR)

DATABASE_ENV_FILE = BASE_DIR / ".postgresql.env"
load_dotenv(DATABASE_ENV_FILE)

# Ssh tunnel for security
from sshtunnel import SSHTunnelForwarder

# MongoDB connection settings
HOST = os.getenv("MONGO_HOST")
DB_NAME = os.getenv("MONGO_DB_NAME")
PORT = os.getenv("MONGO_PORT")
USER = os.getenv("MONGO_USER")
PASSWORD = os.getenv("MONGO_PASSWORD")

# Query the domains database to get all the in-use source_ids
mongo_db = "domain_pulse_domains"
mongo_collection = "domains"

connection_string = f"mongodb://{USER}:{PASSWORD}@{HOST}:{PORT}/{mongo_db}?directConnection=true"

client = pymongo.MongoClient(connection_string)
db = client[mongo_db]
collection = db[mongo_collection]
query = {}
result = collection.find(query)
source_ids = set()
for domain in result:
    sources = domain["sources"]
    for source in sources:
        source_ids.add(str(source["source_id"]))

client.close()
source_ids = list(source_ids)


# Remove the unused sources
mongo_host = HOST
mongo_port = PORT
mongo_db = "domain_pulse_warehouse"
mongo_collection = "sentiment_records"

client = pymongo.MongoClient(mongo_host, mongo_port)
db = client[mongo_db]
collection = db[mongo_collection]
collection.delete_many({"source_id": {"$nin": source_ids}})
client.close()
