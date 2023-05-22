import csv
import os

DOMAIN_ID_COUNTER = 11
USER_ID_COUNTER = 10
SOURCE_ID_COUNTER = 10

domains_db = [
    {
        "user_id" : 1,
        "domains" : [
            {
                "domain_id":1,
                "domain_name":"Starbucks",
                "image_url": "starbucks-logo-69391AB0A9-seeklogo.com.png",
                "sources" : [
                    {
                        "source_id":1,
                        "source_name":"Facebook",
                        "source_image_name":"facebook-logo.png"
                    }
                ]
            },
            {
                "domain_id":10,
                "domain_name":"Apple",
                "image_url": "apple-1-logo-png-transparent.png",
                "sources" : []
            },
            {
                "domain_id":11,
                "domain_name":"McDonalds",
                "image_url": "donalds-logo.png",
                "sources" : []
            }
        ]
    },
     {
        "user_id" : 2,
        "domains" : [
            {
                "domain_id":2,
                "domain_name":"GodOfWar",
                "sources" : [
                    {
                        "source_id":2,
                        "source_name":"Reddit",
                        "source_image_name":"reddit-logo.png"
                    }
                ]
            },
             {
                "domain_id":3,
                "domain_name":"LeinsterRugby",
                "sources" : [
                    {
                        "source_id":3,
                        "source_name":"Instagram",
                        "source_image_name":"instagram-Icon.png"
                    }
                ]
            }
        ]
    },
     {
        "user_id" : 3,
        "domains" : [
            {
                "domain_id":4,
                "domain_name":"Bitcoin",
                "sources" : [
                    {
                        "source_id":8,
                        "source_name":"Facebook",
                        "source_image_name":"facebook-logo.png"
                    },
                    {
                        "source_id":9,
                        "source_name":"Reddit",
                        "source_image_name":"reddit-logo.png"
                    }
                ]
            }
        ]
    },
     {
        "user_id" : 4,
        "domains" : []
    },
     {
        "user_id" : 5,
        "domains" : []
    },
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

def add_domain(user_id, domain_name, domain_image_name):
    user_id = int(user_id)

    for entry in domains_db:
        if entry["user_id"] == user_id:
            entry["domains"].append({"domain_id": next_domain_id(), "domain_name":domain_name, "image_url": domain_image_name,"sources":[]})
            return get_domains(user_id)
    return get_domains(user_id)

def remove_domain(user_id, domain_id):
    user_id = int(user_id)
    domain_id = int(domain_id)

    for entry in domains_db:
        if entry["user_id"] == user_id:
            for domain in list(entry["domains"]):
                if int(domain["domain_id"]) == domain_id:
                    print("managed to get there")
                    entry["domains"].remove(domain)
                    return get_domains(user_id)
    return get_domains(user_id)

def get_domains(user_id):
    user_id = int(user_id)
    
    for entry in domains_db:
        if entry["user_id"] == user_id:
            return entry
    return {}

def add_source(user_id, domain_id, source_name, source_image_name):
    user_id = int(user_id)
    domain_id = int(domain_id)
    
    for entry in domains_db:
        if int(entry["user_id"]) == user_id:
            for domain in list(entry["domains"]):
                if int(domain["domain_id"]) == domain_id:
                    domain["sources"].append({"source_id":next_source_id(), "source_name":source_name, "source_image_name":source_image_name})
                    return get_domains(user_id)
    return get_domains(user_id)

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