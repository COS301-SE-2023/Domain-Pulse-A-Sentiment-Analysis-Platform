from utils import db_connection

mongo_db = "domain_pulse_warehouse"
mongo_collection = "refresh_queue"

db = db_connection.get_db_handle(mongo_db)


def add_list(source_id, new_data_list):
    collection = db[mongo_collection]
    collection.insert_one({"source_id": source_id, "queue": new_data_list})


def process_batch(source_id):
    collection = db[mongo_collection]

    query = {"source_id": source_id}

    result = collection.find_one(query)

    if result is None:
        return False, ["no source"]

    curr_queue = result["queue"]
    if len(curr_queue) == 0:
        collection.delete_one(query)
        return False, ["source done"]
    else:
        num_to_extract = min(5, len(curr_queue))
        next_items = curr_queue[:num_to_extract]

        if num_to_extract < 5:
            new_queue = []
        else:
            new_queue = curr_queue[num_to_extract:]

        # Update the queue in the database
        collection.update_one(query, {"$set": {"queue": new_queue}})

        return True, next_items
