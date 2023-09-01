# import eventlet
# import eventlet.patcher  # Import eventlet's patcher module

import gevent
import gevent.monkey
gevent.monkey.patch_all()

import socketio
import pymongo
import os
from pathlib import Path
from bson import json_util
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

domains_client = pymongo.MongoClient(connection_string_domains, serverSelectionTimeoutMS=2000)
domain_db = domains_client["domain_pulse_domains"]
domains_collection = domain_db["domains"]

warehouse_client = pymongo.MongoClient(connection_string_warehouse, serverSelectionTimeoutMS=2000)
warehouse_db = warehouse_client["domain_pulse_warehouse"]
sentiments_collection = warehouse_db["sentiments"]

# Initialize eventlet
eventlet.monkey_patch()

# Explicitly patch the 'select' module to prevent attribute errors
eventlet.patcher.monkey_patch(select=True)

#Create socketio server
sio = socketio.Server(cors_allowed_origins="*")
app = socketio.WSGIApp(sio)

def listen_to_pipeline():
    print("this was never called")

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
    
    # collection_name = query.get('collection')
    collection_name = 'domains_collection'
    collection = None

    if collection_name == 'domains_collection':
        collection = domains_collection
    elif collection_name == 'sentiments_collection':
        collection = sentiments_collection
    else:
        print(f"Unknown collection: {collection_name}")
        return
    
    # cached_result = query_cache.get(str(query))
    
    with collection.watch(pipeline) as stream:
        for change in stream:
            # Extract relevant data from the change event
            # You might need to customize this part based on your data structure
            changed_object_id = ObjectId(change.get('documentKey').get('_id'))

            print(change)
            sio.emit('database_change', {'changed_object_id': changed_object_id, 'change': change.get('operationType')})



            # # Compare the change data to the cached result
            # if cached_result is not None and change_data == cached_result:
            #     # The data hasn't changed, so we skip emitting the event
            #     continue

            # # Update the cached result
            # query_cache[str(query)] = change_data

            # # Emit the change event to connected sockets for this query
            # for sid in query_sockets.get(query):
            #     sio.emit('query_result', {'query': query, 'change': change_data}, room=sid)

@sio.on('connect')
def connect(sid, environ):
    print('connection established')

if __name__ == '__main__':
    from gevent.pywsgi import WSGIServer

    http_server = WSGIServer(("0.0.0.0", 5001), app)
    print("Server running on http://localhost:5000")

    # Start the MongoDB change tracking loop
    gevent.spawn(check_mongodb_changes)

    try:
        http_server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        http_server.stop()

    # eventlet.spawn(listen_to_pipeline)

    # eventlet.wsgi.server(eventlet.listen(('', 5001)), app)