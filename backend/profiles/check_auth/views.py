from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse, HttpRequest
from utils import profilescrud
from rest_framework_simplejwt.authentication import JWTAuthentication


# Create your views here.
@csrf_exempt
def check_source_ids(request):
    if request.method == "POST":
        flag,token=extract_token(request)
        user=get_user_from_token(token)
        if user == None:
            return JsonResponse({"status": "FAILURE", "details" :"Could not verify the user's identtfy"})

        userID =user.id
        

        sources=(profilescrud.get_sources_for_user_internal(userID))["source_ids"]
        print(sources)
        
        raw_data = json.loads(request.body)
        source_ids = list(raw_data["source_ids"])
        print(source_ids)
        for i in source_ids:
            if i not in sources:
                return JsonResponse({"status":"FAILURE", "details":"Non Matching Source IDs"})
        return JsonResponse({"status":"SUCCESS", "details":"Valid access"})
    return JsonResponse({"status": "FAILURE", "details":"Invalid request to Profiles service"})


@csrf_exempt
def check_domain_ids(request):
    if request.method == "POST":
        flag,token=extract_token(request)

        user=get_user_from_token(token)
        if user == None:
            return JsonResponse({"status": "FAILURE", "details" :"Could not verify the user's identtfy"})

        userID =user.id

        domains=(profilescrud.get_domains_for_user_internal(userID))["domainIDs"]
        
        raw_data = json.loads(request.body)
        domain_ids = list(raw_data["domain_ids"])
        for i in domain_ids:
            if i not in domains:
                return JsonResponse({"status":"FAILURE", "details":"Non Matching Domain IDs"})
        return JsonResponse({"status":"SUCCESS", "details":"Valid access"})
    return JsonResponse({"status": "FAILURE", "details":"Invalid request to Profiles service"})


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