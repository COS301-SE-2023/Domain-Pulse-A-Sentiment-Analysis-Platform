import requests
from datetime import datetime
import pytz
import calendar
import os
from pathlib import Path
from dotenv import load_dotenv
from django.http import JsonResponse, HttpRequest, HttpResponse
import random
from unidecode import unidecode

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR.parent / ".env"
load_dotenv(ENV_FILE)
TRIPADVISOR_API_KEY = os.getenv("TRIPADVISOR_API_KEY")

ENDPOINT = "https://api.app.outscraper.com/tripadvisor/reviews"
REVIEWS_LIMIT = 15  # number of reviews to return (please keep this to a small number, around 1-10 ideally)

HEADERS = {"X-API-KEY": TRIPADVISOR_API_KEY}


def month_long_name_to_number(month_name):
    months = {
        "january": 1,
        "february": 2,
        "march": 3,
        "april": 4,
        "may": 5,
        "june": 6,
        "july": 7,
        "august": 8,
        "september": 9,
        "october": 10,
        "november": 11,
        "december": 12,
    }

    if month_name.lower() in months:
        return months[month_name.lower()]
    else:
        raise ValueError("Invalid month name encountered.")


def month_name_to_number(month_name: str):
    month_name = month_name.lower().capitalize()
    month_number = list(calendar.month_abbr).index(month_name[:3])
    return int(month_number)


def get_timestamp_from_date(date_str: str):
    num_spaces = date_str.count(" ")

    if num_spaces == 0:
        return int(datetime.now().timestamp()) - 86400

    if num_spaces > 1 and "," not in date_str:
        day, month_name, year = date_str.split(" ")
        day = int(day)
        month = month_long_name_to_number(month_name)
        year = int(year)

        return datetime(
            year,
            month,
            day,
            random.randint(0, 23),
            random.randint(0, 59),
            random.randint(0, 59),
        ).timestamp()

    if "," in date_str:
        month_name, day_with_comma, year = date_str.split(" ")
        day = day_with_comma[:-1]

        day = int(day)
        month = month_long_name_to_number(month_name)
        year = int(year)

        return datetime(
            year,
            month,
            day,
            random.randint(0, 23),
            random.randint(0, 59),
            random.randint(0, 59),
        ).timestamp()

    first, second = date_str.split(" ")

    if first.isnumeric():
        return datetime(
            datetime.now().year,
            month_name_to_number(second),
            int(first),
            random.randint(0, 23),
            random.randint(0, 59),
            random.randint(0, 59),
        ).timestamp()
    else:
        return datetime(
            int(second),
            month_name_to_number(first),
            1,
            random.randint(0, 23),
            random.randint(0, 59),
            random.randint(0, 59),
        ).timestamp()


def call_outscraper(url, last_refresh_timestamp):
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

    return review_data


def get_tripadvisor_reviews(url, last_refresh_timestamp):
    review_data = call_outscraper(url, last_refresh_timestamp)

    latest_retrieval = last_refresh_timestamp
    ret_data = []

    for review in review_data:
        review_text = review["description"]
        review_timestamp = int(get_timestamp_from_date(review["reviewed"]))

        if review_timestamp <= last_refresh_timestamp:
            continue

        if review_timestamp > latest_retrieval:
            latest_retrieval = review_timestamp

        # Decoding unsupported characters
        item = {"text": unidecode(review_text), "timestamp": review_timestamp}

        ret_data.append(item)

    return ret_data, latest_retrieval


def handle_request(params):
    tripadvisor_url = params["tripadvisor_url"]
    last_refresh_timestamp = int(params["last_refresh_timestamp"])

    reviews, latest_retrieval = get_tripadvisor_reviews(
        tripadvisor_url, last_refresh_timestamp
    )

    return JsonResponse(
        {"status": "SUCCESS", "newdata": reviews, "latest_retrieval": latest_retrieval}
    )
