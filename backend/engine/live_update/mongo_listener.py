import pymongo
import motor.motor_asyncio
import asyncio

import socketio
import pymongo
import os
from pathlib import Path
from bson import ObjectId
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent

DATABASE_ENV_FILE = BASE_DIR.parent / '.postgresql.env'
load_dotenv(DATABASE_ENV_FILE)

HOST = os.getenv("MONGO_HOST")
DB_NAME = os.getenv("MONGO_DB_NAME")
PORT = os.getenv("MONGO_PORT")
USER = os.getenv("MONGO_USER")
PASSWORD = os.getenv("MONGO_PASSWORD")

#Setting up the connections to the database
connection_string_domains = f"mongodb://{USER}:{PASSWORD}@{HOST}:{PORT}/domain_pulse_domains?directConnection=true"
connection_string_warehouse = f"mongodb://{USER}:{PASSWORD}@{HOST}:{PORT}/domain_pulse_warehouse?directConnection=true"

# Initialize the Socket.IO client
sio = socketio.AsyncClient()

async def listen_to_mongodb_changes():
    domains_client = motor.motor_asyncio.AsyncIOMotorClient(connection_string_domains)
    domains_db = domains_client.domain_pulse_domains
    domains_collection = domains_db.domains

    warehouse_client = motor.motor_asyncio.AsyncIOMotorClient(connection_string_warehouse)
    warhouse_db = warehouse_client.domain_pulse_warehouse
    sentiments_collection = warhouse_db.sentiment_records

    @sio.on("connect")
    def on_connect():
        print("Connected to Socket.IO server")

    @sio.on("disconnect")
    def on_disconnect():
        print("Disconnected from Socket.IO server")

    await sio.connect("http://0.0.0.0:5000")  # Replace with the actual Socket.IO server URL
    pipeline = [
        {
            '$match': {
                '$or': [
                    { 'operationType': 'insert' },
                    { 'operationType': 'update' },
                    { 'operationType': 'replace' },
                    { 'operationType': 'delete' }
                ]
            }
        }
    ]

    #Send the changes to the Socket.IO server so that they can be processed and forwarded to clients
    async def emit_changes(collection, collection_name):
        async with collection.watch(pipeline) as stream:
            async for change in stream:
                print(change)

                changed_object_id = ObjectId(change.get('documentKey').get('_id')).__str__()
                await sio.emit('database_change', {'changed_object_id': changed_object_id, 'change': change.get('operationType'), 'collection_name': collection_name})


    # Use asyncio.gather to concurrently listen to changes from both collections
    await asyncio.gather(
        emit_changes(domains_collection, "domains"),
        emit_changes(sentiments_collection, "sentiments")
    )

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(listen_to_mongodb_changes())