from utils import db_connection
import pymongo
from bson.objectid import ObjectId

mongo_host = db_connection.HOST
mongo_port = db_connection.PORT
mongo_db = "domain_pulse_domains"
mongo_collection = "domains"

def get_source(source_id):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]

    query = {"sources.source_id": ObjectId(source_id)}
    result = collection.find_one(query)

    final_source = {}
    for source in result["sources"]:
        if source["source_id"] == ObjectId(source_id):
            final_source = source

    client.close()

    final_source["source_id"] = str(final_source["source_id"])

    return final_source


def update_last_refresh(source_id, new_last_refresh):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]

    source_id = ObjectId(source_id)

    try:
        query = {"sources.source_id": source_id}
        result = collection.find_one(query)

        for source in result["sources"]:
            if source["source_id"] == source_id:
                source["last_refresh_timestamp"] = new_last_refresh
                break

        collection.update_one(
            {"_id": result["_id"]}, {"$set": {"sources": result["sources"]}}
        )
    except Exception:
        return False

    client.close()

    print("got here")

    return True


def create_domain(domain_name, domain_icon, description):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]

    new_item = {
        "name": domain_name,
        "icon": domain_icon,
        "description": description,
        "sources": [],
    }
    ret = collection.insert_one(new_item)
    client.close()
    return {
        "id": str(ret.inserted_id),
        "name": domain_name,
        "icon": domain_icon,
        "description": "",
        "description": description,
        "sources": [],
    }


def delete_domain(id):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = {"_id": ObjectId(id)}
    ret = collection.delete_one(query)
    client.close()

    if ret.deleted_count > 0:
        return {"status": "SUCCESS"}
    else:
        return {"status": "FAILURE", "details": "No Entry Found"}


def get_domain(id):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = {"_id": ObjectId(id)}
    result = collection.find_one(query)
    if result == None:
        client.close()
        return {"status": "FAILURE", "details": "No Entry Found"}
    resId = str(result["_id"])
    result["_id"] = resId
    for i in result["sources"]:
        i["source_id"] = str(i["source_id"])
    client.close()

    return result


def add_source(domain_id, source_name, source_image_name, params):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = {"_id": ObjectId(domain_id)}
    result = collection.find_one(query)
    if result == None:
        client.close()
        return {"status": "FAILURE", "details": "No Entry Found"}
    new_id = ObjectId()
    new_source = {
        "source_id": (new_id),
        "source_name": source_name,
        "source_icon": source_image_name,
        "last_refresh_timestamp": 0,
        "params": params,
    }
    collection.update_one(result, {"$push": {"sources": new_source}})
    result["sources"].append(new_source)
    for i in result["sources"]:
        i["source_id"] = str(i["source_id"])
    resId = str(result["_id"])
    result["_id"] = resId
    client.close()
    return result


def remove_source(domain_id, source_id):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = {"_id": ObjectId(domain_id)}
    result = collection.find_one(query)
    for i in result["sources"]:
        if str(i["source_id"]) == (source_id):
            result["sources"].remove(i)
    collection.update_one(query, {"$set": {"sources": result["sources"]}})
    for i in result["sources"]:
        i["source_id"] = str(i["source_id"])
    resId = str(result["_id"])
    result["_id"] = resId
    client.close()

    return result


def create_param(domain_id, source_id, key, value):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = {"_id": ObjectId(domain_id)}
    result = collection.find_one(query)
    if result == None:
        client.close()
        return {"status": "FAILURE", "details": "No Entry Found"}
    for i in result["sources"]:
        if str(i["source_id"]) == (source_id):
            i["params"].update({key: value})
    collection.update_one(query, {"$set": {"sources": result["sources"]}})
    for i in result["sources"]:
        i["source_id"] = str(i["source_id"])
    resId = str(result["_id"])
    result["_id"] = resId
    client.close()

    return result


def delete_param(domain_id, source_id, key):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = {"_id": ObjectId(domain_id)}
    result = collection.find_one(query)
    if result == None:
        client.close()
        return {"status": "FAILURE", "details": "No Entry Found"}
    for i in result["sources"]:
        if str(i["source_id"]) == (source_id):
            del i["params"][key]
    collection.update_one(query, {"$set": {"sources": result["sources"]}})
    for i in result["sources"]:
        i["source_id"] = str(i["source_id"])
    resId = str(result["_id"])
    result["_id"] = resId
    client.close()

    return result
