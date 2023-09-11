import json
import os
import time
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


def generate_domain_html(
    domain_icon,
    domain_description,
    domain_overall_score,
    domain_num_analysed,
    domain_reviews_per_day,
    domain_toxicity,
    domain_positive,
    domain_negative,
    domain_neutral,
    domain_anger,
    domain_disgust,
    domain_fear,
    domain_joy,
    domain_sadness,
    domain_surprise,
    domain_start_date,
    domain_end_date,
):
    f = open("assets/domain_html.txt", "r")
    default_js = f.read()
    f.close()
    result = default_js.replace("{domain_icon}", domain_icon)
    result = result.replace("{domain_description}", domain_description)
    result = result.replace("{domain_overall_score}", str(domain_overall_score))
    result = result.replace("{domain_num_analysed}", str(domain_num_analysed))
    result = result.replace(
        "{domain_reviews_per_day}", str(round(domain_reviews_per_day, 2))
    )
    result = result.replace("{domain_toxicity}", str(domain_toxicity))
    result = result.replace("{domain_positive}", str(domain_positive))
    result = result.replace("{domain_negative}", str(domain_negative))
    result = result.replace("{domain_neutral}", str(domain_neutral))
    result = result.replace("{domain_anger}", str(domain_anger))
    result = result.replace("{domain_disgust}", str(domain_disgust))
    result = result.replace("{domain_fear}", str(domain_fear))
    result = result.replace("{domain_joy}", str(domain_joy))
    result = result.replace("{domain_sadness}", str(domain_sadness))
    result = result.replace("{domain_surprise}", str(domain_surprise))
    result = result.replace("{domain_start_date}", str(domain_start_date))
    result = result.replace("{domain_end_date}", str(domain_end_date))

    return result


def generate_source_graph_js(source_data):
    f = open("assets/source_js.txt", "r")
    default_js = f.read()
    f.close()
    source_num = 1
    result = ""
    for source in source_data:
        if source != "domain":
            source_overall_data_points = [
                int(
                    source_data[source]["aggregated_metrics"]["general"]["score"] * 100
                ),
                100
                - int(
                    source_data[source]["aggregated_metrics"]["general"]["score"] * 100
                ),
            ]
            source_ratios = [
                int(
                    source_data[source]["aggregated_metrics"]["ratios"]["positive"]
                    * 100
                ),
                int(
                    source_data[source]["aggregated_metrics"]["ratios"]["negative"]
                    * 100
                ),
                int(
                    source_data[source]["aggregated_metrics"]["ratios"]["neutral"] * 100
                ),
            ]
            source_emotions = [
                int(
                    source_data[source]["aggregated_metrics"]["emotions"]["anger"] * 100
                ),
                int(
                    source_data[source]["aggregated_metrics"]["emotions"]["disgust"]
                    * 100
                ),
                int(
                    source_data[source]["aggregated_metrics"]["emotions"]["fear"] * 100
                ),
                int(source_data[source]["aggregated_metrics"]["emotions"]["joy"] * 100),
                int(
                    source_data[source]["aggregated_metrics"]["emotions"]["sadness"]
                    * 100
                ),
                int(
                    source_data[source]["aggregated_metrics"]["emotions"]["surprise"]
                    * 100
                ),
            ]
            source_toxicity = [
                int(
                    source_data[source]["aggregated_metrics"]["toxicity"]["score"] * 100
                ),
                100
                - int(
                    source_data[source]["aggregated_metrics"]["toxicity"]["score"] * 100
                ),
            ]

            source_timeseries = []
            for i in source_data[source]["timeseries"]["overall"]:
                source_timeseries.append({"x": i[0], "y": i[1]})
            tempResult = default_js.replace(
                "%source_overall_data_points%", str(source_overall_data_points)
            )
            tempResult = tempResult.replace("%source_number%", str(source_num))
            tempResult = tempResult.replace("%source_ratios%", str(source_ratios))
            tempResult = tempResult.replace("%source_emotions%", str(source_emotions))
            tempResult = tempResult.replace(
                "%source_toxicity_data_points%", str(source_toxicity)
            )

            tempResult = tempResult.replace(
                "%source_timeseries%", str(source_timeseries)
            )

            tempResult = tempResult.replace("%source_num%", str(source_num))
            source_num += 1
            result += tempResult + "\n"

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
        # Fetching domains
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
        # Fetching data from warehouse
        data = {"source_ids": source_ids, "local_key": str(os.getenv("LOCAL_KEY"))}
        response = requests.post(url, json=data)
        if response.status_code != 200:
            return JsonResponse(
                {"status": "FAILURE", "details": "Error in warehouse request"}
            )
        response_data = response.json()
        if response_data["status"] == "FAILURE":
            return JsonResponse(
                {"status": "FAILURE", "details": response_data["details"]}
            )
        response_data.pop("status")
        # Replacing source_id with source_name
        for key in response_data:
            if key != "domain":
                for i in domain["sources"]:
                    if (i["source_id"]) == key:
                        response_data[key]["source_name"] = i["source_name"]
                        response_data[key]["source_type"] = i["params"]["source_type"]

        domain_data = response_data["domain"]

        domain_overall_data_points = [
            int(domain_data["aggregated_metrics"]["general"]["score"] * 100),
            100 - int(domain_data["aggregated_metrics"]["general"]["score"] * 100),
        ]

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

        # Getting number of reviews per source
        domain_num_per_source = []
        for key in response_data:
            if key != "domain":
                domain_num_per_source.append(
                    {
                        response_data[key]["source_name"]: response_data[key][
                            "meta_data"
                        ]["num_analysed"]
                    }
                )

        domain_timeseries = []
        for i in domain_data["timeseries"]["overall"]:
            domain_timeseries.append({"x": i[0], "y": i[1]})

        domain_graphs_js_string = generate_domain_graphs_js(
            domain_overall_data_points,
            domain_ratios,
            domain_emotions,
            domain_num_per_source,
            domain_timeseries,
        )

        domain_icon = domain["icon"]
        domain_description = domain["description"]

        domain_overall_score = int(
            domain_data["aggregated_metrics"]["general"]["score"] * 100
        )
        domain_num_analysed = domain_data["meta_data"]["num_analysed"]

        # calculating difference between earliest and latest record
        date_format = "%d %B %Y"
        start = time.mktime(
            time.strptime(domain_data["meta_data"]["earliest_record"], date_format)
        )
        end = time.mktime(
            time.strptime(domain_data["meta_data"]["latest_record"], date_format)
        )
        domain_reviews_per_day = ((end - start) / 86400) / domain_num_analysed
        domain_toxicity = int(
            domain_data["aggregated_metrics"]["toxicity"]["score"] * 100
        )

        domain_positive = int(
            domain_data["aggregated_metrics"]["ratios"]["positive"] * 100
        )
        domain_negative = int(
            domain_data["aggregated_metrics"]["ratios"]["negative"] * 100
        )
        domain_neutral = int(
            domain_data["aggregated_metrics"]["ratios"]["neutral"] * 100
        )
        domain_anger = int(domain_data["aggregated_metrics"]["emotions"]["anger"] * 100)
        domain_disgust = int(
            domain_data["aggregated_metrics"]["emotions"]["disgust"] * 100
        )
        domain_fear = int(domain_data["aggregated_metrics"]["emotions"]["fear"] * 100)
        domain_joy = int(domain_data["aggregated_metrics"]["emotions"]["joy"] * 100)
        domain_sadness = int(
            domain_data["aggregated_metrics"]["emotions"]["sadness"] * 100
        )
        domain_surprise = int(
            domain_data["aggregated_metrics"]["emotions"]["surprise"] * 100
        )

        domain_html_string = generate_domain_html(
            domain_icon,
            domain_description,
            domain_overall_score,
            domain_num_analysed,
            domain_reviews_per_day,
            domain_toxicity,
            domain_positive,
            domain_negative,
            domain_neutral,
            domain_anger,
            domain_disgust,
            domain_fear,
            domain_joy,
            domain_sadness,
            domain_surprise,
            domain_data["meta_data"]["earliest_record"],
            domain_data["meta_data"]["latest_record"],
        )

        source_graph_js = generate_source_graph_js(response_data)

        File = open("assets/input_template.html", "r")
        content = File.read()
        File.close()
        result = content.replace("{ domain_graphs_js_string }", domain_graphs_js_string)
        result = result.replace("{domain_html_string}", domain_html_string)
        result = result.replace("{ source_graph_js_string }", source_graph_js)
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

        # pdf_url = upload_pdf_to_azure(
        #     pdf_path, domain["name"] + "Report" + str(id) + ".pdf"
        # )
        # os.unlink(pdf_path)
        return JsonResponse({"status": "SUCCESS", "url": "testing"})
