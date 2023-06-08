from django.shortcuts import render
from django.http import JsonResponse
from utils import profilescrud

# Create your views here.

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