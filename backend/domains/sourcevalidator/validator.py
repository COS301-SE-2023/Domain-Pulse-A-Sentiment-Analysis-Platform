import os
from pathlib import Path
from dotenv import load_dotenv
from django.http import JsonResponse, HttpRequest, HttpResponse
import requests

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
