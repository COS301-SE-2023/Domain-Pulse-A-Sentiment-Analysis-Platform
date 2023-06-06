from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from utils import domainscrud
from django.views.decorators.csrf import (
    csrf_exempt,
    ensure_csrf_cookie,
    csrf_protect,
)
from django.middleware.csrf import get_token

# Create your views here.


def add_domain(request, user_id, domain_name, domain_image_name):
    return JsonResponse(domainscrud.add_domain(user_id, domain_name, domain_image_name))


def remove_domain(request, user_id, domain_id):
    return JsonResponse(domainscrud.remove_domain(user_id, domain_id))


def add_source(request, user_id, domain_id, source_name, source_image_name):
    return JsonResponse(
        domainscrud.add_source(user_id, domain_id, source_name, source_image_name)
    )


def remove_source(request, user_id, domain_id, source_id):
    return JsonResponse(domainscrud.remove_source(user_id, domain_id, source_id))


def get_domains(request, user_id):
    return JsonResponse(domainscrud.get_domains(user_id))


@csrf_protect
def post_function(request: HttpRequest):
    print(request.method)
    response = JsonResponse({"it": "worked!"})
    return response


@ensure_csrf_cookie
def receive_token(request: HttpRequest):
    return JsonResponse({"hi": "there"})
