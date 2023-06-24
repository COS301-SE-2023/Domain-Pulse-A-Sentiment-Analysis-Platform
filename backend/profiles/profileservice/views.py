from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from utils import profilescrud

# Create your views here.
def create_user(request: HttpRequest):
    if request.method == "POST":
        return JsonResponse(profilescrud.create_user(request.POST["username"],request.POST["email"],request.POST["password"]))
    return JsonResponse({"status": "FAILURE"})

def login_user(request: HttpRequest):
    if request.method == "POST":
        return JsonResponse(profilescrud.login_user(request,request.POST["username"],request.POST["password"]))
    return JsonResponse({"status": "FAILURE"})

def change_password(request: HttpRequest):
    if request.method == "POST":
        return JsonResponse(profilescrud.change_password(request,request.POST["id"], request.POST["oldpassword"],request.POST["newpassword"]))
    return JsonResponse({"status": "FAILURE"})

def logout_user(request: HttpRequest):
    return JsonResponse(profilescrud.logout_user(request))

def create_profile(request, user_id, profileIcon, mode):
    return JsonResponse(profilescrud.create_profile(user_id, profileIcon, mode))

def swap_mode(request, id):
    return JsonResponse(profilescrud.swap_mode(id))

def edit_profile_picture(request, id, pictureURL):
    return JsonResponse(profilescrud.edit_profile_picture(id, pictureURL))

def edit_profile_mode(request, id, mode):
    return JsonResponse(profilescrud.edit_profile_mode(id, mode))

def get_profile(request, id):
    return JsonResponse(profilescrud.get_profile(id))

def add_domain_to_profile(request,id, domain_id):
    return JsonResponse(profilescrud.add_domain_to_profile(id, domain_id))

def remove_domain_from_profile(request,id, domain_id):
    return JsonResponse(profilescrud.remove_domain_from_profile(id, domain_id))

def get_domains_for_user(request, id):
    return JsonResponse(profilescrud.get_domains_for_user(id))