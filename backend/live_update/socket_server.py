import eventlet
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

# Dictionary to store cached query results
query_cache = {}

# Dictionary to store the list of sockets concerned with a query
query_sockets = {}

#connect to socket.io which listens to mongo
mongo_sio = socketio.Client()

@mongo_sio.on('connect')
def on_connect():
    print('connected to mongo')

@mongo_sio.on('database_change')
def on_database_change(data):
    print('database changed')
    print(data)

mongo_sio.connect('http://0.0.0.0:5001')


#Create socketio server
server_sio = socketio.Server()
app = socketio.WSGIApp(server_sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})

#there are 3 things that one can be concerned about when watching a db
#1. evertything in a collection
#2. everything in a collection that has a specific value for a field
#3. a set of objectIds

#all the rooms pertain to the hash of a specific query
#when such a query is updated, via a change from the ChangeStream, all the clients in the room will receive the update

#the format of a request to listen wil be as follows
'''
{
    'get': TYPE,
    == for TYPE 'domains' ==
    'user_id': DOMAIN_ID

    == fro TYPE 'domain' ==
    'domain_id': DOMAIN_ID

    == for TYPE 'sources' ==
    'domain_id': DOMAIN_ID

    == for TYPE 'comments' ==
    'source_ids': [SOURCE_ID, ...]    
}
'''

# Function to listen for changes in a specific pipeline
def listen_to_pipeline(query):
    pipeline = query.get('pipeline')
    collection_name = query.get('collection')
    collection = None

    if collection_name == 'domains_collection':
        collection = domains_collection
    elif collection_name == 'sentiments_collection':
        collection = sentiments_collection
    else:
        print(f"Unknown collection: {collection_name}")
        return
    
    cached_result = query_cache.get(str(query))
    
    with collection.watch(pipeline) as stream:
        for change in stream:
            # Extract relevant data from the change event
            # You might need to customize this part based on your data structure
            change_data = change.get('fullDocument')
            #rerun query
            # query_result = perform_query(query)
            print("something changed: ", change_data)

            # # Compare the change data to the cached result
            # if cached_result is not None and change_data == cached_result:
            #     # The data hasn't changed, so we skip emitting the event
            #     continue

            # # Update the cached result
            # query_cache[str(query)] = change_data

            # # Emit the change event to connected sockets for this query
            # for sid in query_sockets.get(query):
            #     sio.emit('query_result', {'query': query, 'change': change_data}, room=sid)


# Function to perform a database query based on the query body
def perform_query(query):
    # Implement the database query logic based on the query body
    # Return the query result
    # Example: query the 'collection' using the query.get('get') and other fields
    # You need to customize this part based on your data structure and query types

    query_result = None

    GET_TYPE = query['get']

    if GET_TYPE == 'domains':
        domain_ids = query['domain_ids']
        domain_ids = [ObjectId(domain_id) for domain_id in domain_ids]
        query_result = domains_collection.find({'_id': {'$in': domain_ids}})
    elif GET_TYPE == 'domain':
        domain_id = query['domain_id']
        query_result = domains_collection.find({'_id': domain_id})
    elif GET_TYPE == 'sources':
        source_ids = query['source_ids']
        query = {"sources.source_id": {"$in": source_ids}}
        return_data = domains_collection.find(query)
    elif GET_TYPE == 'comments':
        source_ids = query['source_ids']
        query = {"sources.source_id": {"$in": source_ids}}
        return_data = sentiments_collection.find(query)

    return_data = []

    for doc in query_result:
        return_data.append(json_util.dumps(doc))

    return return_data

@server_sio.on('query')
def handle_query(sid, query):
    #pre-process the query to add information about the needed table and such
    GET_TYPE = query['get']
    if GET_TYPE == 'domains' or GET_TYPE == 'domain' or GET_TYPE == 'sources':
        query['collection'] = 'domains_collection'
    elif GET_TYPE == 'comments':
        query['collection'] = 'sentiments_collection'

    #preprocess and select the pipeline
    #for now just listen to everything
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
    query['pipeline'] = pipeline

    # Check if the query is already in the cache
    cached_result = query_cache.get(str(query))
    if cached_result is not None:
        print("Returning cached result")
        server_sio.emit('query_result', {'result': cached_result}, room=sid)
        return

    # Add the socket to the pool of sockets for this query
    if str(query) not in query_sockets:
        query_sockets[str(query)] = []
    query_sockets[str(query)].append(sid)

    # Start a new thread to listen to the specified pipeline
    print("query", query)
    # eventlet.spawn(listen_to_pipeline, query)

    # Perform the database query
    result = perform_query(query)

    print("result", result)

    # Cache the query result
    query_cache[str(query)] = result

    print("query_cache", query_cache)

    # Send the result back to the client
    print(f"emmitting to {sid}", {'result': str(result)})
    server_sio.emit('query_result', {'result': str(result)}, to=sid)

@server_sio.event
def connect(sid, environ):
    print('connect ', sid)

rooms = set()

# Function to handle socket disconnection
@server_sio.on('disconnect')
def handle_disconnect(sid):
    print(f"Client {sid} disconnected")
    # Remove the disconnected socket from the query_sockets pool
    for query, sockets in query_sockets.items():
        if sid in sockets:
            sockets.remove(sid)
            query_sockets[query] = sockets


if __name__ == '__main__':
    mongo_sio.wait()
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)