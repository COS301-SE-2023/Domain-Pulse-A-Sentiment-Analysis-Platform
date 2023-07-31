from utils import db_connection
import pymongo


def add_record(new_record):
    client = pymongo.MongoClient(db_connection.HOST, db_connection.PORT)
    db = client[db_connection.DB_NAME]
    collection = db["sentiment_records"]
    collection.insert_one(new_record)
    client.close()

def remove_record():
    pass

def get_records_by_source_id(source_id):
    client = pymongo.MongoClient(db_connection.HOST, db_connection.PORT)
    db = client[db_connection.DB_NAME]
    collection = db["sentiment_records"]

    query = {"source_id": source_id}

    result = collection.find(query)

    retArr = []
    for document in result:
        retArr.append(dict(document))

    client.close()

    return retArr
