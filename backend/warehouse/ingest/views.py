from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from datamanager import sentiment_record_model
import json
import requests
from authchecker import auth_checks
import os
import bleach
from datetime import datetime


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
        review_text = bleach.clean(original_review_text)
        source_id_raw = request.POST.get("source_id")
        timestamp = datetime.now().timestamp()

        # ----------- Verifying source is valid ------------
        DOMAINS_ENDPOINT = f"http://localhost:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/domains/verify_live_source"
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

        ANALYSER_ENDPOINT = (
            f"http://localhost:{str(os.getenv('DJANGO_ENGINE_PORT'))}/analyser/compute/"
        )
        request_to_engine_body = {"data": review_text}
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
