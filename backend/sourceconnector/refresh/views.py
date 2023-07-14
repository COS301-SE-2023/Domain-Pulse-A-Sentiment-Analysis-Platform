from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
import json

# Create your views here.


def refresh_youtube_video(request: HttpRequest, source_id):
    if request.method == "POST":
        raw_data = json.loads(request.body)

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


def refresh_google_reviews(request: HttpRequest, source_id):
    if request.method == "POST":
        raw_data = json.loads(request.body)

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


def refresh_tripadvisor(request: HttpRequest, source_id):
    if request.method == "POST":
        raw_data = json.loads(request.body)

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})
