from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from utils import mock_data

# Create your views here.


def refresh_youtube_video(request: HttpRequest, source_id):
    return JsonResponse({"new_data": "test"})


def refresh_google_reviews(request: HttpRequest, source_id):
    return JsonResponse({"new_data": "test"})


def refresh_tripadvisor(request: HttpRequest, source_id):
    return JsonResponse({"new_data": "test"})
