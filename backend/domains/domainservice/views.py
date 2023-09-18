from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from authchecker import auth_checks
from utils import domainscrud
from sourcevalidator import validator
import os
import requests

# Create your views here.


@csrf_exempt
def verify_live_source(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)
        source_id = raw_data["source_id"]

        source = domainscrud.get_source(source_id)

        if source != {}:
            params = source["params"]
            source_type = str(params["source_type"])

            if source_type == "livereview":
                if bool(params["is_active"]):
                    return JsonResponse(
                        {"status": "SUCCESS", "details": "Valid live and active source"}
                    )
                else:
                    return JsonResponse(
                        {"status": "FAILURE", "details": "Source is not active"}
                    )
            else:
                return JsonResponse(
                    {"status": "FAILURE", "details": "Not a valid live source"}
                )
        else:
            return JsonResponse({"status": "FAILURE", "details": "Not a valid source"})

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def update_last_refresh(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request, source_id_list=[(raw_data["source_id"])]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        if domainscrud.update_last_refresh(
            raw_data["source_id"], raw_data["new_last_refresh"]
        ):
            return JsonResponse(
                {"status": "SUCCESS", "details": "Timestamp updated successfully"}
            )
    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def get_source(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request, source_id_list=[(raw_data["source_id"])]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        return JsonResponse(
            {
                "status": "SUCCESS",
                "source": domainscrud.get_source(raw_data["source_id"]),
            }
        )
    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def create_domain(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_domain_ids(
            original_request=request, domain_id_list=[]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------
        new_domain = domainscrud.create_domain(
            raw_data["name"], raw_data["icon"], raw_data["description"]
        )
        domainID = new_domain["id"]
        auth_checks.create_domain_in_profile(request, domainID)
        return JsonResponse(
            {
                "status": "SUCCESS",
                "new_domain": new_domain,
            }
        )

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def edit_domain(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_domain_ids(
            original_request=request, domain_id_list=[raw_data["id"]]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------
        domain = domainscrud.edit_domain(
            raw_data["id"], raw_data["name"], raw_data["icon"], raw_data["description"]
        )
        return JsonResponse(
            {
                "status": "SUCCESS",
                "domain": domain,
            }
        )

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def edit_source(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request, source_id_list=[raw_data["source_id"]]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------
        domain = domainscrud.edit_source(raw_data["source_id"], raw_data["name"])
        return JsonResponse(
            {
                "status": "SUCCESS",
                "domain": domain,
            }
        )

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def toggle_active(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request, source_id_list=[raw_data["source_id"]]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------
        domain = domainscrud.set_source_active(
            raw_data["source_id"], raw_data["is_active"]
        )
        return JsonResponse(
            {
                "status": "SUCCESS",
                "domain": domain,
            }
        )

    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def delete_domain(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_domain_ids(
            original_request=request,
            domain_id_list=[(raw_data["id"])],
            action="remove_domain",
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        # # Get the source_ids to be deleted
        # source_ids_to_clean = []
        # this_domain = domainscrud.get_domain(raw_data["id"])
        # for source in this_domain["sources"]:
        #     source_ids_to_clean.append(source["source_id"])

        # # Make request to cleanup warehouse
        # CLEANUP_ENDPOINT = f"http://localhost:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/query/cleanup_sources/"
        # checked, jwt = auth_checks.extract_token(request)
        # headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        # cleanup_response = requests.post(
        #     CLEANUP_ENDPOINT, json={"source_ids": source_ids_to_clean}, headers=headers
        # )

        # cleanup_response = cleanup_response.json()
        # if cleanup_response["status"] != "SUCCESS":
        #     return JsonResponse(
        #         {
        #             "status": "FAILURE",
        #             "details": "Failure occured when performing cleanup",
        #         }
        #     )

        return JsonResponse(
            {
                "status": "SUCCESS",
                "confirmation": domainscrud.delete_domain(raw_data["id"]),
            }
        )

    return JsonResponse({"status": "FAILURE"})


@csrf_exempt
def get_domain(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_domain_ids(
            original_request=request, domain_id_list=[(raw_data["id"])]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        return JsonResponse(
            {"status": "SUCCESS", "domain": domainscrud.get_domain(raw_data["id"])}
        )
    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def add_source(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_domain_ids(
            original_request=request, domain_id_list=[(raw_data["id"])]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------
        params = raw_data["params"]

        # ------------ VALIDATION OF SOURCES ----------------
        is_valid, details = validator.handler(params)
        if not is_valid:
            return JsonResponse({"status": "FAILURE", "details": details})
        # --------------------------------------------------

        domain = domainscrud.add_source(
            raw_data["id"],
            raw_data["source_name"],
            raw_data["source_icon"],
            params,
        )
        auth_checks.add_source_in_profile(
            request, raw_data["id"], domain["new_source_id"]
        )
        return JsonResponse(
            {
                "status": "SUCCESS",
                "domain": domain,
            }
        )
    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def remove_source(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request,
            source_id_list=[(raw_data["source_id"])],
            action="remove_source",
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        # # Get the source_ids to be deleted
        # source_ids_to_clean = [raw_data["source_id"]]

        # # Make request to cleanup warehouse
        # CLEANUP_ENDPOINT = f"http://localhost:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/query/cleanup_sources/"
        # checked, jwt = auth_checks.extract_token(request)
        # headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        # cleanup_response = requests.post(
        #     CLEANUP_ENDPOINT, json={"source_ids": source_ids_to_clean}, headers=headers
        # )

        # cleanup_response = cleanup_response.json()
        # if cleanup_response["status"] != "SUCCESS":
        #     return JsonResponse(
        #         {
        #             "status": "FAILURE",
        #             "details": "Failure occured when performing cleanup",
        #         }
        #     )

        return JsonResponse(
            {
                "status": "SUCCESS",
                "confirmation": domainscrud.remove_source(
                    raw_data["id"], raw_data["source_id"]
                ),
            }
        )
    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def create_param(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request, source_id_list=[(raw_data["source_id"])]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        return JsonResponse(
            {
                "status": "SUCCESS",
                "confirmation": domainscrud.create_param(
                    raw_data["id"],
                    raw_data["source_id"],
                    raw_data["key"],
                    raw_data["value"],
                ),
            }
        )
    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def delete_param(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request, source_id_list=[(raw_data["source_id"])]
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        return JsonResponse(
            {
                "status": "SUCCESS",
                "confirmation": domainscrud.delete_param(
                    raw_data["id"], raw_data["source_id"], raw_data["key"]
                ),
            }
        )
    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})


@csrf_exempt
def delete_domains_internal(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)
        if raw_data["local_key"] == os.getenv("LOCAL_KEY"):
            domainscrud.delete_domains_internal(raw_data["domain_ids"])
            return JsonResponse(
                {"status": "SUCCESS", "details": "Domains deleted successfully"}
            )
        else:
            return JsonResponse({"status": "FAILURE", "details": "Foreign Request"})
    return JsonResponse({"status": "FAILURE", "details": "Invalid request"})
