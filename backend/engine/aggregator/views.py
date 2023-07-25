from django.shortcuts import render
from postprocessor import aggregation
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpRequest, HttpResponse
import json


# Create your views here.
@csrf_exempt
def aggregate_metrics(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)
        metrics_list = raw_data["metrics"]
        return JsonResponse(aggregation.aggregate_sentiment_data(metrics_list))
    return JsonResponse({"status": "FAILURE", "details": "Invalid request type"})
