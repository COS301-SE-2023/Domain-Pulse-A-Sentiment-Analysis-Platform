import json
import requests
from django.http import HttpResponse, HttpRequest, JsonResponse

PROFILES_SERVICE_ADDRESS = "http://localhost:8002"
VERIFY_SOURCES_ENDPOINT = PROFILES_SERVICE_ADDRESS + "/check/source_ids/"
VERIFY_DOMAINS_ENDPOINT = PROFILES_SERVICE_ADDRESS + "/check/domain_ids/"
ADD_DOMAIN_ENDPOINT= PROFILES_SERVICE_ADDRESS+"/check/add_domain/"
VERIFY_DOMAINS_AND_REMOVE_DOMAIN_ENDPOINT= PROFILES_SERVICE_ADDRESS+"/check/domain_ids_and_remove_domain/"
ADD_SOURCE_ENDPOINT= PROFILES_SERVICE_ADDRESS+"/check/add_source/"
VERIFY_SOURCES_AND_REMOVE_SOURCE_ENDPOINT= PROFILES_SERVICE_ADDRESS+"/check/source_ids_and_remove_source/"



def extract_token(original_request: HttpRequest):
    auth_header = original_request.headers.get("Authorization")
    if not auth_header:
        return (False, "Authorization header missing")

    try:
        prefix, token = auth_header.split(" ")
        if prefix != "Bearer":
            return (False, "Authorization header - Missing Bearer")
    except ValueError:
        return (False, "Invalid token format")

    return (True, token)


def verify_user_owns_source_ids(original_request: HttpRequest, source_id_list: list, action=None):
    status, details = extract_token(original_request)

    if not status:
        return {"status": "FAILURE", "details": details}

    jwt = details
    source_ids = list(source_id_list)

    headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
    item = dict(json.loads(original_request.body))
    data = {"source_ids": source_ids, "item": item}
    if action==None:
        response = requests.post(VERIFY_SOURCES_ENDPOINT, json=data, headers=headers)
    elif action=="remove_source":
        response = requests.post(VERIFY_SOURCES_AND_REMOVE_SOURCE_ENDPOINT, json=data, headers=headers)

    if response.status_code == 200:
        response_data = response.json()
        status = response_data.get("status")
        details = response_data.get("details")

        if str(status) == "SUCCESS":
            return True, "User is authorized"
        else:
            return False, details
    else:
        return False, "Failed to make the request to the auth service"


def verify_user_owns_domain_ids(original_request: HttpRequest, domain_id_list: list, action=None):
    status, details = extract_token(original_request)

    if not status:
        return {"status": "FAILURE", "details": details}

    jwt = details
    domain_ids = list(domain_id_list)

    headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
    item = dict(json.loads(original_request.body))
    data = {"domain_ids": domain_ids, "item":item}

    if action==None:
        response = requests.post(VERIFY_DOMAINS_ENDPOINT, json=data, headers=headers)
    elif action=="remove_domain":
        response = requests.post(VERIFY_DOMAINS_AND_REMOVE_DOMAIN_ENDPOINT, json=data, headers=headers)

    if response.status_code == 200:
        response_data = response.json()
        status = response_data.get("status")
        details = response_data.get("details")

        if str(status) == "SUCCESS":
            return True, "User is authorized"
        else:
            return False, details
    else:
        return False, "Failed to make the request to the auth service"

def create_domain_in_profile(original_request: HttpRequest,domain_id):
    status, details = extract_token(original_request)

    if not status:
        return {"status": "FAILURE", "details": details}

    jwt = details
    headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
    data = {"id":domain_id}
    response = requests.post(ADD_DOMAIN_ENDPOINT, json=data, headers=headers)
    return response

def add_source_in_profile(original_request: HttpRequest,domain_id,source_id):
    status, details = extract_token(original_request)

    if not status:
        return {"status": "FAILURE", "details": details}

    jwt = details
    headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
    data = {"domain_id":domain_id,"source_id":source_id}
    response = requests.post(ADD_SOURCE_ENDPOINT, json=data, headers=headers)
    return response