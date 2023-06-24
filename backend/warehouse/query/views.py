from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from datamanager import sentiment_record_model
import json
import requests

# Create your views here.


@csrf_exempt
def get_dashboard_data_source(request: HttpRequest):
    # 1. Query the sentiment records database for all data from a provided source
    # 2. Determine the meta-data
    # 3. Send that data to the aggregator (engine) to get cumulative metrics
    # 4. Return data from the response from 3, as well as meta-data and an other status codes, etc

    # raw_data = json.loads(request.body)
    #     new_records = raw_data["data"]
    #     scores = []
    #     for item in new_records:
    #         scores.append(processing.analyse_content(item))

    if request.method == "POST":
        raw_data = json.loads(request.body)
        source_id_raw = raw_data["source_id"]

        individual_records = sentiment_record_model.get_records_by_source_id(
            int(source_id_raw)
        )

        for record in individual_records:
            record["_id"] = ""

        request_to_engine_body = {"metrics": individual_records}

        url = "http://localhost:8001/aggregator/aggregate/"
        response_from_aggregator = requests.post(
            url, data=json.dumps(request_to_engine_body)
        )

        if response_from_aggregator.status_code == 200:
            response = {}
            response["status"] = "SUCCESS"

            agg_response_body = response_from_aggregator.json()

            response["aggregated_metrics"] = agg_response_body["overall"]
            response["individual_metrics"] = agg_response_body["individual_data"]

            return JsonResponse(response)
        else:
            return JsonResponse({"status": "FAILURE"})

    return JsonResponse({"status": "FAILURE"})


@csrf_exempt
def get_dashboard_data_domain(request: HttpRequest):
    # 1. Query the sentiment records database for all data from a provided domain
    # 2. Determine the meta-data
    # 3. Send that data to the aggregator (engine) to get cumulative metrics
    # 4. Return data from the response from 3, as well as meta-data and an other status codes, etc
    if request.method == "POST":
        return JsonResponse({"message": "hello there!"})
    return JsonResponse({"status": "FAILURE"})


@csrf_exempt
def refresh_source(request: HttpRequest):
    # 1. Given the appropriate source, invoke the SourceConnector to get new data (ie: past the most recent timestamp)
    # 2. Send the new data from 1 to the analyser (engine)
    # 3. Store the data with its computed metrics in the database
    # 4. (Frontend concern) - call the get_data_dashboard_source/domain endpoint to refresh the frontend dashboard
    if request.method == "POST":
        return JsonResponse({"message": "hello there!"})
    return JsonResponse({"status": "FAILURE"})
