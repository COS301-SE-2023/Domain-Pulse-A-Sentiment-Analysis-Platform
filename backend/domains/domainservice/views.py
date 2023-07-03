from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from utils import domainscrud
# Create your views here.
@csrf_exempt
def create_domain(request: HttpRequest):
    if request.method == "POST":
        raw_data=json.loads(request.body)
        return JsonResponse(domainscrud.create_domain(raw_data["name"],raw_data["icon"],raw_data["description"]))
    return JsonResponse({"Status":"FAILURE"})