import requests
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv
from django.http import JsonResponse, HttpRequest, HttpResponse
from unidecode import unidecode

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR.parent / ".env"
load_dotenv(ENV_FILE)
TRUSTPILOT_API_KEY = os.getenv("TRUSTPILOT_API_KEY")

ENDPOINT = "https://api.app.outscraper.com/trustpilot/reviews"
# url of the place that is reviewed - not the url of the TrustPilot page (performance). This url can be found as the last part of the TrustPilot URL
# number of reviews to return (please keep this to a small number, around 1-10 ideally)
REVIEWS_LIMIT = 15

HEADERS = {"X-API-KEY": TRUSTPILOT_API_KEY}


def call_outscraper(query_url: str, last_refreshed_timestamp):
    response = requests.get(
        url=ENDPOINT
        + "?"
        + "query="
        + query_url
        + "&limit="
        + str(REVIEWS_LIMIT)
        + "&cutoff="
        + str(last_refreshed_timestamp)
        + "&async="
        + "false",
        headers=HEADERS,
    )

    return response.json()


def get_trustpilot_reviews(query_url: str, last_refreshed_timestamp):
    results = call_outscraper(query_url, last_refreshed_timestamp)

    latest_retrieval = -1

    ret_data = []
    if results["status"] == "Success":
        reviews = results["data"][0]
        review_item = {}
        for r in reviews:
            review_item = {
                "text": unidecode(r["review_text"]),  # Decoding unsupported characters
                "timestamp": r["review_date"],
            }

            if r["review_date"] > latest_retrieval:
                latest_retrieval = r["review_date"]

            ret_data.append(review_item)
    return ret_data, latest_retrieval


def handle_request(params):
    query_url = params["query_url"]
    last_refresh_timestamp = int(params["last_refresh_timestamp"])

    reviews, latest_retrieval = get_trustpilot_reviews(
        query_url, last_refresh_timestamp
    )

    return JsonResponse(
        {"status": "SUCCESS", "newdata": reviews, "latest_retrieval": latest_retrieval}
    )
