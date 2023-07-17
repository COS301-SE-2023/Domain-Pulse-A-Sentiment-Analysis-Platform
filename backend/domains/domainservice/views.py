from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from authchecker import auth_checks
from utils import domainscrud

# Create your views here.


@csrf_exempt
def update_last_refresh(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        # check_passed, details = auth_checks.verify_user_owns_source_ids(
        #     original_request=request, source_id_list=[(raw_data["source_id"])]
        # )
        # if not check_passed:
        #     return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        if domainscrud.update_last_refresh(
            raw_data["source_id"], raw_data["new_last_refresh"]
        ):
            return JsonResponse(
                {"status": "SUCCESS", "details": "Timestamp updated successfully"}
            )
    return JsonResponse(
        {"status": "FAILURE", "details": "Error interacting with the database"}
    )


@csrf_exempt
def get_source(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        # check_passed, details = auth_checks.verify_user_owns_source_ids(
        #     original_request=request, source_id_list=[(raw_data["source_id"])]
        # )
        # if not check_passed:
        #     return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        return JsonResponse(
            {
                "status": "SUCCESS",
                "source": domainscrud.get_source(raw_data["source_id"]),
            }
        )
    return JsonResponse(
        {"status": "FAILURE", "details": "Error fetching source from DB"}
    )


@csrf_exempt
def create_domain(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        # check_passed, details = auth_checks.verify_user_owns_domain_ids(
        #     original_request=request, domain_id_list=[]
        # )
        # if not check_passed:
        #     return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        return JsonResponse(
            {
                "status": "SUCCESS",
                "new_domain": domainscrud.create_domain(
                    raw_data["name"], raw_data["icon"], raw_data["description"]
                ),
            }
        )
    return JsonResponse({"status": "FAILURE"})


@csrf_exempt
def delete_domain(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        # check_passed, details = auth_checks.verify_user_owns_domain_ids(
        #     original_request=request, domain_id_list=[(raw_data["id"])]
        # )
        # if not check_passed:
        #     return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

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
        # check_passed, details = auth_checks.verify_user_owns_domain_ids(
        #     original_request=request, domain_id_list=[(raw_data["id"])]
        # )
        # if not check_passed:
        #     return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        return JsonResponse(
            {"status": "SUCCESS", "domain": domainscrud.get_domain(raw_data["id"])}
        )
    return JsonResponse({"status": "FAILURE"})


@csrf_exempt
def add_source(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        # check_passed, details = auth_checks.verify_user_owns_domain_ids(
        #     original_request=request, domain_id_list=[(raw_data["id"])]
        # )
        # if not check_passed:
        #     return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------
        params = raw_data["params"]

        return JsonResponse(
            {
                "status": "SUCCESS",
                "domain": domainscrud.add_source(
                    raw_data["id"],
                    raw_data["source_name"],
                    raw_data["source_icon"],
                    params,  # includes the source type too
                ),
            }
        )
    return JsonResponse({"status": "FAILURE"})


@csrf_exempt
def remove_source(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        check_passed, details = auth_checks.verify_user_owns_source_ids(
            original_request=request, source_id_list=[(raw_data["source_id"])], action="remove_source"
        )
        if not check_passed:
            return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        return JsonResponse(
            {
                "status": "SUCCESS",
                "confirmation": domainscrud.remove_source(
                    raw_data["id"], raw_data["source_id"]
                ),
            }
        )
    return JsonResponse({"status": "FAILURE"})


@csrf_exempt
def create_param(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        # check_passed, details = auth_checks.verify_user_owns_source_ids(
        #     original_request=request, source_id_list=[(raw_data["source_id"])]
        # )
        # if not check_passed:
        #     return JsonResponse({"status": "FAILURE", "details": details})
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
    return JsonResponse({"status": "FAILURE"})


@csrf_exempt
def delete_param(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)

        # ------------------- VERIFYING ACCESS -----------------------
        # check_passed, details = auth_checks.verify_user_owns_source_ids(
        #     original_request=request, source_id_list=[(raw_data["source_id"])]
        # )
        # if not check_passed:
        #     return JsonResponse({"status": "FAILURE", "details": details})
        # ------------------------------------------------------------

        return JsonResponse(
            {
                "status": "SUCCESS",
                "confirmation": domainscrud.delete_param(
                    raw_data["id"], raw_data["source_id"], raw_data["key"]
                ),
            }
        )
    return JsonResponse({"status": "FAILURE"})
