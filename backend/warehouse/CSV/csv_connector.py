import requests
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv
import csv
from django.http import JsonResponse, HttpRequest, HttpResponse


def handle_request(params):
    file = params["file"]
    decoded_file = file.read().decode("utf-8")
    reviews = []
    csv_reader = csv.DictReader(decoded_file)

    current_time = datetime.now()
    formatted_current_time = current_time.strptime("%Y-%m-%dT%H:%M:%SZ")

    for row in csv_reader:
        datetime_object = datetime.strptime(row["time"], "%Y-%m-%dT%H:%M:%SZ")
        last_updated_timestamp = datetime_object.timestamp()
        reviews.append(
            {"text": row["reviews"], "timestamp": int(last_updated_timestamp)}
        )

    return JsonResponse(
        {
            "status": "SUCCESS",
            "newdata": reviews,
            "latest_retrieval": formatted_current_time,
        }
    )
