import requests
from django.http import HttpResponse, HttpRequest, JsonResponse
import os

PROFILES_SERVICE_ADDRESS = "http://localhost:" + str(os.getenv("DJANGO_PROFILES_PORT"))
VERIFY_SOURCES_ENDPOINT = PROFILES_SERVICE_ADDRESS + "/check/source_ids/"
VERIFY_DOMAINS_ENDPOINT = PROFILES_SERVICE_ADDRESS + "/check/domain_ids/"


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


def verify_user_owns_source_ids(original_request: HttpRequest, source_id_list: list):
    status, details = extract_token(original_request)

    if not status:
        return {"status": "FAILURE", "details": details}

    jwt = details
    source_ids = list(source_id_list)

    headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}

    data = {"source_ids": source_ids}

    response = requests.post(VERIFY_SOURCES_ENDPOINT, json=data, headers=headers)

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


def verify_user_owns_domain_ids(original_request: HttpRequest, domain_id_list: list):
    status, details = extract_token(original_request)

    if not status:
        return {"status": "FAILURE", "details": details}

    jwt = details
    domain_ids = list(domain_id_list)

    headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}

    data = {"domain_ids": domain_ids}

    response = requests.post(VERIFY_DOMAINS_ENDPOINT, json=data, headers=headers)

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
