import eventlet
import socketio
import pymongo
import hashlib
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent

DATABASE_ENV_FILE = BASE_DIR.parent / '.postgresql.env'
load_dotenv(DATABASE_ENV_FILE)

mongo_user = os.getenv('MONGO_USER')
mongo_password = os.getenv('MONGO_PASSWORD')

connection_string = f"mongodb://{mongo_user}:{mongo_password}@domainpulse.app:27017/domain_pulse_domains?directConnection=true"
print(connection_string)

client = pymongo.MongoClient(connection_string, serverSelectionTimeoutMS=2000)
# client = pymongo.MongoClient('localhost', mongo_port, serverSelectionTimeoutMS=2000, replicaSet='rs0')
db = client["domain_pulse_domains"]

# change_stream = db.domains.watch(pipeline)

# # Iterate over the change stream
# for change in change_stream:
#     print(change)

sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
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

    == fro TYPE 'domain_info' ==
    'domain_id': DOMAIN_ID

    == for TYPE 'sources' ==
    'domain_id': DOMAIN_ID

    == for TYPE 'comments' ==
    'source_ids': [SOURCE_ID, ...]    
}
'''

# Create a pipeline to capture all changes
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

# a dictionary that maps a query to the list of socket ids that are listening to it
query_to_sids = {}
# a dictionary that maps a queries to the data that is returned from the db
query_to_data = {}

def get_query_data(query_body): # returns (TYPE, DATA)
    # check the map that has the most up to date info for the wanted query

    # if the query is not in the map, then we need to add it to the map and get the data from the db

    # if the query is in the map, then we simply return the data from the map
        # the changeStream will do any updating of data in the map
    return None, None

def update_the_concerned_sids():
    
    
    return None

@sio.event
def query(sid, data):
    query_body = data
    return_type, data = get_query_data(query_body)

    sio.emit(return_type, data, room=sid)

@sio.event
def connect(sid, environ):
    print('connect ', sid)

rooms = set()

@sio.event
def new_room(sid, data):
    sio.enter_room(sid, data['room_id'])
    
@sio.event
def join_room(sid, data):
    sio.enter_room(sid, data['room_id'])

@sio.event
def new_source_data(sid, data):
    # print('new_source_data: ', data)
    sio.emit('new_source_data', data, room=data['room_id'])

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)