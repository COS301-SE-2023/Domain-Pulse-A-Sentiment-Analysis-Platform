import requests
import json

# Define the Flask server URL
SERVER_URL = "http://localhost:5010/enque_comment"  # Update with your server's URL

# Sample job data (replace with your actual job data)
sample_job = {"job_id": 1, "data": "Sample job data"}

# Number of requests to send
num_requests = 3

for i in range(num_requests):
    # Send the job data to the server via HTTP POST request
    response = requests.post(SERVER_URL, json=sample_job)

    # Print the response from the server
    print(f"Request {i+1} - HTTP Response Code: {response.status_code}")
    print(f"Request {i+1} - Response Content: {response.text}")
    print("=" * 40)