from django.shortcuts import render
from django.http import JsonResponse, HttpRequest

# Create your views here.


def say_hello(request):
    return JsonResponse({"message": "hello there!"})


def get_dashboard_data_source(request: HttpRequest):
    # 1. Query the sentiment records database for all data from a provided source
    # 2. Determine the meta-data
    # 3. Send that data to the aggregator (engine) to get cumulative metrics
    # 4. Return data from the response from 3, as well as meta-data and an other status codes, etc
    return JsonResponse({"message": "hello there!"})


def get_dashboard_data_domain(request: HttpRequest):
    # 1. Query the sentiment records database for all data from a provided domain
    # 2. Determine the meta-data
    # 3. Send that data to the aggregator (engine) to get cumulative metrics
    # 4. Return data from the response from 3, as well as meta-data and an other status codes, etc
    return JsonResponse({"message": "hello there!"})


def refresh_source(request: HttpRequest):
    # 1. Given the appropriate source, invoke the SourceConnector to get new data (ie: past the most recent timestamp)
    # 2. Send the new data from 1 to the analyser (engine)
    # 3. Store the data with its computed metrics in the database
    # 4. (Frontend concern) - call the get_data_dashboard_source/domain endpoint to refresh the frontend dashboard
    return JsonResponse({"message": "hello there!"})
