from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse


# Create your views here.
@csrf_exempt
def check_source_ids(request):
    if request.method == "POST":
        raw_data = json.loads(request.body)
        return JsonResponse()
    return JsonResponse({"status": "FAILURE"})


@csrf_exempt
def check_domain_ids(request):
    if request.method == "POST":
        raw_data = json.loads(request.body)
        return JsonResponse()
    return JsonResponse({"status": "FAILURE"})
