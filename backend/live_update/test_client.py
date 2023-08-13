import socketio

sio = socketio.Client()

@sio.event
def connect():
    # sio.emit('my_message', {'data': 'foobar'})
    sio.emit('listen', {'get': 'domains', 'user_id': '5e9b3b9b9c6f9b0b9c6f9b0b'})

@sio.event
def my_message(data):
    print('message received with ', data)
    sio.emit('my response', {'response': 'my response'})

@sio.event
def disconnect():
    print('disconnected from server')

sio.connect('http://localhost:5000')
sio.wait()