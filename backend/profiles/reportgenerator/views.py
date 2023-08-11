import json
import os
from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.


@csrf_exempt
def generate_report(request: HttpRequest):
    if request.method=="POST":
        raw_data = json.loads(request.body)
        url = f"http://localhost:{str(os.getenv('DJANGO_WAREHOUSE_PORT'))}/get_domain_dashboard/"
        return JsonResponse("")