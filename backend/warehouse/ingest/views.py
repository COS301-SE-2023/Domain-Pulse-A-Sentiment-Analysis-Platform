from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from datamanager import sentiment_record_model
import json
import requests
from authchecker import auth_checks
import os
import bleach

# Create your views here.


def ingest_live_review(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)
        source_id_raw = raw_data["source_id"]
        review_text = bleach.clean(raw_data["review_text"])
        timestamp = int(raw_data["timestamp"])

        # ----------- Verifying source is valid ------------
        DOMAINS_ENDPOINT = f"http://localhost:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/domains/verify_live_source"
        request_to_domains_body = {"source_id": source_id_raw}
        response_from_domains = requests.post(
            DOMAINS_ENDPOINT, data=json.dumps(request_to_domains_body)
        )
        if response_from_domains.status_code == 200:
            if response_from_domains.json()["status"] != "SUCCESS":
                return JsonResponse(
                    {
                        "status": "FAILURE",
                        "details": response_from_domains.json(["details"]),
                    }
                )
        else:
            return JsonResponse(
                {"status": "FAILURE", "details": "Could not verify the source ID"}
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
            new_record["timestamp"] = timestamp
            new_record["source_id"] = source_id_raw

            sentiment_record_model.add_record(new_record)

            return JsonResponse(
                {
                    "status": "SUCCESS",
                    "details": "Review ingested successfully!",
                    "confirmation": new_record,
                }
            )
        else:
            return JsonResponse(
                {"status": "FAILURE", "details": "Error communicating with analyser"}
            )

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})
