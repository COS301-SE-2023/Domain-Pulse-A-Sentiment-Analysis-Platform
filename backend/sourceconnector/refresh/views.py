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
        source_type = str(raw_data["source"])
        params = dict(raw_data["params"])

        if source_type.lower() == "youtube":
            return youtube_connector.handle_request(params)
        elif source_type.lower() == "googlereviews":
            return google_reviews_connector.handle_request(params)
        elif source_type.lower() == "tripadvisor":
            return tripadvisor_connector.handle_request(params)
        else:
            return JsonResponse(
                {"status": "FAILURE", "details": "Invalid source type provided"}
            )

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})
