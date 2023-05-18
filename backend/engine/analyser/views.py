from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.


def get_sentiment_metrics(request):
    return JsonResponse({"works?": "yes"})
