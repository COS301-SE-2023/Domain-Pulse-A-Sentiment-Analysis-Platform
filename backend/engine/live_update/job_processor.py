from flask import Flask, request, jsonify
import threading
import time

import socketio

sio = socketio.AsyncClient()

app = Flask(__name__)

# Shared list to store incoming request data
data_list = []

async def process_data_task():
    while True:
        if data_list:
            data = data_list.pop(0)
            # Simulate processing (you can replace this with your actual processing logic)
            processed_data = f"Processed: {data}"
            await sio.emit("new_source_data", {"data": processed_data})
            print(processed_data)
            await asyncio.sleep(0.5)  # Simulate processing time
        else:
            await asyncio.sleep(1)  # Wait if there's no data to process

@sio.on('connect')
async def on_connect():
    print("SocketIO client connected.")
    # You can perform any actions you want here when the connection is established.

@app.route('/enque_comment', methods=['POST'])
def add_data():
    try:
        data = request.json
        data_list.append(data)
        return jsonify({'message': 'Data added successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import asyncio
    sio.connect("http://localhost:5000")
    
    processing_thread = threading.Thread(target=lambda: asyncio.run(process_data_task()))
    processing_thread.daemon = True
    processing_thread.start()
    
    app.run(host='0.0.0.0', port=5010)
