import json
import os
from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import matplotlib.pyplot as plt
import numpy as np
import pdfkit
import jinja2
import requests
from azure.storage.blob import BlobClient
from check_auth import views as checks
import shortuuid
import tempfile

GET_DOMAINS_ENDPOINT = (
    "http://localhost:" + str(os.getenv("DJANGO_DOMAINS_PORT")) + "/domains/get_domain"
)


def upload_pdf_to_azure(file_path, file_name):
    sas_url = f"{os.getenv('BLOB_URL')}{file_name}{os.getenv('BLOB_SAS_KEY')}"
    client = BlobClient.from_blob_url(sas_url)

    with open(file_path, "rb") as data:
        client.upload_blob(data)

    pdf_url = client.url

    return pdf_url


def generate_domain_graphs_js(
    domain_overall_data_points,
    domain_ratios,
    domain_emotions,
    domain_num_per_source,
    domain_timeseries,
):
    f = open("assets/domain_js.txt", "r")
    default_js = f.read()
    f.close()
    result = default_js.replace(
        "%domain_overall_data_points%", str(domain_overall_data_points)
    )
    result = result.replace("%domain_ratios%", str(domain_ratios))
    result = result.replace("%domain_emotions%", str(domain_emotions))
    result = result.replace("%domain_num_per_source%", str(domain_num_per_source))
    result = result.replace("%domain_timeseries%", str(domain_timeseries))

    return result


@csrf_exempt
def generate_report(request: HttpRequest):
    assets_path = os.getenv("ASSETS_PATH")

    # html_template = f'<div class="header"><h1>Hello World</h1> <img src="{assets_path}/images/google-logo.png"></div>'

    # with open(assets_path + "/input_template.html", "r") as html_template_file:
    #     html_template = html_template_file.read()

    # html_template = html_template.replace("{assets_path}", assets_path)

    # # Format the html_template string.
    # html_template = format(html_template)

    # output = f"<html>{html_template}</html>"

    # config = pdfkit.configuration(wkhtmltopdf="/usr/bin/wkhtmltopdf")
    # output_pdf = "Report"

    if request.method == "POST":
        raw_data = json.loads(request.body)
        domain_id = raw_data["domain_id"]
        data = {"id": domain_id}

        response = requests.post(
            GET_DOMAINS_ENDPOINT, json=data, headers=request.headers
        )
        response_data = response.json()
        if response_data["status"] == "FAILURE":
            return JsonResponse(
                {"status": "FAILURE", "details": response_data["details"]}
            )
        domain = response_data["domain"]

        source_ids = []
        for i in domain["sources"]:
            source_ids.append(i["source_id"])

        id = shortuuid.ShortUUID().random(length=12)
        url = f"http://localhost:{str(os.getenv('DJANGO_WAREHOUSE_PORT'))}/query/get_report_data_internal/"

        data = {"source_ids": source_ids, "local_key": str(os.getenv("LOCAL_KEY"))}
        response = requests.post(url, json=data)
        response_data = response.json()
        if response_data["status"] == "FAILURE":
            return JsonResponse(
                {"status": "FAILURE", "details": response_data["details"]}
            )
        named_sources = {}
        for key in response_data:
            if key != "domain":
                for i in domain["sources"]:
                    if i["source_id"] == key:
                        named_sources[i["source_name"]] = response_data[key]

            else:
                named_sources["domain"] = response_data[key]

        domain_data = named_sources["domain"]

        domain_overall_data_points = [
            int(domain_data["aggregated_metrics"]["general"]["score"] * 100),
            100 - int(domain_data["aggregated_metrics"]["general"]["score"] * 100),
        ]

        domain_overall_score = int(
            domain_data["aggregated_metrics"]["general"]["score"] * 100
        )
        domain_ratios = [
            int(domain_data["aggregated_metrics"]["ratios"]["positive"] * 100),
            int(domain_data["aggregated_metrics"]["ratios"]["negative"] * 100),
            int(domain_data["aggregated_metrics"]["ratios"]["neutral"] * 100),
        ]
        domain_emotions = [
            int(domain_data["aggregated_metrics"]["emotions"]["anger"] * 100),
            int(domain_data["aggregated_metrics"]["emotions"]["disgust"] * 100),
            int(domain_data["aggregated_metrics"]["emotions"]["fear"] * 100),
            int(domain_data["aggregated_metrics"]["emotions"]["joy"] * 100),
            int(domain_data["aggregated_metrics"]["emotions"]["sadness"] * 100),
            int(domain_data["aggregated_metrics"]["emotions"]["surprise"] * 100),
        ]
        domain_num_per_source = []
        for key in named_sources:
            if key != "domain":
                domain_num_per_source.append(
                    {key: named_sources[key]["meta_data"]["num_analysed"]}
                )

        # change this to use the data from the database
        domain_time_series = '[{ x: "2020-02-15 18:37:39", y: 2 },{ x: "2020-02-16 18:37:39", y: 3 },{ x: "2020-02-17 18:37:39", y: 1 },{ x: "2020-02-23 18:37:39", y: 8 },{ x: "2020-02-26 18:37:39", y: 10 },]'

        domain_graphs_js_string = generate_domain_graphs_js(
            domain_overall_data_points,
            domain_ratios,
            domain_emotions,
            domain_num_per_source,
            domain_time_series,
        )

        File = open("assets/input_template.html", "r")
        content = File.read()
        File.close()
        result = content.replace("% domain_graphs_js_string %", domain_graphs_js_string)
        html_template = result.replace("{assets_path}", assets_path)

        # Format the html_template string.
        html_template = format(html_template)
        output = f"<html>{html_template}</html>"

        config = pdfkit.configuration(wkhtmltopdf="/usr/bin/wkhtmltopdf")
        output_pdf = domain["name"] + "Report" + str(id)
        temp_file = tempfile.NamedTemporaryFile(
            prefix=output_pdf,
            suffix=".pdf",
            dir=assets_path,
            delete=False,
        )
        pdf_path = temp_file.name
        pdfkit.from_string(
            output,
            pdf_path,
            configuration=config,
            css=assets_path + "/style.css",
            options={
                "enable-local-file-access": "",
                "margin-top": "0in",
                "margin-right": "0in",
                "margin-bottom": "0in",
                "margin-left": "0in",
                "encoding": "UTF-8",
                "no-outline": None,
            },
        )

        pdf_url = upload_pdf_to_azure(
            pdf_path, domain["name"] + "Report" + str(id) + ".pdf"
        )
        # os.unlink(pdf_path)
        return JsonResponse({"status": "SUCCESS", "url": pdf_url})
