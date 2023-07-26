from django.test import TestCase
from django.http import JsonResponse, HttpRequest
from django.test import TestCase, RequestFactory
from django.urls import reverse
from unittest.mock import patch, MagicMock
import json
import os
import mock
import requests

# Create your tests here.


class QueryEngineTests(TestCase):
    # -------------------------- UNIT TESTS --------------------------

    def setUp(self):
        self.factory = RequestFactory()

    def test_invalid_request_method_get_source_dashboard(self):
        url = "/query/get_source_dashboard/"
        response = self.client.get(path=url)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Invalid request")

    @patch("authchecker.auth_checks.verify_user_owns_source_ids")
    @patch("datamanager.sentiment_record_model.get_records_by_source_id")
    @patch("requests.post")
    def test_valid_request_get_source_dashboard(
        self, mock_post, mock_get_records, mock_verify_user
    ):
        url = "/query/get_source_dashboard/"
        source_id = "hbfhwbgufbo724n2n7"
        request_body = {"source_id": source_id}

        mock_verify_user.return_value = True, ""

        mock_records = [
            {},
            {},
        ]
        mock_get_records.return_value = mock_records

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "overall": {},
            "metadata": {},
            "individual_data": {},
        }
        mock_post.return_value = mock_response

        response = self.client.post(
            path=url, data=json.dumps(request_body), content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "SUCCESS")
        self.assertEqual(data["aggregated_metrics"], {})
        self.assertEqual(data["meta_data"], {})
        self.assertEqual(data["individual_metrics"], {})

        mock_verify_user.assert_called_once_with(
            original_request=mock.ANY, source_id_list=[source_id]
        )
        mock_get_records.assert_called_once_with(source_id)
        mock_post.assert_called_once_with(
            f"http://localhost:{str(os.getenv('DJANGO_ENGINE_PORT'))}/aggregator/aggregate/",
            data=json.dumps({"metrics": mock_records}),
        )

    @patch("authchecker.auth_checks.verify_user_owns_source_ids")
    def test_unauthorized_request_get_source_dashboard(self, mock_verify_user):
        url = "/query/get_source_dashboard/"
        source_id = "hbfhwbgufbo724n2n7"
        request_body = {"source_id": source_id}
        mock_verify_user.return_value = False, "Unauthorized error"

        response = self.client.post(
            path=url, data=json.dumps(request_body), content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Unauthorized error")

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------
    def test_endpoints_are_post_only(self):
        response1: JsonResponse = self.client.get(path="/query/get_source_dashboard/")
        response2: JsonResponse = self.client.get(path="/query/get_domain_dashboard/")
        response3: JsonResponse = self.client.get(path="/query/refresh_source/")

        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(response3.status_code, 200)

        expected_data = {"status": "FAILURE", "details": "Invalid request"}

        self.assertEqual(response1.json(), expected_data)
        self.assertEqual(response2.json(), expected_data)
        self.assertEqual(response3.json(), expected_data)

    # ----------------------------------------------------------------
