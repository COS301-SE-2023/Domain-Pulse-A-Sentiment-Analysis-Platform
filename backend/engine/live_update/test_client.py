import socketio

sio = socketio.Client()

@sio.event
def connect():
    sio.emit('my_message', {'data': 'foobar'})

@sio.event
def my_message(data):
    print('message received with ', data)
    sio.emit('my response', {'response': 'my response'})

@sio.event
def disconnect():
    print('disconnected from server')

sio.connect('http://localhost:5000')
sio.wait()