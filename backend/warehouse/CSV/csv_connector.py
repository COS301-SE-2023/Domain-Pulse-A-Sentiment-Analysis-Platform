import requests
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv
import csv
from django.http import JsonResponse, HttpRequest, HttpResponse
import bleach
from unidecode import unidecode


def handle_request(file):
    decoded_file = file.read().decode("utf-8")
    reviews = []
    csv_reader = csv.DictReader(decoded_file.splitlines())
    current_time = datetime.now()
    # formatted_current_time = datetime.strftime(current_time, "%Y-%m-%dT%H:%M:%SZ")
    formatted_current_time = current_time.timestamp()
    headers = csv_reader.fieldnames
    if headers is None:
        return {"status": "FAILURE", "details": "Invalid CSV file provided"}
    if "reviews" not in headers or "time" not in headers:
        return {"status": "FAILURE", "details": "Invalid CSV file provided"}

    for row in csv_reader:
        datetime_object = datetime.strptime(row["time"], "%Y-%m-%dT%H:%M:%SZ")
        last_updated_timestamp = datetime_object.timestamp()
        # Preprocessing here
        row["reviews"] = unidecode(row["reviews"])
        review_text = bleach.clean(row["reviews"])

        reviews.append({"text": review_text, "timestamp": int(last_updated_timestamp)})

    return {
        "status": "SUCCESS",
        "newdata": reviews,
        "latest_retrieval": formatted_current_time,
    }
