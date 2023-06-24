from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from utils import mock_data

# Create your views here.


def refresh_instagram_source(request: HttpRequest, source_id):
    return JsonResponse({"it": "worked!"})


def refresh_google_reviews_source(request: HttpRequest, source_id):
    return JsonResponse({"it": "worked!"})
