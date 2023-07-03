import csv
import os
import pymongo
from bson.objectid import ObjectId

mongo_host = "localhost"
mongo_port = 27017
mongo_db = "domain_pulse_domains"
mongo_collection = "domains"



def create_domain(domain_name, domain_icon,description):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]

    new_item = {"name":domain_name,"icon":domain_icon,"description":"","description":description,"sources":[]}
    ret= collection.insert_one(new_item)
    client.close()
    return {"id":str(ret.inserted_id),"name":domain_name,"icon":domain_icon,"description":"","description":description,"sources":[]}


def delete_domain(id):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = { "_id": ObjectId(id) }
    ret=collection.delete_one(query)
    client.close()

    if(ret.deleted_count>0):
        return {"status":"SUCCESS"}
    else:
        return {"status":"FAILURE", "details":"No Entry Found"}


def get_domain(id):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = { "_id": ObjectId(id) }
    result =collection.find_one(query)
    resId = str(result["_id"])
    result["_id"]=resId
    client.close()

    return result


def add_source(domain_id, source_name, source_image_name):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = { "_id": ObjectId(domain_id) }
    result =collection.find_one(query)
    new_id = ObjectId()
    new_source= {"source_id":(new_id),"source_name":source_name,"source_icon":source_image_name}
    collection.update_one(result,{"$push":{"sources":new_source}})
    result["sources"].append(new_source)
    for i in result["sources"]:
        i["source_id"]=str(i["source_id"])
    resId = str(result["_id"])
    result["_id"]=resId
    client.close()
    return result


def remove_source(domain_id, source_id):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = { "_id": ObjectId(domain_id) }
    result =collection.find_one(query)
    for i in result["sources"]:
        if str(i["source_id"])==(source_id):
            result["sources"].remove(i)
    collection.update_one(query,{"$set":{"sources":result["sources"]}})
    for i in result["sources"]:
        i["source_id"]=str(i["source_id"])
    resId = str(result["_id"])
    result["_id"]=resId
    client.close()

    return result



