from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
import json
from youtube import youtube_connector
from googlereviews import google_reviews_connector
from tripadvisor import tripadvisor_connector


# Create your views here.


def refresh_source(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})
