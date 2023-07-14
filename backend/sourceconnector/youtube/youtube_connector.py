import requests
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv
import datetime
from django.http import JsonResponse, HttpRequest, HttpResponse

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR.parent / ".env"
load_dotenv(ENV_FILE)
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def get_comments_by_video_id(video_id: str, last_refresh_time):
    URL = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={video_id}&maxResults=100&key={YOUTUBE_API_KEY}"

    response = requests.get(url=URL)
    data = response.json()

    comments = []

    latest_retrieval = 0

    if "items" in data:
        for item in data["items"]:
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            original_text = snippet["textOriginal"]
            last_updated_time = snippet["updatedAt"]
            datetime_object = datetime.strptime(last_updated_time, "%Y-%m-%dT%H:%M:%SZ")
            last_updated_timestamp = datetime_object.timestamp()

            if last_updated_timestamp > last_refresh_time:
                comments.append(
                    {"text": original_text, "timestamp": last_updated_timestamp}
                )

                if last_updated_timestamp > latest_retrieval:
                    latest_retrieval = last_updated_timestamp

    return comments, latest_retrieval


def handle_request(params):
    video_id = params["video_id"]
    last_refresh_timestamp = float(params["last_refresh_timestamp"])

    comments, latest_retrieval = get_comments_by_video_id(
        video_id, last_refresh_timestamp
    )

    return JsonResponse(
        {"status": "SUCCESS", "newdata": comments, "latest_retrieval": latest_retrieval}
    )
