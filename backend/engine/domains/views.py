from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

def add_domain(request, user_id, domain_name):
    return JsonResponse({"worked":"yes"})

def remove_domain(request, user_id, domain_id):
    return JsonResponse({"worked":"yes"})

def add_source(request, user_id, domain_id, source_name):
    return JsonResponse({"worked":"yes"})

def remove_source(request, user_id, domain_id, source_id):
    return JsonResponse({"worked":"yes"})

def get_domains(request, user_id):
    return JsonResponse({"worked":"yes"})