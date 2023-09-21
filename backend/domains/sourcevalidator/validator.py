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
TRUSTPILOT_API_KEY = os.getenv("TRUSTPILOT_API_KEY")


def handler(params):
    if "source_type" in params:
        type_of_source: str = params["source_type"]
    else:
        return False, "Missing parameter: source_type"

    if type_of_source.lower() == "youtube":
        if "video_id" not in params:
            return False, "Missing parameter: video_id"
        is_valid = youtube_validate_video_id(params["video_id"])
        if not is_valid:
            return False, "video_id is invalid"
        return True, "Source details are valid"

    elif type_of_source.lower() == "googlereviews":
        if "maps_url" not in params:
            return False, "Missing parameter: maps_url"
        is_valid = validate_google_reviews(params["maps_url"])
        if not is_valid:
            return False, "maps_url is invalid"
        return True, "Source details are valid"

    elif type_of_source.lower() == "csv":
        return True, "Source details are valid"

    elif type_of_source.lower() == "tripadvisor":
        if "tripadvisor_url" not in params:
            return False, "Missing parameter: tripadvisor_url"
        is_valid = validate_tripadvisor(params["tripadvisor_url"])
        if not is_valid:
            return False, "tripadvisor_url is invalid"
        return True, "Source details are valid"

    elif type_of_source.lower() == "trustpilot":
        if "query_url" not in params:
            return False, "Missing parameter: query_url"
        is_valid = validate_trustpilot(params["query_url"])
        if not is_valid:
            return False, "query_url is invalid"
        return True, "Source details are valid"

    elif type_of_source.lower() == "livereview":
        if "is_active" not in params:
            return False, "Missing parameter: is_active"
        return True, "Source details are valid"

    else:
        return False, "Unknown source_type"


def validate_trustpilot(query_url):
    ENDPOINT = "https://api.app.outscraper.com/trustpilot/reviews"
    REVIEWS_LIMIT = 1
    HEADERS = {"X-API-KEY": TRUSTPILOT_API_KEY}

    response = requests.get(
        url=ENDPOINT
        + "?"
        + "query="
        + query_url
        + "&limit="
        + str(REVIEWS_LIMIT)
        + "&async="
        + "false",
        headers=HEADERS,
    )

    return "error" not in response.json()


def youtube_validate_video_id(video_id: str):
    URL = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={video_id}&maxResults=1&key={YOUTUBE_API_KEY}"

    response = requests.get(url=URL)
    data = response.json()

    if "error" in data:
        return False
    return True


def validate_tripadvisor(url):
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


def validate_google_reviews(maps_url):
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
        # print(results)

        if results[0]["place_id"] == "__NO_PLACE_FOUND__":
            return False
        return True
    except Exception:
        return False
