import json
import os
from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import matplotlib.pyplot as plt
import numpy as np
# Create your views here.


@csrf_exempt
def generate_report(request: HttpRequest):
    if request.method=="POST":
        raw_data = json.loads(request.body)
        url = f"http://localhost:{str(os.getenv('DJANGO_WAREHOUSE_PORT'))}/get_domain_dashboard/"
        overall_score = 0.8
        val= [1-overall_score,overall_score]
        val.append(sum(val))
        colors = ['grey','blue', 'white']
        fig = plt.figure(figsize=(8,6),dpi=100)
        ax = fig.add_subplot(1,1,1)
        ax.pie(val, colors=colors)
        ax.add_artist(plt.Circle((0, 0), 0.6, color='white'))
        plt.savefig("images/generalSent.png")
        plt.close()
        positive=0.6
        neutral=0.3
        negative=0.1
        y = np.array([positive,neutral,negative])
        mylabels = ["Positive","Neutral","Negative"]

        plt.pie(y, labels = mylabels)
        plt.savefig("images/PNN.png")
        plt.close()
        data = {"Joy":36,"Sadness":2,"Anger":3,"Fear":1,"Disgust":2,"Surprise":20}
        emotions = list(data.keys())
        values = list(data.values())

        plt.bar(emotions, values, color ='maroon',
        width = 0.4)
        plt.xlabel("Emotions")
        plt.ylabel("Number of Reviews")

        plt.savefig("images/emotions.png")
        plt.close()
        
        toxic=0.05
        nontoxic=0.95
        y = np.array([toxic,nontoxic])
        mylabels = ["Toxic","Non-Toxic"]

        plt.pie(y, labels = mylabels)
        plt.savefig("images/toxicity.png")
        plt.close()
        return JsonResponse({"status":"SUCCESS"})