import requests
from datetime import datetime
import calendar
import os
from pathlib import Path
from dotenv import load_dotenv
from django.http import JsonResponse, HttpRequest, HttpResponse

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR.parent / ".env"
load_dotenv(ENV_FILE)
TRIPADVISOR_API_KEY = os.getenv("TRIPADVISOR_API_KEY")

ENDPOINT = "https://api.app.outscraper.com/tripadvisor/reviews"
REVIEWS_LIMIT = 5  # number of reviews to return (please keep this to a small number, around 1-10 ideally)

HEADERS = {"X-API-KEY": TRIPADVISOR_API_KEY}


def month_name_to_number(month_name: str):
    month_name = month_name.lower().capitalize()
    month_number = list(calendar.month_abbr).index(month_name[:3])
    return int(month_number)


def get_timestamp_from_date(date_str: str):
    first, second = date_str.split(" ")

    if first.isnumeric():
        return datetime(
            datetime.now().year, month_name_to_number(second), int(first), 0, 0, 0
        ).timestamp()
    else:
        return datetime(
            int(second), month_name_to_number(first), 1, 0, 0, 0
        ).timestamp()


def get_tripadvisor_reviews(url, last_refresh_timestamp):
    response = requests.get(
        url=ENDPOINT
        + "?"
        + "query="
        + url
        + "&limit="
        + str(REVIEWS_LIMIT)
        + "&async="
        + "false",
        headers=HEADERS,
    )

    review_data = response.json()["data"][0]

    latest_retrieval = last_refresh_timestamp
    ret_data = []

    for review in review_data:
        review_text = review["description"]
        review_timestamp = int(get_timestamp_from_date(review["reviewed"]))

        if review_timestamp <= last_refresh_timestamp:
            continue

        if review_timestamp > latest_retrieval:
            latest_retrieval = review_timestamp

        item = {"text": review_text, "timestamp": review_timestamp}

        ret_data.append(item)

    return ret_data, latest_retrieval


def handle_request(params):
    tripadvisor_url = params["tripadvisor_url"]
    last_refresh_timestamp = float(params["last_refresh_timestamp"])

    reviews, latest_retrieval = get_tripadvisor_reviews(
        tripadvisor_url, last_refresh_timestamp
    )

    return JsonResponse(
        {"status": "SUCCESS", "newdata": reviews, "latest_retrieval": latest_retrieval}
    )
