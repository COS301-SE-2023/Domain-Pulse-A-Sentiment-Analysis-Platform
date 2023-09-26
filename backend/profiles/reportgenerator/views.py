import json
import os
import time
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import pdfkit
import requests
from azure.storage.blob import BlobClient, ContentSettings
from profiles import settings
import shortuuid
import tempfile
import urllib.parse

GET_DOMAINS_ENDPOINT = (
    f"http://{str(os.getenv('DOMAINS_HOST')) }:"
    + str(os.getenv("DJANGO_DOMAINS_PORT"))
    + "/domains/get_domain"
)

assets_path = str(settings.ASSETS_DIR)


IMAGE_PATHS = {
    "googlereviews": "{assets_path}/images/google-logo.png",
    "youtube": "{assets_path}/images/youtube-logo.png",
    "tripadvisor": "{assets_path}/images/tripadvisor-logo.png",
    "livereview": "{assets_path}/images/live-review-logo.png",
}


def upload_pdf_to_azure(file_path, file_name):
    sanitized = urllib.parse.quote_plus(file_name)
    sas_url = f"{os.getenv('BLOB_URL')}{sanitized}{os.getenv('BLOB_SAS_KEY')}"
    client = BlobClient.from_blob_url(sas_url)
    settings = ContentSettings(content_type="application/pdf")

    with open(file_path, "rb") as data:
        client.upload_blob(data, content_settings=settings)

    pdf_url = client.url

    return pdf_url


def generate_domain_graphs_js(response_data):
    f = open(assets_path + "/domain_js.txt", "r")
    default_js = f.read()
    f.close()

    domain_overall_data_points = [
        int(response_data["domain"]["aggregated_metrics"]["general"]["score"] * 100),
        100
        - int(response_data["domain"]["aggregated_metrics"]["general"]["score"] * 100),
    ]

    domain_ratios = [
        int(response_data["domain"]["aggregated_metrics"]["ratios"]["positive"] * 100),
        int(response_data["domain"]["aggregated_metrics"]["ratios"]["negative"] * 100),
        int(response_data["domain"]["aggregated_metrics"]["ratios"]["neutral"] * 100),
    ]
    domain_emotions = [
        int(response_data["domain"]["aggregated_metrics"]["emotions"]["anger"] * 100),
        int(response_data["domain"]["aggregated_metrics"]["emotions"]["disgust"] * 100),
        int(response_data["domain"]["aggregated_metrics"]["emotions"]["fear"] * 100),
        int(response_data["domain"]["aggregated_metrics"]["emotions"]["joy"] * 100),
        int(response_data["domain"]["aggregated_metrics"]["emotions"]["sadness"] * 100),
        int(
            response_data["domain"]["aggregated_metrics"]["emotions"]["surprise"] * 100
        ),
    ]

    # Getting number of reviews per source
    source_names = []
    domain_num_per_source = []
    for key in response_data:
        if key != "domain":
            source_names.append(response_data[key]["source_name"])
            domain_num_per_source.append(
                response_data[key]["meta_data"]["num_analysed"]
            )

    domain_timeseries = []
    for i in response_data["domain"]["timeseries"]["overall"]:
        domain_timeseries.append({"x": i[0], "y": i[1]})
    result = default_js.replace(
        "%domain_overall_data_points%", str(domain_overall_data_points)
    )
    result = result.replace("%domain_ratios%", str(domain_ratios))
    result = result.replace("%domain_emotions%", str(domain_emotions))
    result = result.replace("%source_names%", str(source_names))
    result = result.replace("%domain_num_per_source%", str(domain_num_per_source))
    result = result.replace("%domain_timeseries%", str(domain_timeseries))

    return result


def generate_domain_html(
    domain_icon,
    domain_description,
    response_data,
    samples_per_source,
    DOMAINS_SAMPLE_DATA,
):
    f = open(assets_path + "/domain_html.txt", "r")
    default_js = f.read()
    f.close()
    domain_data = response_data["domain"]
    domain_overall_score = int(
        domain_data["aggregated_metrics"]["general"]["score"] * 100
    )
    domain_num_analysed = domain_data["meta_data"]["num_analysed"]

    sample_comment_string = ""
    counter = 0
    for sample in DOMAINS_SAMPLE_DATA:
        if counter % 2 == 0:
            sample_comment_string += (
                '<div class="box3 sb14">' + sample["data"] + "</div>"
            )
        else:
            sample_comment_string += (
                '<div class="box3 sb13">' + sample["data"] + "</div>"
            )
        counter += 1

    domain_sources = []
    for key in response_data:
        if key != "domain":
            domain_sources.append(
                {response_data[key]["source_name"]: response_data[key]["source_icon"]}
            )

    source_list = ""
    for i in domain_sources:
        source_list += '<div class="flex-item flex-column center"><div>'
        source_list += (
            '<img src="'
            + "{assets_path}/images/"
            + list(i.values())[0]
            + '"class="up-item" style="width: 40%" />'
        )
        source_list += "<p>" + list(i.keys())[0] + "</p>"
        source_list += "</div></div>"

    # calculating difference between earliest and latest record
    date_format = "%d %B %Y"
    start = time.mktime(
        time.strptime(domain_data["meta_data"]["earliest_record"], date_format)
    )
    end = time.mktime(
        time.strptime(domain_data["meta_data"]["latest_record"], date_format)
    )
    domain_reviews_per_day = 0
    if ((end - start) / 86400) != 0:
        domain_reviews_per_day = domain_num_analysed / ((end - start) / 86400)

    domain_toxicity = int(domain_data["aggregated_metrics"]["toxicity"]["score"] * 100)

    domain_positive = int(domain_data["aggregated_metrics"]["ratios"]["positive"] * 100)
    domain_negative = int(domain_data["aggregated_metrics"]["ratios"]["negative"] * 100)
    domain_neutral = int(domain_data["aggregated_metrics"]["ratios"]["neutral"] * 100)
    domain_anger = int(domain_data["aggregated_metrics"]["emotions"]["anger"] * 100)
    domain_disgust = int(domain_data["aggregated_metrics"]["emotions"]["disgust"] * 100)
    domain_fear = int(domain_data["aggregated_metrics"]["emotions"]["fear"] * 100)
    domain_joy = int(domain_data["aggregated_metrics"]["emotions"]["joy"] * 100)
    domain_sadness = int(domain_data["aggregated_metrics"]["emotions"]["sadness"] * 100)
    domain_surprise = int(
        domain_data["aggregated_metrics"]["emotions"]["surprise"] * 100
    )

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
    result = result.replace(
        "{domain_start_date}", str(domain_data["meta_data"]["earliest_record"])
    )
    result = result.replace(
        "{domain_end_date}", str(domain_data["meta_data"]["latest_record"])
    )
    result = result.replace("{domain_sources}", source_list)
    result = result.replace("{domain_sample_data}", sample_comment_string)

    return result


def generate_source_graph_js(source_data):
    f = open(assets_path + "/source_js.txt", "r")
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


def generate_source_html(response_data, DOMAINS_SAMPLE_DATA):
    f = open(assets_path + "/source_html.txt", "r")
    default_html = f.read()
    f.close()
    source_num = 1
    page_number = 3
    output = ""

    for source in response_data:
        if source != "domain":
            source_overall_score = int(
                response_data[source]["aggregated_metrics"]["general"]["score"] * 100
            )
            source_num_analysed = response_data[source]["meta_data"]["num_analysed"]

            source_url_string = ""

            if response_data[source]["url"] != "":
                source_url_string = (
                    '<div class="flex-row center" style="height: 100%; margin-left: 1rem">\
                  <img src="{assets_path}/images/link-solid.svg" style="width: 30px; margin-right: 1rem" />\
                  <a style="\
                        max-width: 500px;\
                        text-overflow: ellipsis;\
                        white-space: nowrap;\
                        overflow: hidden;"\
                        href="'
                    + response_data[source]["url"]
                    + '">'
                    + response_data[source]["url"]
                    + "</a>\
                </div>"
                )

            # calculating difference between earliest and latest record
            date_format = "%d %B %Y"
            start = time.mktime(
                time.strptime(
                    response_data[source]["meta_data"]["earliest_record"], date_format
                )
            )
            end = time.mktime(
                time.strptime(
                    response_data[source]["meta_data"]["latest_record"], date_format
                )
            )

            source_reviews_per_day = 0
            if (end - start) / 86400 != 0:
                source_reviews_per_day = source_num_analysed / ((end - start) / 86400)
            source_toxicity = int(
                response_data[source]["aggregated_metrics"]["toxicity"]["score"] * 100
            )

            source_positive = int(
                response_data[source]["aggregated_metrics"]["ratios"]["positive"] * 100
            )
            source_negative = int(
                response_data[source]["aggregated_metrics"]["ratios"]["negative"] * 100
            )
            source_neutral = int(
                response_data[source]["aggregated_metrics"]["ratios"]["neutral"] * 100
            )
            source_anger = int(
                response_data[source]["aggregated_metrics"]["emotions"]["anger"] * 100
            )
            source_disgust = int(
                response_data[source]["aggregated_metrics"]["emotions"]["disgust"] * 100
            )
            source_fear = int(
                response_data[source]["aggregated_metrics"]["emotions"]["fear"] * 100
            )
            source_joy = int(
                response_data[source]["aggregated_metrics"]["emotions"]["joy"] * 100
            )
            source_sadness = int(
                response_data[source]["aggregated_metrics"]["emotions"]["sadness"] * 100
            )
            source_surprise = int(
                response_data[source]["aggregated_metrics"]["emotions"]["surprise"]
                * 100
            )

            sample_data = []

            if source != "domain":
                for sample in response_data[source]["individual_metrics"]:
                    source_comment_count = 1
                    if source_comment_count <= 13:
                        if sample not in DOMAINS_SAMPLE_DATA:
                            sample_data.append(sample["data"])
                            source_comment_count += 1

            counter = 0
            source_sample_data_string = ""
            for data in sample_data:
                if counter % 2 == 0:
                    source_sample_data_string += (
                        '<div class="box3 sb14">' + data + "</div>"
                    )

                else:
                    source_sample_data_string += (
                        '<div class="box3 sb13">' + data + "</div>"
                    )

                counter += 1

            result = default_html.replace(
                "{source_icon}",
                "{assets_path}/images/" + response_data[source]["source_icon"],
            )
            result = result.replace("{source_url}", source_url_string)
            result = result.replace("{source_sample_data}", source_sample_data_string)
            result = result.replace(
                "{source_name}", response_data[source]["source_name"]
            )
            result = result.replace("{source_number}", str(source_num))
            result = result.replace("{source_overall_score}", str(source_overall_score))
            result = result.replace("{source_num_analysed}", str(source_num_analysed))
            result = result.replace(
                "{source_review_rate}", str(round(source_reviews_per_day, 2))
            )
            result = result.replace("{source_toxicity}", str(source_toxicity))
            result = result.replace("{source_positive}", str(source_positive))
            result = result.replace("{source_negative}", str(source_negative))
            result = result.replace("{source_neutral}", str(source_neutral))
            result = result.replace("{source_anger}", str(source_anger))
            result = result.replace("{source_disgust}", str(source_disgust))
            result = result.replace("{source_fear}", str(source_fear))
            result = result.replace("{source_joy}", str(source_joy))
            result = result.replace("{source_sadness}", str(source_sadness))
            result = result.replace("{source_surprise}", str(source_surprise))
            result = result.replace(
                "{source_start_date}",
                str(response_data[source]["meta_data"]["earliest_record"]),
            )
            result = result.replace(
                "{source_end_date}",
                str(response_data[source]["meta_data"]["latest_record"]),
            )
            result = result.replace("{page_num_1}", str(page_number))
            page_number += 1
            result = result.replace("{page_num_2}", str(page_number))
            page_number += 1
            source_num += 1
            output += result + "\n"

    return output


@csrf_exempt
def generate_report(request: HttpRequest):
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
        DOMAINS_SAMPLE_DATA = []

        raw_data = json.loads(request.body)
        domain_id = raw_data["domain_id"]
        data = {"id": domain_id}
        # Fetching domains
        response = requests.post(
            GET_DOMAINS_ENDPOINT, json=data, headers=request.headers
        )
        if response.status_code != 200:
            return JsonResponse(
                {"status": "FAILURE", "details": "Error in domain request"}
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
        url = f"http://{str(os.getenv('WAREHOUSE_HOST'))}:{str(os.getenv('DJANGO_WAREHOUSE_PORT'))}/query/get_report_data_internal/"
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
        number_of_sources = len(response_data) - 1

        if number_of_sources == 0:
            return JsonResponse(
                {"status": "FAILURE", "details": "No data available for this domain"}
            )

        for key in response_data:
            if response_data[key]["meta_data"]["num_analysed"] == 0:
                return JsonResponse(
                    {
                        "status": "FAILURE",
                        "details": "No data available in a source",
                    }
                )

            if key != "domain":
                for i in domain["sources"]:
                    if (i["source_id"]) == key:
                        response_data[key]["source_name"] = i["source_name"]
                        response_data[key]["source_type"] = i["params"]["source_type"]
                        response_data[key]["source_icon"] = i["source_icon"]
                        if i["params"]["source_type"] == "youtube":
                            response_data[key]["url"] = (
                                "https://www.youtube.com/watch?v="
                                + i["params"]["video_id"]
                            )
                        elif i["params"]["source_type"] == "googlereviews":
                            response_data[key]["url"] = i["params"]["maps_url"]
                        elif i["params"]["source_type"] == "tripadvisor":
                            response_data[key]["url"] = i["params"]["tripadvisor_url"]
                        elif i["params"]["source_type"] == "trustpilot":
                            response_data[key]["url"] = i["params"]["query_url"]
                        else:
                            response_data[key]["url"] = ""

        samples_per_source = 8 / number_of_sources
        if samples_per_source < 1:
            samples_per_source = 1

        samples_per_source = int(samples_per_source)
        domain_graphs_js_string = generate_domain_graphs_js(response_data)

        domain_icon = domain["icon"]
        domain_description = domain["description"]

        source_comment_count = 1

        for source in response_data:
            if source != "domain":
                if source_comment_count <= 8:
                    DOMAINS_SAMPLE_DATA.extend(
                        response_data[source]["individual_metrics"][:samples_per_source]
                    )
                    source_comment_count += 1
                else:
                    break

        domain_html_string = generate_domain_html(
            domain_icon,
            domain_description,
            response_data,
            samples_per_source,
            DOMAINS_SAMPLE_DATA,
        )
        source_graph_js = ""
        source_html = ""

        if number_of_sources > 1:
            source_graph_js = generate_source_graph_js(response_data)
            source_html = generate_source_html(response_data, DOMAINS_SAMPLE_DATA)

        File = open(assets_path + "/input_template.html", "r")
        content = File.read()
        File.close()
        result = content.replace("{ domain_graphs_js_string }", domain_graphs_js_string)
        result = result.replace("{domain_html_string}", domain_html_string)
        result = result.replace("{ source_graph_js_string }", source_graph_js)
        result = result.replace("{source_html}", source_html)
        result = result.replace("{domain_name}", domain["name"])
        result = result.replace("{domain_icon}", domain_icon)
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
        os.unlink(pdf_path)
        return JsonResponse({"status": "SUCCESS", "url": pdf_url})
    else:
        return JsonResponse({"status": "FAILURE", "details": "Invalid request"})
