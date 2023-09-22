from utils import db_connection

mongo_db = "domain_pulse_warehouse"
mongo_collection = "sentiment_records"

db = db_connection.get_db_handle(mongo_db)


def add_record(new_record):
    collection = db[mongo_collection]
    collection.insert_one(new_record)

def get_records_by_source_id(source_id):
    collection = db[mongo_collection]

    query = {"source_id": source_id}

    result = collection.find(query)

    retArr = []
    for document in result:
        retArr.append(dict(document))

    return retArr


# def delete_data_by_soure_ids(source_ids):
#     client = pymongo.MongoClient(mongo_host, mongo_port)
#     db = client[mongo_db]
#     collection = db[mongo_collection]
#     collection.delete_many({"source_id": {"$in": source_ids}})
#     client.close()
