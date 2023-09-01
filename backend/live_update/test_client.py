import socketio

sio = socketio.Client()

@sio.event
def connect():
    #wait for connection
    print('connection established')
    #sleep 3 seconds
    sio.sleep(3)
    sio.emit('query', {'get': 'domains', 'domain_ids': ['64d5fb73521cb3711dea36b8']})

@sio.on('query_result')
def on_message(data):
    print('I received a message!')
    print(data)

@sio.event
def disconnect():
    print('disconnected from server')

sio.connect('http://localhost:5001')
sio.wait()