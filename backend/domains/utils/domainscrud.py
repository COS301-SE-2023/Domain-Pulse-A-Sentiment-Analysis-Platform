from utils import db_connection
from bson.objectid import ObjectId

mongo_db = "domain_pulse_domains"
mongo_collection = "domains"

db = db_connection.get_db_handle(mongo_db)


def get_source(source_id):
    collection = db[mongo_collection]

    query = {"sources.source_id": ObjectId(source_id)}
    result = collection.find_one(query)

    final_source = {}
    for source in result["sources"]:
        if source["source_id"] == ObjectId(source_id):
            final_source = source
            break

    final_source["source_id"] = str(final_source["source_id"])

    return final_source


def edit_source(source_id, name):
    collection = db[mongo_collection]

    query = {"sources.source_id": ObjectId(source_id)}
    result = collection.find_one(query)

    for source in result["sources"]:
        if source["source_id"] == ObjectId(source_id):
            source["source_name"] = name
            break
    collection.update_one(
        {"_id": result["_id"]}, {"$set": {"sources": result["sources"]}}
    )
    result["_id"] = str(result["_id"])
    for i in result["sources"]:
        i["source_id"] = str(i["source_id"])

    return result


def set_source_active(source_id, active_status):
    collection = db[mongo_collection]

    query = {"sources.source_id": ObjectId(source_id)}
    result = collection.find_one(query)

    for source in result["sources"]:
        if source["source_id"] == ObjectId(source_id):
            if source["params"]["source_type"] != "livereview":
                return False
            else:
                source["params"]["is_active"] = active_status
                break

    collection.update_one(
        {"_id": result["_id"]}, {"$set": {"sources": result["sources"]}}
    )

    return True


def update_last_refresh(source_id, new_last_refresh):
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

    return True


def create_domain(domain_name, domain_icon, description):
    collection = db[mongo_collection]

    new_item = {
        "name": domain_name,
        "icon": domain_icon,
        "description": description,
        "sources": [],
    }
    ret = collection.insert_one(new_item)

    return {
        "id": str(ret.inserted_id),
        "name": domain_name,
        "icon": domain_icon,
        "description": description,
        "sources": [],
    }


def edit_domain(id, domain_name, domain_icon, description):
    collection = db[mongo_collection]

    ret = collection.find_one_and_update(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "name": domain_name,
                "icon": domain_icon,
                "description": description,
            }
        },
    )

    for i in ret["sources"]:
        i["source_id"] = str(i["source_id"])
    return {
        "id": str(ret["_id"]),
        "name": domain_name,
        "icon": domain_icon,
        "description": description,
        "sources": ret["sources"],
    }


def delete_domain(id):
    collection = db[mongo_collection]
    query = {"_id": ObjectId(id)}
    ret = collection.delete_one(query)

    if ret.deleted_count > 0:
        return {"status": "SUCCESS"}
    else:
        return {"status": "FAILURE", "details": "No Entry Found"}


def get_domain(id):
    collection = db[mongo_collection]
    query = {"_id": ObjectId(id)}
    result = collection.find_one(query)
    if result == None:
        return {"status": "FAILURE", "details": "No Entry Found"}
    resId = str(result["_id"])
    result["_id"] = resId
    for i in result["sources"]:
        i["source_id"] = str(i["source_id"])

    return result


def add_source(domain_id, source_name, source_image_name, params):
    collection = db[mongo_collection]
    query = {"_id": ObjectId(domain_id)}
    result = collection.find_one(query)
    if result == None:
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

    result.update({"new_source_id": str(new_id)})
    return result


def remove_source(domain_id, source_id):
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

    return result


def create_param(domain_id, source_id, key, value):
    collection = db[mongo_collection]
    query = {"_id": ObjectId(domain_id)}
    result = collection.find_one(query)
    if result == None:
        return {"status": "FAILURE", "details": "No Entry Found"}
    for i in result["sources"]:
        if str(i["source_id"]) == (source_id):
            i["params"].update({key: value})
    collection.update_one(query, {"$set": {"sources": result["sources"]}})
    for i in result["sources"]:
        i["source_id"] = str(i["source_id"])
    resId = str(result["_id"])
    result["_id"] = resId

    return result


def delete_param(domain_id, source_id, key):
    collection = db[mongo_collection]
    query = {"_id": ObjectId(domain_id)}
    result = collection.find_one(query)
    if result == None:
        return {"status": "FAILURE", "details": "No Entry Found"}
    for i in result["sources"]:
        if str(i["source_id"]) == (source_id):
            del i["params"][key]
    collection.update_one(query, {"$set": {"sources": result["sources"]}})
    for i in result["sources"]:
        i["source_id"] = str(i["source_id"])
    resId = str(result["_id"])
    result["_id"] = resId

    return result
