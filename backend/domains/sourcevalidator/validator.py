import os
from pathlib import Path
from dotenv import load_dotenv
from django.http import JsonResponse, HttpRequest, HttpResponse
import requests
from outscraper import ApiClient

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR.parent / ".env"
load_dotenv(ENV_FILE)
GOOGLE_REVIEWS_API_KEY = os.getenv("GOOGLE_REVIEWS_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
TRIPADVISOR_API_KEY = os.getenv("TRIPADVISOR_API_KEY")


def youtube_validate_video_id(video_id: str):
    URL = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={video_id}&maxResults=1&key={YOUTUBE_API_KEY}"

    response = requests.get(url=URL)
    data = response.json()

    if "error" in data:
        return False
    return True


def get_tripadvisor_reviews(url):
    ENDPOINT = "https://api.app.outscraper.com/tripadvisor/reviews"
    REVIEWS_LIMIT = 1

    HEADERS = {"X-API-KEY": TRIPADVISOR_API_KEY}

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

    if review_data == []:
        return False
    return True


def get_google_reviews(maps_url):
    client = ApiClient(api_key=GOOGLE_REVIEWS_API_KEY)
    REVIEWS_LIMIT = 1
    LIMIT = 1  # pls DO NOT change this
    # ignores reviews with no text (please don't change this)
    IGNORE_EMPTY = True
    LANG = "en"  # language (models are trained in English so pls don't change)
    COUNTRY = "ZA"  # South African Google

    try:
        results = client.google_maps_reviews(
            query=[str(maps_url)],
            reviews_limit=REVIEWS_LIMIT,
            limit=LIMIT,
            ignore_empty=IGNORE_EMPTY,
            language=LANG,
            region=COUNTRY,
        )
        print(results)

        if results[0]["place_id"] == "__NO_PLACE_FOUND__":
            return False
        return True
    except Exception:
        return False
