import csv
import os

DOMAIN_ID_COUNTER = 10
USER_ID_COUNTER = 10
SOURCE_ID_COUNTER = 10

domains_db = [
    {
        "user_id" : 1,
        "domains" : [
            {
                "domain_id":1,
                "domain_name":"Starbucks",
                "sources" : [
                    {
                        "source_id":1,
                        "source_name":"Facebook"
                    }
                ]
            }
        ]
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

def add_domain(user_id, domain_name):
    user_id = int(user_id)

    for entry in domains_db:
        if entry["user_id"] == user_id:
            entry["domains"].append({"domain_id": next_domain_id(), "domain_name":domain_name,"sources":[]})
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


def get_domains(user_id):
    user_id = int(user_id)
    
    for entry in domains_db:
        if entry["user_id"] == user_id:
            return entry


def add_source(user_id, domain_id, source_name):
    user_id = int(user_id)
    domain_id = int(domain_id)
    
    for entry in domains_db:
        if int(entry["user_id"]) == user_id:
            for domain in list(entry["domains"]):
                if int(domain["domain_id"]) == domain_id:
                    domain["sources"].append({"source_id":next_source_id(), "source_name":source_name})
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
    