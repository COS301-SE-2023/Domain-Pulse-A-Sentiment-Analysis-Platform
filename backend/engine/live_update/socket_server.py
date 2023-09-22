import eventlet
import socketio

# import pymongo
import os
from pathlib import Path
from bson import ObjectId
from dotenv import load_dotenv

# # Get the directory containing your_script.py
# current_dir = os.path.dirname(os.path.abspath(__file__))

# # Add the parent_directory and sibling_directory to sys.path
# parent_dir = os.path.dirname(current_dir)
# os.sys.path.insert(0, parent_dir)

# from processor import processing
# from postprocessor import aggregation


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

DATABASE_ENV_FILE = BACKEND_DIR / '.postgresql.env'
load_dotenv(DATABASE_ENV_FILE)

HOST = os.getenv("MONGO_HOST")
DB_NAME = os.getenv("MONGO_DB_NAME")
PORT = os.getenv("MONGO_PORT")
USER = os.getenv("MONGO_USER")
PASSWORD = os.getenv("MONGO_PASSWORD")


sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})


connection_string_warehouse = f"mongodb://{USER}:{PASSWORD}@{HOST}:{PORT}/domain_pulse_warehouse?directConnection=true"
# warehouse_client = pymongo.MongoClient(connection_string_warehouse)


@sio.event
def connect(sid, environ):
    print('connect ', sid)

rooms = set()

#map of room_id to list of scores
scores_map = {}

# @sio.event
# def process_item(sid, data):
#     print("process_item: ", data)

#     item = data["item"]
#     room_id = data["room_id"]
#     timestamp = data["timestamp"]

#     #when there are this many then we will know we are done
#     num_items = data["num_items"]

#     scores = scores_map.get(room_id, [])

#     new_score = processing.analyse_content(item)
#     new_score["timestamp"] = timestamp

#     # compute aggregated metrics
#     aggregated_metrics = aggregation.aggregate_sentiment_data(scores)
#     new_data_to_send = {
#         "new_individual_metrics": new_score,
#         "aggregated_metrics": aggregated_metrics,
#         "room_id": room_id,
#     }

#     #add to db
#     # warehouse_client.domain_pulse_warehouse.sentiment_records.insert_one(new_score)

#     #send to client
#     print("sending to socket server: ", new_data_to_send)

#     sio.emit("new_source_data", new_data_to_send)

#     scores_map[room_id] = scores + [new_score]
#     if len(scores_map[room_id]) == num_items:
#         aggregated_metrics = aggregation.aggregate_sentiment_data(scores)

#         sio.emit("finished_processing", {"room_id": room_id, "aggregated_metrics": aggregated_metrics})
#         scores_map[room_id] = []


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