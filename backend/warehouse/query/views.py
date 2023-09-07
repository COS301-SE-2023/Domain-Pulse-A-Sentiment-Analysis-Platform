from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from datamanager import sentiment_record_model
import json
import requests
from authchecker import auth_checks
import os

# Create your views here.


@csrf_exempt
def get_dashboard_data_source(request: HttpRequest):
    # 1. Query the sentiment records database for all data from a provided source
    # 2. Determine the meta-data
    # 3. Send that data to the aggregator (engine) to get cumulative metrics
    # 4. Return data from the response from 3, as well as meta-data and an other status codes, etc

    # raw_data = json.loads(request.body)
    #     new_records = raw_data["data"]
    #     scores = []
    #     for item in new_records:
    #         scores.append(processing.analyse_content(item))

    if request.method == "POST":
        raw_data = json.loads(request.body)
        source_id_raw = raw_data["source_id"]

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request, source_id_list=[source_id_raw]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        individual_records = sentiment_record_model.get_records_by_source_id(
            source_id_raw
        )

        for record in individual_records:
            record["_id"] = ""

        request_to_engine_body = {"metrics": individual_records}

        url = f"http://localhost:{str(os.getenv('DJANGO_ENGINE_PORT'))}/aggregator/aggregate/"
        response_from_aggregator = requests.post(
            url, data=json.dumps(request_to_engine_body)
        )

        if response_from_aggregator.status_code == 200:
            response = {}
            response["status"] = "SUCCESS"

            agg_response_body = response_from_aggregator.json()

            response["aggregated_metrics"] = agg_response_body["overall"]
            response["meta_data"] = agg_response_body["metadata"]
            response["individual_metrics"] = agg_response_body["individual_data"]
            response["timeseries"] = agg_response_body["timeseries"]

            return JsonResponse(response)
        else:
            return JsonResponse({"status": "FAILURE"})

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def get_dashboard_data_domain(request: HttpRequest):
    # 1. Query the sentiment records database for all data from a provided domain
    # 2. Determine the meta-data
    # 3. Send that data to the aggregator (engine) to get cumulative metrics
    # 4. Return data from the response from 3, as well as meta-data and an other status codes, etc
    if request.method == "POST":
        raw_data = json.loads(request.body)
        source_ids_raw = raw_data["source_ids"]

        individual_records = []
        source_ids = list(source_ids_raw)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request, source_id_list=source_ids
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        for source_id in source_ids_raw:
            individual_records += sentiment_record_model.get_records_by_source_id(
                source_id
            )

        for record in individual_records:
            record["_id"] = ""

        request_to_engine_body = {"metrics": individual_records}

        url = f"http://localhost:{str(os.getenv('DJANGO_ENGINE_PORT'))}/aggregator/aggregate/"
        response_from_aggregator = requests.post(
            url, data=json.dumps(request_to_engine_body)
        )

        if response_from_aggregator.status_code == 200:
            response = {}
            response["status"] = "SUCCESS"

            agg_response_body = response_from_aggregator.json()

            response["aggregated_metrics"] = agg_response_body["overall"]
            response["meta_data"] = agg_response_body["metadata"]
            response["individual_metrics"] = agg_response_body["individual_data"]
            response["timeseries"] = agg_response_body["timeseries"]

            return JsonResponse(response)
        else:
            return JsonResponse({"status": "FAILURE"})

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def refresh_source(request: HttpRequest):
    # FINAL VERSION
    # 0. Given a source_id, get the details of the source from the Domains service (performs auth)
    # 1. Given the appropriate source, invoke the SourceConnector to get new data (ie: past the most recent timestamp)
    # 2. Send the new data from 1 to the analyser (engine)
    # 3. Store the data with its computed metrics in the database
    # 3.1 Update the last_refreshed field in the domains database for the source (performs auth)
    # 4. (Frontend concern) - call the get_data_dashboard_source/domain endpoint to refresh the frontend dashboard

    originalRequest = request

    GET_SOURCE_ENDPOINT = (
        f"http://localhost:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/domains/get_source"
    )
    UPDATE_LAST_REFRESHED_ENDPOINT = f"http://localhost:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/domains/update_last_refresh"
    SOURCE_CONNECTOR_ENDPOINT = f"http://localhost:{str(os.getenv('DJANGO_SOURCECONNECTOR_PORT'))}/refresh/source/"
    ANALYSER_ENDPOINT = (
        f"http://localhost:{str(os.getenv('DJANGO_ENGINE_PORT'))}/analyser/compute/"
    )

    if request.method == "POST":
        raw_data = json.loads(request.body)
        source_id_raw = raw_data["source_id"]

        # 0. Make a request to the domains service to get the info on the source (this also authenticates the request)

        headers = {"Content-Type": "application/json"}

        # ------------------- VERIFYING ACCESS -----------------------
        checked, jwt = auth_checks.extract_token(originalRequest)
        if not checked:
            return JsonResponse(
                {"status": "FAILURE", "details": "JWT not found in header of request"}
            )
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        # ------------------------------------------------------------

        data = {"source_id": source_id_raw}
        response = requests.post(GET_SOURCE_ENDPOINT, json=data, headers=headers)

        if response.status_code != 200:
            return JsonResponse(
                {
                    "status": "FAILURE",
                    "details": "Could not connect to Domains Service",
                }
            )
        elif response.json()["status"] == "FAILURE":
            return JsonResponse(
                {"status": "FAILURE", "details": response.json()["details"]}
            )
        else:
            source_details = response.json()["source"]["params"]
            type = source_details["source_type"]
            params = source_details
            params["last_refresh_timestamp"] = response.json()["source"][
                "last_refresh_timestamp"
            ]

        # 1.
        source_type = type
        source_params = params

        data = {"source": source_type, "params": source_params}
        response = requests.post(SOURCE_CONNECTOR_ENDPOINT, json=data)

        if response.status_code != 200:
            return JsonResponse(
                {
                    "status": "FAILURE",
                    "details": "Could not connect to Source Connector",
                }
            )

        resp_data = response.json()
        status = resp_data["status"]
        new_data = resp_data["newdata"]
        latest_retrieval = resp_data["latest_retrieval"]

        if status == "FAILURE":
            return JsonResponse(
                {
                    "status": "FAILURE",
                    "details": "Could not connect to Source Connector",
                }
            )

        # 2.
        raw_new_data = []
        data_timestamps = []
        for x in new_data:
            raw_new_data.append(x["text"])
            data_timestamps.append(x["timestamp"])

        request_to_engine_body = {}
        if "room_id" in raw_data:
            request_to_engine_body = {
                "data": raw_new_data,
                "data_timestamps": data_timestamps,
                "room_id": raw_data["room_id"],
            }
        else:
            request_to_engine_body = {"data": raw_new_data}

        # print(request_to_engine_body)

        response_from_analyser = requests.post(
            ANALYSER_ENDPOINT, data=json.dumps(request_to_engine_body)
        )

        if response_from_analyser.status_code == 200:
            pass
        else:
            return JsonResponse(
                {
                    "status": "FAILURE",
                    "details": "Could not connect to Analyser",
                }
            )
        new_data_metrics = response_from_analyser.json()["metrics"]

        data_to_store = []
        for metrics, stamped in zip(new_data_metrics, new_data):
            metrics["timestamp"] = int(stamped["timestamp"])
            metrics["source_id"] = source_id_raw
            data_to_store.append(metrics)

        # 3.
        for x in data_to_store:
            sentiment_record_model.add_record(x)

        # 3.1 Make a request to the domains service to update the last refreshed field (also get authenticated here)

        headers = {"Content-Type": "application/json"}
        # ------------------- VERIFYING ACCESS -----------------------
        checked, jwt = auth_checks.extract_token(originalRequest)
        if not checked:
            return JsonResponse(
                {"status": "FAILURE", "details": "JWT not found in header of request"}
            )
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        # ------------------------------------------------------------

        data = {"source_id": source_id_raw, "new_last_refresh": latest_retrieval}
        response = requests.post(
            UPDATE_LAST_REFRESHED_ENDPOINT, json=data, headers=headers
        )

        if response.status_code != 200:
            return JsonResponse(
                {
                    "status": "FAILURE",
                    "details": "Could not connect to Domains Service",
                }
            )
        elif response.json()["status"] == "FAILURE":
            return JsonResponse(
                {
                    "status": "FAILURE",
                    "details": response.json()["details"],
                }
            )

        # 4.
        return JsonResponse(
            {"status": "SUCCESS", "details": "Data source refreshed successfully"}
        )

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


# @csrf_exempt
# def cleanup_sources(request: HttpRequest):
#     if request.method == "POST":
#         raw_data = json.loads(request.body)
#         source_ids_raw = raw_data["source_ids"]

#         source_ids_to_clean = list(source_ids_raw)

#         # ------------------- VERIFYING ACCESS -----------------------
#         check_passed, details = auth_checks.verify_user_owns_source_ids(
#             original_request=request, source_id_list=source_ids_to_clean
#         )
#         if not check_passed:
#             return JsonResponse({"status": "FAILURE", "details": details})
#         # ------------------------------------------------------------

#         sentiment_record_model.delete_data_by_soure_ids(source_ids_to_clean)
#         return JsonResponse(
#             {"status": "SUCCESS", "details": "Sentiment records removed successfully"}
#         )
#     else:
#         return JsonResponse({"status": "FAILURE", "details": "Invalid request"})
