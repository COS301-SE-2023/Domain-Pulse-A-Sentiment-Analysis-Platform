import csv
import os
import pymongo
from bson.objectid import ObjectId

mongo_host = "localhost"
mongo_port = 27017
mongo_db = "domain_pulse_domains"
mongo_collection = "domains"



DOMAIN_ID_COUNTER = 11
USER_ID_COUNTER = 10
SOURCE_ID_COUNTER = 10

domains_db = [
    {
        "user_id": 1,
        "domains": [
            {
                "domain_id": 1,
                "domain_name": "Starbucks",
                "image_url": "starbucks-logo-69391AB0A9-seeklogo.com.png",
                "sources": [
                    {
                        "source_id": 1,
                        "source_name": "Facebook",
                        "source_image_name": "facebook-logo.png",
                    }
                ],
            },
            {
                "domain_id": 10,
                "domain_name": "Apple",
                "image_url": "apple-1-logo-png-transparent.png",
                "sources": [],
            },
            {
                "domain_id": 11,
                "domain_name": "McDonalds",
                "image_url": "donalds-logo.png",
                "sources": [],
            },
        ],
    },
    {
        "user_id": 2,
        "domains": [
            {
                "domain_id": 2,
                "domain_name": "GodOfWar",
                "sources": [
                    {
                        "source_id": 2,
                        "source_name": "Reddit",
                        "source_image_name": "reddit-logo.png",
                    }
                ],
            },
            {
                "domain_id": 3,
                "domain_name": "LeinsterRugby",
                "sources": [
                    {
                        "source_id": 3,
                        "source_name": "Instagram",
                        "source_image_name": "instagram-Icon.png",
                    }
                ],
            },
        ],
    },
    {
        "user_id": 3,
        "domains": [
            {
                "domain_id": 4,
                "domain_name": "Bitcoin",
                "sources": [
                    {
                        "source_id": 8,
                        "source_name": "Facebook",
                        "source_image_name": "facebook-logo.png",
                    },
                    {
                        "source_id": 9,
                        "source_name": "Reddit",
                        "source_image_name": "reddit-logo.png",
                    },
                ],
            }
        ],
    },
    {"user_id": 4, "domains": []},
    {"user_id": 5, "domains": []},
]


def next_user_id():
    global USER_ID_COUNTER
    USER_ID_COUNTER += 1
    return USER_ID_COUNTER


def next_source_id():
    global SOURCE_ID_COUNTER
    SOURCE_ID_COUNTER += 1
    return SOURCE_ID_COUNTER


def next_domain_id():
    global DOMAIN_ID_COUNTER
    DOMAIN_ID_COUNTER += 1
    return DOMAIN_ID_COUNTER


def create_domain(domain_name, domain_icon,description):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]

    new_item = {"name":domain_name,"icon":domain_icon,"description":"","description":description,"sources":[]}
    ret= collection.insert_one(new_item)
    return {"id":str(ret.inserted_id),"name":domain_name,"icon":domain_icon,"description":"","description":description,"sources":[]}


def delete_domain(id):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = { "_id": ObjectId(id) }
    ret=collection.delete_one(query)
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
    return result


def add_source(domain_id, source_name, source_image_name):
    client = pymongo.MongoClient(mongo_host, mongo_port)
    db = client[mongo_db]
    collection = db[mongo_collection]
    query = { "_id": ObjectId(domain_id) }
    result =collection.find_one(query)
    size=len(result["sources"])
    new_source= {"source_id":(size+1),"source_name":source_name,"source_icon":source_image_name}
    out = collection.find_one_and_update(result,{"$push":{"sources":new_source}})
    out["sources"].append(new_source)
    resId = str(out["_id"])
    out["_id"]=resId
    return out


def remove_source(user_id, domain_id, source_id):
    user_id = int(user_id)
    domain_id = int(domain_id)
    source_id = int(source_id)

    for entry in domains_db:
        if entry["user_id"] == user_id:
            for domain in list(entry["domains"]):
                if int(domain["domain_id"]) == domain_id:
                    for source in domain["sources"]:
                        if source["source_id"] == source_id:
                            domain["sources"].remove(source)
                            return get_domains(user_id)
    return get_domains(user_id)

