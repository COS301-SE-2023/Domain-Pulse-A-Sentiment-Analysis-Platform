import requests
import os
from pathlib import Path
from dotenv import load_dotenv
import json
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR.parent / '.env'
load_dotenv(ENV_FILE)

API_KEY = os.getenv("YOUTUBE_API_KEY")


def get_channel_playlist(link):
    split_url = link.split("/")
    response=None
    if split_url[0] == "https":
        if split_url[2][0]=="@":
                response =requests.get('https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername='+str( split_url[2][1:])+'&key='+str(API_KEY))
        elif split_url[2][0]=="channel":
                response =requests.get('https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&id='+str( split_url[3])+'&key='+str(API_KEY))
    elif split_url[0]=="youtube.com":
        if split_url[1][0]=="@":
            response =requests.get('https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername='+str( split_url[1][1:])+'&key='+str(API_KEY))
        elif split_url[1][0]=="channel":
            response =requests.get('https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&id='+str( split_url[2])+'&key='+str(API_KEY))
    if response==None:
         return {"status":"FAILURE"}
    else:
         data = response.text
         final_data=json.loads(data)
         return final_data["items"]["contentDetails"]["relatedPlaylists"]["uploads"]

def get_playlist_video(playlist_id):
    response = requests.get("https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&playlistId="+str(playlist_id)+"&key="+str(API_KEY))
    data = response.text
    final_data=json.loads(data)
    return final_data

def get_comments_for_video(video_id):
    response=requests.get("https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&videoId="+str(video_id)+"&key="+str(API_KEY))
    data = response.text
    final_data=json.loads(data)
    return final_data