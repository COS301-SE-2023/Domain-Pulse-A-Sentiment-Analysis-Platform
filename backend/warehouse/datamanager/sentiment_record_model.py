from utils import db_connection
import pymongo

def add_record():
    pass


def remove_record():
    pass

def get_records_by_source_id(source_id):
    client = pymongo.MongoClient(db_connection.HOST, db_connection.PORT)
    db = client[db_connection.DB_NAME]
    collection = db["sentiment_records"]

    query = {"source_id": int(source_id)}

    result = collection.find(query)

    retArr = []
    for document in result:
        retArr.append(dict(document))

    client.close()

    return retArr
