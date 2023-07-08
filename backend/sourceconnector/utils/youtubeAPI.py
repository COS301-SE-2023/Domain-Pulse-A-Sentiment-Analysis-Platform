import requests
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR.parent / '.env'
load_dotenv(ENV_FILE)

API_KEY = os.getenv("YOUTUBE_API_KEY")


def get_channel(link):
    split_url = link.split("/")
    if split_url[0] == "https":
        if split_url[2][0]=="@":
                response =requests.get('https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername='+str( split_url[2][1:])+'&key='+str(API_KEY))
        else:
                response =requests.get('https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername='+str( split_url[2])+'&key='+str(API_KEY))
    elif split_url[0]=="youtube.com":
        if split_url[1][0]=="@":
            response =requests.get('https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername='+str( split_url[1][1:])+'&key='+str(API_KEY))
        else:
            response =requests.get('https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername='+str( split_url[1])+'&key='+str(API_KEY))