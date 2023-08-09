import eventlet
import socketio

sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})

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