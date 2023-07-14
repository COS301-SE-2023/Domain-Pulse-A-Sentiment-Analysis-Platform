from outscraper import ApiClient
import requests
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv
from django.http import JsonResponse, HttpRequest, HttpResponse

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR.parent / ".env"
load_dotenv(ENV_FILE)
GOOGLE_REVIEWS_API_KEY = os.getenv("GOOGLE_REVIEWS_API_KEY")

client = ApiClient(api_key=GOOGLE_REVIEWS_API_KEY)

REVIEWS_LIMIT = 10  # number of reviews to return (please keep this to a small number, around 1-10 ideally)
LIMIT = 1  # pls DO NOT change this
SORT = "newest"  # options: "most_relevant", "newest" "highest_rating" "lowest_rating"
IGNORE_EMPTY = True  # ignores reviews with no text (please don't change this)
LANG = "en"  # language (models are trained in English so pls don't change)
COUNTRY = "ZA"  # South African Google


def get_google_reviews(maps_url, last_refreshed_timestamp):
    results = client.google_maps_reviews(
        query=[str(maps_url)],
        reviews_limit=REVIEWS_LIMIT,
        limit=LIMIT,
        sort=SORT,
        cutoff=int(last_refreshed_timestamp),
        ignore_empty=IGNORE_EMPTY,
        language=LANG,
        region=COUNTRY,
    )

    latest_retrieval = 0

    reviews = results[0]["reviews_data"]

    ret_data = []
    for review in reviews:
        review_text = review["review_text"]
        review_timestamp = int(review["review_timestamp"])

        if review_timestamp > latest_retrieval:
            latest_retrieval = review_timestamp

        item = {"text": review_text, "timestamp": review_timestamp}

        ret_data.append(item)

    return ret_data, latest_retrieval


def handle_request(params):
    pass
