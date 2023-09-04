import requests
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv
import csv
from django.http import JsonResponse, HttpRequest, HttpResponse


# def get_comments_by_video_id(video_id: str, last_refresh_time):
#     data = call_youtube_api(video_id, last_refresh_time)

#     comments = []

#     latest_retrieval = last_refresh_time

#     if "items" in data:
#         for item in data["items"]:
#             snippet = item["snippet"]["topLevelComment"]["snippet"]
#             original_text = snippet["textOriginal"]
#             last_updated_time = snippet["updatedAt"]
#             datetime_object = datetime.strptime(last_updated_time, "%Y-%m-%dT%H:%M:%SZ")
#             last_updated_timestamp = datetime_object.timestamp()

#             if last_updated_timestamp > last_refresh_time:
#                 comments.append(
#                     {
#                         "text": str(original_text).replace('"', ""),
#                         "timestamp": int(last_updated_timestamp),
#                     }
#                 )

#                 if last_updated_timestamp > latest_retrieval:
#                     latest_retrieval = last_updated_timestamp

#     return comments, latest_retrieval


def handle_request(params):
    file = params["file"]

    return JsonResponse({"status": "SUCCESS"})
