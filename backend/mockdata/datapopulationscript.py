import pymongo
import json
import os

# MongoDB connection settings
mongo_host = "localhost"
mongo_port = 27017
mongo_db = "domain_pulse_warehouse"
mongo_collection = "sentiment_records"

# Directory where the JSON documents are stored
json_dir = "."

# Connect to MongoDB
client = pymongo.MongoClient(mongo_host, mongo_port)
db = client[mongo_db]
collection = db[mongo_collection]

# Iterate over JSON files in the directory
for filename in os.listdir(json_dir):
    print(filename)
    if filename.startswith("temp") and filename.endswith(".json"):
        file_path = os.path.join(json_dir, filename)

        # Load JSON document
        with open(file_path, "r") as file:
            json_data = json.load(file)

        # Insert JSON document into MongoDB
        collection.insert_one(json_data)
        print(f"Inserted {filename} into MongoDB.")

# Close the MongoDB connection
client.close()
