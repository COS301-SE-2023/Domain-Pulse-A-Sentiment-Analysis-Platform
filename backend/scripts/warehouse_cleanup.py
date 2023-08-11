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
if os.getenv("USE_TUNNEL") != "False":
    ssh_tunnel = SSHTunnelForwarder(
        os.getenv("DB_TUNNEL_HOST"),
        ssh_username=os.getenv("DB_TUNNEL_USERNAME"),
        ssh_pkey=os.getenv("DB_TUNNEL_PRIVATE_KEY"),
        remote_bind_address=("127.0.0.1", int(os.getenv("MONGO_PORT"))),
    )

    print("SSH Tunnel Starting")
    ssh_tunnel.start()

    PORT = ssh_tunnel.local_bind_port
else:
    PORT = int(os.getenv("MONGO_PORT"))


# Query the domains database to get all the in-use source_ids
mongo_host = HOST
mongo_port = PORT
mongo_db = "domain_pulse_domains"
mongo_collection = "domains"

client = pymongo.MongoClient(mongo_host, mongo_port)
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
