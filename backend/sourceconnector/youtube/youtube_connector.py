import requests


def get_comments_by_video_id(video_id: str):
    URL = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={video_id}&maxResults=100&key={YOUTUBE_API_KEY}"
    response = requests.get(url=URL)
    data = response.json()

    if "items" in data:
        for item in data["items"]:
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            original_text = snippet["textOriginal"]
            last_updated_time = snippet["updatedAt"]
            print("Original Text:", original_text)
            print("Last Updated Time:", last_updated_time)
    else:
        print("No comments found.")


def handle_request(params):
    pass
