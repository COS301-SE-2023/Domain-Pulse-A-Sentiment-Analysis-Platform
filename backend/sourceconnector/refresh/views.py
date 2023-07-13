from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from utils import mock_data

# Create your views here.


def refresh_instagram_source(request: HttpRequest, source_id):
    source_id = str(source_id)

    retData = []

    if source_id == "2":
        retData = mock_data.MOCK_DATA["2"]
    elif source_id == "3":
        retData = mock_data.MOCK_DATA["3"]

    return JsonResponse({"new_data": retData})


def refresh_google_reviews_source(request: HttpRequest, source_id):
    source_id = str(source_id)

    retData = []

    if source_id == "0":
        retData = mock_data.MOCK_DATA["0"]
    elif source_id == "1":
        retData = mock_data.MOCK_DATA["1"]
    elif source_id == "4":
        retData = mock_data.MOCK_DATA["4"]

    return JsonResponse({"new_data": retData})
