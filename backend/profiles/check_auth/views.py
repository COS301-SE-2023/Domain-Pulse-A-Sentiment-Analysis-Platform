import os
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse, HttpRequest
from utils import profilescrud
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
import socket


# Create your views here.
@csrf_exempt
def check_source_ids(request):
    if request.method == "POST":
        flag, token = extract_token(request)
        user = get_user_from_token(token)
        if user == None:
            return JsonResponse(
                {"status": "FAILURE", "details": "Could not verify the user's identity"}
            )

        userID = user.id

        sources = (profilescrud.get_sources_for_user_internal(userID))["source_ids"]

        raw_data = json.loads(request.body)
        source_ids = list(raw_data["source_ids"])
        for i in source_ids:
            if i not in sources:
                return JsonResponse(
                    {"status": "FAILURE", "details": "Non Matching Source IDs"}
                )
        return JsonResponse({"status": "SUCCESS", "details": "Valid access"})
    return JsonResponse(
        {"status": "FAILURE", "details": "Invalid request to Profiles service"}
    )


@csrf_exempt
def check_domain_ids(request):
    if request.method == "POST":
        flag, token = extract_token(request)

        user = get_user_from_token(token)
        if user == None:
            return JsonResponse(
                {"status": "FAILURE", "details": "Could not verify the user's identity"}
            )

        userID = user.id

        domains = (profilescrud.get_domains_for_user_internal(userID))["domainIDs"]

        raw_data = json.loads(request.body)
        domain_ids = list(raw_data["domain_ids"])
        for i in domain_ids:
            if i not in domains:
                return JsonResponse(
                    {"status": "FAILURE", "details": "Non Matching Domain IDs"}
                )
        return JsonResponse({"status": "SUCCESS", "details": "Valid access"})
    return JsonResponse(
        {"status": "FAILURE", "details": "Invalid request to Profiles service"}
    )


def get_user_from_token(jwt_token):
    authentication = JWTAuthentication()
    try:
        validated_token = authentication.get_validated_token(jwt_token)
        user = authentication.get_user(validated_token)
        return user
    except Exception as e:
        # Handle invalid token or other exceptions
        return None


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


def validate_token(request):
    try:
        flag, token = extract_token(request)
        if not flag:
            return {"status": "FAILURE", "details": token}
        else:
            AccessToken(token)
            return {"status": "SUCCESS"}
    except TokenError as e:
        return {"status": "FAILURE", "details": "Token is invalid (Expired or Invalid)"}


@csrf_exempt
def check_source_ids_and_remove_source(request):
    raw_data = json.loads(request.body)

    if raw_data["local_key"] == os.getenv("LOCAL_KEY"):
        if request.method == "POST":
            flag, token = extract_token(request)
            user = get_user_from_token(token)
            if user == None:
                return JsonResponse(
                    {
                        "status": "FAILURE",
                        "details": "Could not verify the user's identity",
                    }
                )

            userID = user.id

            sources = (profilescrud.get_sources_for_user_internal(userID))["source_ids"]

            source_ids = list(raw_data["source_ids"])
            for i in source_ids:
                if i not in sources:
                    return JsonResponse(
                        {"status": "FAILURE", "details": "Non Matching Source IDs"}
                    )
            new_data = raw_data["item"]
            response = profilescrud.remove_source_from_domain(
                userID, new_data["id"], new_data["source_id"]
            )
            if response["status"] == "SUCCESS":
                return JsonResponse({"status": "SUCCESS", "details": "Valid access"})
            else:
                return JsonResponse(
                    {
                        "status": "FAILURE",
                        "details": "Failed to delete source from profile",
                    }
                )
        return JsonResponse(
            {"status": "FAILURE", "details": "Invalid request to Profiles service"}
        )
    else:
        return JsonResponse({"status": "FAILURE", "details": "Foreign Request"})


@csrf_exempt
def add_domain(request):
    raw_data = json.loads(request.body)

    if raw_data["local_key"] == os.getenv("LOCAL_KEY"):
        if request.method == "POST":
            flag, token = extract_token(request)

            user = get_user_from_token(token)
            if user == None:
                return JsonResponse(
                    {
                        "status": "FAILURE",
                        "details": "Could not verify the user's identity",
                    }
                )

            userID = user.id

            response = profilescrud.add_domain_to_profile(userID, raw_data["id"])
            if response["status"] == "SUCCESS":
                return JsonResponse({"status": "SUCCESS", "details": "Valid access"})
            else:
                return JsonResponse(
                    {"status": "FAILURE", "details": "Failed to add domain to profile"}
                )
        return JsonResponse(
            {"status": "FAILURE", "details": "Invalid request to Profiles service"}
        )
    else:
        return JsonResponse({"status": "FAILURE", "details": "Foreign Request"})


@csrf_exempt
def add_source(request):
    raw_data = json.loads(request.body)

    if raw_data["local_key"] == os.getenv("LOCAL_KEY"):
        if request.method == "POST":
            flag, token = extract_token(request)

            user = get_user_from_token(token)
            if user == None:
                return JsonResponse(
                    {
                        "status": "FAILURE",
                        "details": "Could not verify the user's identity",
                    }
                )

            userID = user.id

            response = profilescrud.add_source_to_domain(
                userID, raw_data["domain_id"], raw_data["source_id"]
            )
            if response["status"] == "SUCCESS":
                return JsonResponse({"status": "SUCCESS", "details": "Valid access"})
            else:
                return JsonResponse(
                    {"status": "FAILURE", "details": "Failed to add source to profile"}
                )
        return JsonResponse(
            {"status": "FAILURE", "details": "Invalid request to Profiles service"}
        )
    else:
        return JsonResponse({"status": "FAILURE", "details": "Foreign Request"})


@csrf_exempt
def check_domain_ids_and_remove_domain(request):
    raw_data = json.loads(request.body)

    if raw_data["local_key"] == os.getenv("LOCAL_KEY"):
        if request.method == "POST":
            flag, token = extract_token(request)
            user = get_user_from_token(token)
            if user == None:
                return JsonResponse(
                    {
                        "status": "FAILURE",
                        "details": "Could not verify the user's identity",
                    }
                )

            userID = user.id

            domains = (profilescrud.get_domains_for_user_internal(userID))["domainIDs"]

            domain_ids = list(raw_data["domain_ids"])
            for i in domain_ids:
                if i not in domains:
                    return JsonResponse(
                        {"status": "FAILURE", "details": "Non Matching Domain IDs"}
                    )
            new_data = raw_data["item"]
            response = profilescrud.remove_domain_from_profile(userID, new_data["id"])
            if response["status"] == "SUCCESS":
                return JsonResponse({"status": "SUCCESS", "details": "Valid access"})
            else:
                return JsonResponse(
                    {
                        "status": "FAILURE",
                        "details": "Failed to delete domain from profile",
                    }
                )
        return JsonResponse(
            {"status": "FAILURE", "details": "Invalid request to Profiles service"}
        )
    else:
        return JsonResponse({"status": "FAILURE", "details": "Foreign Request"})


@csrf_exempt
def check_logged_in(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            check = validate_token(request)
            if check["status"] == "SUCCESS":
                return JsonResponse({"status": "SUCCESS", "id": request.user.id})
            else:
                return JsonResponse(check)
        else:
            return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def try_guest_login(request):
    if request.method == "POST":
        guest_enabled = str(os.getenv("PREVIEW_ENABLED")) == "True"
        if not guest_enabled:
            return JsonResponse({"status": "FAILURE", "message": "Guest login is disabled"})
        else:
            return JsonResponse({"status": "SUCCESS", "guest_token": str(os.getenv("GUEST_PASS"))})

def get_address(request):
    return request.META.get("REMOTE_ADDR")
