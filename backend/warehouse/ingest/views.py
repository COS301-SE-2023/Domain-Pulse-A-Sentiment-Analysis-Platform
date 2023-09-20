from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from datamanager import sentiment_record_model
import json
import requests
from authchecker import auth_checks
import os
import bleach
from CSV import csv_connector
from datetime import datetime
from unidecode import unidecode


# Create your views here.


# @csrf_exempt
# def test_endpoint(request: HttpRequest):
#     if request.method == "POST":
#         review_text = bleach.clean(request.POST.get("review_text"))
#         source_id_raw = request.POST.get("source_id")
#         timestamp = int(datetime.now().timestamp())
#         return JsonResponse(
#             {
#                 "review_text": review_text,
#                 "source_id": source_id_raw,
#                 "timestamp": timestamp,
#             }
#         )


@csrf_exempt
def ingest_live_review(request: HttpRequest):
    if request.method == "POST":
        original_review_text = request.POST.get("review_text")
        # Preprocessing here
        original_review_text = unidecode(original_review_text)
        review_text = bleach.clean(original_review_text)
        source_id_raw = request.POST.get("source_id")
        timestamp = datetime.now().timestamp()

        # ----------- Verifying source is valid ------------
        DOMAINS_ENDPOINT = f"http://{os.getenv('DOMAINS_HOST')}:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/domains/verify_live_source"
        request_to_domains_body = {"source_id": source_id_raw}
        response_from_domains = requests.post(
            DOMAINS_ENDPOINT, data=json.dumps(request_to_domains_body)
        )

        if response_from_domains.status_code == 200:
            if response_from_domains.json()["status"] != "SUCCESS":
                return render(
                    request,
                    "error.html",
                    {"details": response_from_domains.json()["details"]},
                )
        else:
            return render(
                request,
                "error.html",
                {"details": "Could not verify the source ID"},
            )
        # --------------------------------------------------

        ANALYSER_ENDPOINT = f"http://{os.getenv('ENGINE_HOST')}:{str(os.getenv('DJANGO_ENGINE_PORT'))}/analyser/compute/"
        request_to_engine_body = {"data": [review_text]}
        response_from_analyser = requests.post(
            ANALYSER_ENDPOINT, data=json.dumps(request_to_engine_body)
        )

        if response_from_analyser.status_code == 200:
            new_record = response_from_analyser.json()["metrics"][0]
            new_record["timestamp"] = int(timestamp)
            new_record["source_id"] = source_id_raw

            sentiment_record_model.add_record(new_record)

            return render(
                request,
                "done.html",
                {"review_text": original_review_text},
            )
        else:
            return render(
                request,
                "error.html",
                {"details": "Error communicating with analyser"},
            )

    return render(
        request,
        "error.html",
        {"details": "Invalid request"},
    )


def make_live_review(request: HttpRequest, source_id, source_name):
    return render(
        request, "form.html", {"source_id": source_id, "source_name": source_name}
    )


@csrf_exempt
def ingest_CSV_file(request: HttpRequest):
    ANALYSER_ENDPOINT = f"http://{os.getenv('ENGINE_HOST')}:{str(os.getenv('DJANGO_ENGINE_PORT'))}/analyser/compute/"
    GET_SOURCE_ENDPOINT = f"http://{os.getenv('DOMAINS_HOST')}:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/domains/get_source"
    originalRequest = request
    if request.method == "POST":
        source_id_raw = request.POST.get("source_id")

        headers = {"Content-Type": "application/json"}

        # ------------------- VERIFYING ACCESS -----------------------
        checked, jwt = auth_checks.extract_token(originalRequest)
        if not checked:
            return JsonResponse(
                {"status": "FAILURE", "details": "JWT not found in header of request"}
            )
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        # ------------------------------------------------------------

        data = {"source_id": source_id_raw}
        response = requests.post(GET_SOURCE_ENDPOINT, json=data, headers=headers)

        if response.status_code != 200:
            return JsonResponse(
                {
                    "status": "FAILURE",
                    "details": "Could not connect to Domains Service",
                }
            )
        elif response.json()["status"] == "FAILURE":
            return JsonResponse(
                {"status": "FAILURE", "details": response.json()["details"]}
            )

        file = request.FILES["file"]
        if not file.name.endswith(".csv"):
            return JsonResponse({"status": "FAILURE", "details": "File must be a CSV"})
        response = csv_connector.handle_request(file)
        if response["status"] == "FAILURE":
            return JsonResponse({"status": "FAILURE", "details": response["details"]})
        new_data = response["newdata"]
        raw_new_data = []
        data_timestamps = []
        for x in new_data:
            raw_new_data.append(x["text"])
            data_timestamps.append(x["timestamp"])

        request_to_engine_body = {"data": raw_new_data}

        response_from_analyser = requests.post(
            ANALYSER_ENDPOINT, data=json.dumps(request_to_engine_body)
        )

        if response_from_analyser.status_code == 200:
            pass
        else:
            return JsonResponse(
                {
                    "status": "FAILURE",
                    "details": "Could not connect to Analyser",
                }
            )

        new_data_metrics = response_from_analyser.json()["metrics"]
        data_to_store = []
        for metrics, stamped in zip(new_data_metrics, new_data):
            metrics["timestamp"] = int(stamped["timestamp"])
            metrics["source_id"] = source_id_raw
            data_to_store.append(metrics)

        for x in data_to_store:
            sentiment_record_model.add_record(x)

        return JsonResponse(
            {"status": "SUCCESS", "details": "Data source refreshed successfully"}
        )
    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})
