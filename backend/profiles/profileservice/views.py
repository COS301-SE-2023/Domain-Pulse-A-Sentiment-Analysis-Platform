from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from utils import profilescrud

# Create your views here.
@csrf_exempt
def create_user(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.create_user(raw_data["username"],raw_data["email"],raw_data["password"]))
    return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def login_user(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.login_user(request,raw_data["username"],raw_data["password"]))
    return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def change_password(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.change_password(request,raw_data["id"], raw_data["oldpassword"],raw_data["newpassword"]))
    return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def logout_user(request: HttpRequest):
    raw_data=json.loads(request.body)
    return JsonResponse(profilescrud.logout_user(request))

# def create_profile(request, user_id, profileIcon, mode):
#     return JsonResponse(profilescrud.create_profile(raw_data["user_id"],raw_data["profileIcon"] , raw_data["mode"]))

@csrf_exempt
def delete_user(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.delete_user(request,raw_data["username"],raw_data["password"]))
    return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def swap_mode(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.swap_mode(request,raw_data["id"]))
    return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def edit_profile_picture(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.edit_profile_picture(request,raw_data["id"], raw_data["pictureURL"]))
    return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def edit_profile_mode(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.edit_profile_mode(request,raw_data["id"], raw_data["mode"]))
    return JsonResponse({"status": "FAILURE"})    

@csrf_exempt
def get_profile(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.get_profile(request,raw_data["id"]))
    return JsonResponse({"status": "FAILURE"})   

@csrf_exempt
def add_domain_to_profile(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.add_domain_to_profile(request, raw_data["id"], raw_data["domain_id"]))
    return JsonResponse({"status": "FAILURE"})   

@csrf_exempt
def remove_domain_from_profile(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.remove_domain_from_profile(request,raw_data["id"], raw_data["domain_id"]))
    return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def get_domains_for_user(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.get_domains_for_user(request,raw_data["id"]))
    return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def get_user_by_id(request:HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(profilescrud.get_user_by_id(raw_data["id"]))
    return JsonResponse({"status": "FAILURE"})

@csrf_exempt
def check_logged_in(request:HttpRequest):
    if request.method == "POST":
        return JsonResponse(profilescrud.check_logged_in(request))
    return JsonResponse({"status": "FAILURE"})