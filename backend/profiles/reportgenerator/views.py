import json
import os
from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import matplotlib.pyplot as plt
import numpy as np
import pdfkit
import jinja2
import base64


def get_image_file_as_base64_data():
    with open("images/positivity", "rb") as image_file:
        return base64.b64encode(image_file.read())


@csrf_exempt
def generate_report(request: HttpRequest):
    html_template = '<div class="header"> <h1>Domain Pulse</h1> </div>'

    if request.method == "POST":
        raw_data = json.loads(request.body)
        url = f"http://localhost:{str(os.getenv('DJANGO_WAREHOUSE_PORT'))}/get_domain_dashboard/"
        overall_score = 0.8
        val = [1 - overall_score, overall_score]
        val.append(sum(val))
        colors = ["grey", "blue", "white"]
        fig = plt.figure(figsize=(1.8, 1), dpi=200)
        ax = fig.add_subplot(1, 1, 1)
        ax.pie(val, colors=colors)
        ax.add_artist(plt.Circle((0, 0), 0.6, color="white"))
        plt.subplots_adjust(left=-0.2, right=1.2, top=1.1, bottom=-1)
        generalSent_file = "images/generalSent.png"
        plt.savefig(generalSent_file)
        plt.close()
        positive = 0.6
        neutral = 0.3
        negative = 0.1
        y = np.array([positive, neutral, negative])
        mylabels = ["Positive", "Neutral", "Negative"]
        plt.figure(figsize=(2.5, 2), dpi=200)
        plt.pie(y, labels=mylabels, colors=["royalblue", "grey", "firebrick"])
        plt.subplots_adjust(left=-0.2, right=1, top=1, bottom=0)
        positivity_file = "images/positivity.png"
        plt.savefig(positivity_file)
        plt.close()
        data = {
            "Joy": 36,
            "Sadness": 2,
            "Anger": 3,
            "Fear": 1,
            "Disgust": 2,
            "Surprise": 20,
        }
        emotions = list(data.keys())
        values = list(data.values())
        plt.figure(figsize=(5.7, 4.4), dpi=200)
        plt.bar(
            emotions,
            values,
            color=(
                "springgreen",
                "darkblue",
                "maroon",
                "slategray",
                "darkgreen",
                "gold",
            ),
            width=0.4,
        )
        plt.xlabel("Emotions")
        plt.ylabel("Number of Reviews")
        plt.subplots_adjust(left=0.11, right=0.99, top=0.98, bottom=0.11)
        emotion_file = "images/emotions.png"
        plt.savefig(emotion_file)
        plt.close()

        toxic = 0.05
        nontoxic = 0.95
        y = np.array([toxic, nontoxic])
        mylabels = ["Toxic", "Non-Toxic"]
        plt.figure(figsize=(2.8, 2), dpi=200)
        plt.pie(y, labels=mylabels, colors=["gray", "royalblue"])
        plt.subplots_adjust(left=0, right=1.1, top=1, bottom=0)
        toxicity_file = "images/toxicity.png"
        plt.savefig(toxicity_file)
        plt.close()

        output = f"<html>{html_template}<div> <h1>All Sources</h1> </div> <div> <img src=\"{str(os.getenv('PROFILES_PATH'))}{generalSent_file}\"> </div> <div> <img src=\"{str(os.getenv('PROFILES_PATH'))}{emotion_file}\"> </div><div> <img src=\"{str(os.getenv('PROFILES_PATH'))}{positivity_file}\"> </div><div> <img src=\"{str(os.getenv('PROFILES_PATH'))}{toxicity_file}\"> </div></html>"

        config = pdfkit.configuration(wkhtmltopdf="/usr/bin/wkhtmltopdf")
        output_pdf = "pdfs/pdf_generated.pdf"
        pdfkit.from_string(
            output,
            output_pdf,
            configuration=config,
            css="css/style.css",
            options={"enable-local-file-access": ""},
        )

        return JsonResponse({"status": "SUCCESS"})
