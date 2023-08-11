from utils import db_connection
import pymongo

mongo_host = db_connection.HOST
mongo_port = db_connection.PORT
mongo_db = "domain_pulse_warehouse"
mongo_collection = "sentiment_records"


def add_record(new_record):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    collection.insert_one(new_record)
    client.close()


def get_records_by_source_id(source_id):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]

    query = {"source_id": source_id}

    result = collection.find(query)

    retArr = []
    for document in result:
        retArr.append(dict(document))

    client.close()

    return retArr


def delete_data_by_soure_ids(source_ids):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]

    collection.delete_many({"source_id": {"$in": source_ids}})

    client.close()
