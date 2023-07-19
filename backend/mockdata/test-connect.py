import pymongo

mongo_host = "localhost"
mongo_port = 27017
mongo_db = "domain_pulse_warehouse"
mongo_collection = "sentiment_records"

client = pymongo.MongoClient(mongo_host, mongo_port)
db = client[mongo_db]
collection = db[mongo_collection]

query = {"source_id": 0}

result = collection.find(query)

for document in result:
    print(dict(document))

client.close()
