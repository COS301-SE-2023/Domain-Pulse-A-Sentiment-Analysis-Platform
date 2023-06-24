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

# def create_profile(request, user_id, profileIcon, mode):
#     return JsonResponse(profilescrud.create_profile(request.POST["user_id"],request.POST["profileIcon"] , request.POST["mode"]))

def delete_user(request):
    if request.method == "POST":
        return JsonResponse(profilescrud.delete_user(request,request.POST["username"],request.POST["password"]))
    return JsonResponse({"status": "FAILURE"})

def swap_mode(request, id):
    if request.method == "POST":
        return JsonResponse(profilescrud.swap_mode(request,request.POST["id"]))
    return JsonResponse({"status": "FAILURE"})

def edit_profile_picture(request, id, pictureURL):
    if request.method == "POST":
        return JsonResponse(profilescrud.edit_profile_picture(request,request.POST["id"], request.POST["pictureURL"]))
    return JsonResponse({"status": "FAILURE"})

def edit_profile_mode(request, id, mode):
    if request.method == "POST":
        return JsonResponse(profilescrud.edit_profile_mode(request,request.POST["id"], request.POST["mode"]))
    return JsonResponse({"status": "FAILURE"})    

def get_profile(request, id):
    if request.method == "POST":
        return JsonResponse(profilescrud.get_profile(request,request.POST["id"]))
    return JsonResponse({"status": "FAILURE"})   

def add_domain_to_profile(request,id, domain_id):
    if request.method == "POST":
        return JsonResponse(profilescrud.add_domain_to_profile(request, request.POST["id"], request.POST["domain_id"]))
    return JsonResponse({"status": "FAILURE"})   

def remove_domain_from_profile(request,id, domain_id):
    if request.method == "POST":
        return JsonResponse(profilescrud.remove_domain_from_profile(request,request.POST["id"], request.POST["domain_id"]))
    return JsonResponse({"status": "FAILURE"})

def get_domains_for_user(request, id):
    if request.method == "POST":
        return JsonResponse(profilescrud.get_domains_for_user(request,request.POST["id"]))
    return JsonResponse({"status": "FAILURE"})