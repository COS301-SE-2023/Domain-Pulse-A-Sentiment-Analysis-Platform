from django.test import TestCase
from django.http import JsonResponse, HttpRequest
from django.test import TestCase, RequestFactory
from django.urls import reverse
from unittest.mock import patch, MagicMock, ANY, Mock
from authchecker import auth_checks
import json
import os
import mock
import requests
from . import views
from datamanager import sentiment_record_model, refresh_queue

# Create your tests here.


class QueryEngineTests(TestCase):
    # -------------------------- UNIT TESTS --------------------------

    def test_apm_enabled(self):
        from warehouse import settings

        settings.append_installed_apps("True")
        self.assertIn("elasticapm.contrib.django", settings.INSTALLED_APPS)

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
        self, mocked_response, mock_get_records, mock_verify_user
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
            "timeseries": {},
        }
        mocked_response.return_value = mock_response

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
        mocked_response.assert_called_once_with(
            f"http://{os.getenv('ENGINE_HOST')}:{str(os.getenv('DJANGO_ENGINE_PORT'))}/aggregator/aggregate/",
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

    def test_invalid_request_method_get_domain_dashboard(self):
        url = "/query/get_domain_dashboard/"
        response = self.client.get(path=url)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Invalid request")

    @patch("authchecker.auth_checks.verify_user_owns_source_ids")
    @patch("datamanager.sentiment_record_model.get_records_by_source_id")
    @patch("requests.post")
    def test_valid_request_get_domain_dashboard(
        self, mocked_response, mock_get_records, mock_verify_user
    ):
        url = "/query/get_domain_dashboard/"
        source_ids = ["hbfhwbgufbo724n2n7", "hbfhwbgufbo724n2n7"]
        request_body = {"source_ids": source_ids}

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
            "timeseries": {},
        }
        mocked_response.return_value = mock_response

        response = self.client.post(
            path=url, data=json.dumps(request_body), content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "SUCCESS")
        self.assertEqual(data["aggregated_metrics"], {})
        self.assertEqual(data["meta_data"], {})
        self.assertEqual(data["individual_metrics"], {})

    @patch("authchecker.auth_checks.verify_user_owns_source_ids")
    def test_unauthorized_request_get_domain_dashboard(self, mock_verify_user):
        url = "/query/get_domain_dashboard/"
        source_ids = ["hbfhwbgufbo724n2n7", "hbfhwbgufbo724n2n7"]
        request_body = {"source_ids": source_ids}
        mock_verify_user.return_value = False, "Unauthorized error"

        response = self.client.post(
            path=url, data=json.dumps(request_body), content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Unauthorized error")

    def test_extract_token(self):
        # Valid case
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        result, token = auth_checks.extract_token(request)
        self.assertTrue(result)
        self.assertEqual(token, "valid_token")

        # Missing header
        request = HttpRequest()
        result, error_msg = auth_checks.extract_token(request)
        self.assertFalse(result)
        self.assertEqual(error_msg, "Authorization header missing")

        # Test invalid token
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "InvalidToken"
        result, error_msg = auth_checks.extract_token(request)
        self.assertFalse(result)
        self.assertEqual(error_msg, "Invalid token format")

        # Test invalid type of header
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "Basic invalid_token"
        result, error_msg = auth_checks.extract_token(request)
        self.assertFalse(result)
        self.assertEqual(error_msg, "Authorization header - Missing Bearer")

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------
    def test_endpoints_are_post_only(self):
        response1: JsonResponse = self.client.get(path="/query/get_source_dashboard/")
        response2: JsonResponse = self.client.get(path="/query/get_domain_dashboard/")
        response3: JsonResponse = self.client.get(path="/query/refresh_source/")
        response4: JsonResponse = self.client.get(path="/query/try_refresh/")

        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(response3.status_code, 200)
        self.assertEqual(response4.status_code, 200)

        expected_data = {"status": "FAILURE", "details": "Invalid request"}

        self.assertEqual(response1.json(), expected_data)
        self.assertEqual(response2.json(), expected_data)
        self.assertEqual(response3.json(), expected_data)
        self.assertEqual(response4.json(), expected_data)

    @patch("requests.post")
    @patch("datamanager.sentiment_record_model.add_record")
    def test_successful_refresh(self, mocked_response_2, mocked_response):
        mocked_response.return_value.status_code = 200
        mocked_response.return_value.json.return_value = {
            "status": "SUCCESS",
            "newdata": [
                {"text": "test item 1", "timestamp": 123456789},
                {"text": "test item 2", "timestamp": 123456789},
            ],
            "latest_retrieval": 123456789,
            "metrics": [{"test": 1}, {"test": 2}],
            "source": {
                "params": {
                    "source_type": "youtube",
                },
                "last_refresh_timestamp": 123456789,
            },
        }
        data = {"source_id": "djwbhbwg28732b72b3n"}
        headers = {
            "Authorization": f"Bearer {'some_test_jwt'}",
            "Content-Type": "application/json",
        }
        request = self.factory.post(
            "/refresh_source/",
            json.dumps(data),
            content_type="application/json",
            headers=headers,
        )
        response: JsonResponse = views.refresh_source(request)
        response_data = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response_data,
            {"status": "SUCCESS", "details": "Data source refreshed successfully"},
        )

    @patch("requests.post")
    def test_failed_domains_requests_on_refresh(self, mocked_response):
        mocked_response.return_value.status_code = 500
        data = {"source_id": "djwbhbwg28732b72b3n"}
        headers = {
            "Authorization": f"Bearer {'some_test_jwt'}",
            "Content-Type": "application/json",
        }
        request = self.factory.post(
            "/refresh_source/",
            json.dumps(data),
            content_type="application/json",
            headers=headers,
        )
        response = views.refresh_source(request)
        response_data = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response_data,
            {"status": "FAILURE", "details": "Could not connect to Domains Service"},
        )

    def test_invalid_request_on_refresh(self):
        request = self.factory.get("/refresh_source/")
        response = views.refresh_source(request)
        response_data = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response_data, {"status": "FAILURE", "details": "Invalid request"}
        )

    @patch("requests.post")
    def test_auth_checker(self, mocked_response):
        # FOR DOMAIN IDs

        # Successful case
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "SUCCESS",
            "details": "Successful case",
        }
        mocked_response.return_value = mock_response
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        domain_ids = ["1", "2", "3"]
        status, details = auth_checks.verify_user_owns_domain_ids(request, domain_ids)

        self.assertEqual(status, True)
        self.assertEqual(details, "User is authorized")

        # Unsuccessful case (auth failed)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "FAILURE",
            "details": "Some authentication failure",
        }
        mocked_response.return_value = mock_response
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        domain_ids = ["1", "2", "3"]
        status, details = auth_checks.verify_user_owns_domain_ids(request, domain_ids)

        self.assertEqual(status, False)
        self.assertEqual(details, "Some authentication failure")

        # Unsuccessful case (token extraction issue)
        request = HttpRequest()
        domain_ids = ["1", "2", "3"]
        status, details = auth_checks.verify_user_owns_domain_ids(request, domain_ids)
        self.assertEqual(status, False)
        self.assertEqual(details, "Authorization header missing")

        # FOR SOURCE IDs

        # Successful case
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "SUCCESS",
            "details": "Successful case",
        }
        mocked_response.return_value = mock_response
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        source_ids = ["1", "2", "3"]
        status, details = auth_checks.verify_user_owns_source_ids(request, source_ids)

        self.assertEqual(status, True)
        self.assertEqual(details, "User is authorized")

        # Unsuccessful case (auth failed)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "FAILURE",
            "details": "Some authentication failure",
        }
        mocked_response.return_value = mock_response
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        source_ids = ["1", "2", "3"]
        status, details = auth_checks.verify_user_owns_source_ids(request, source_ids)

        self.assertEqual(status, False)
        self.assertEqual(details, "Some authentication failure")

        # Unsuccessful case (token extraction issue)
        request = HttpRequest()
        source_ids = ["1", "2", "3"]
        status, details = auth_checks.verify_user_owns_source_ids(request, source_ids)
        self.assertEqual(status, False)
        self.assertEqual(details, "Authorization header missing")

    # @patch("pymongo.MongoClient")
    # def test_add_record_sentiment_model(self, mock_mongo_client):
    #     mocked_collection = mock_mongo_client.return_value["domain_pulse_warehouse"][
    #         "sentiment_records"
    #     ]
    #     mocked_insert_one = mocked_collection.insert_one

    #     dummy_record = {"text": "this is some review", "timestamp": 123456789}
    #     sentiment_record_model.add_record(dummy_record)
    #     mock_mongo_client.assert_called_once_with("domainpulse.app", ANY)
    #     mocked_insert_one.assert_called_once_with(dummy_record)
    #     mock_mongo_client.return_value.close.assert_called_once()

    # @patch("pymongo.MongoClient")
    # def test_get_records_sentiment_model(self, mock_mongo_client):
    #     mocked_collection = mock_mongo_client.return_value["domain_pulse_warehouse"][
    #         "sentiment_records"
    #     ]
    #     mocked_find = mocked_collection.find

    #     dummy_source_id = "bbfbekjfbkAFKAKHEBFL"
    #     sentiment_record_model.get_records_by_source_id(dummy_source_id)
    #     mock_mongo_client.assert_called_once_with("domainpulse.app", ANY)
    #     mocked_find.assert_called_once_with({"source_id": dummy_source_id})
    #     mock_mongo_client.return_value.close.assert_called_once()

    def test_foreign_request_method_get_report_data_internal(self):
        local_key = "123"
        url = "/query/get_report_data_internal/"
        response = self.client.post(
            path=url,
            data=json.dumps({"local_key": local_key}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Foreign Request")

    def test_invalid_request_method_get_report_data_internal(self):
        local_key = os.getenv("LOCAL_KEY")
        url = "/query/get_report_data_internal/"
        response = self.client.get(path=url)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Invalid request")

    @patch("authchecker.auth_checks.verify_user_owns_source_ids")
    @patch("datamanager.sentiment_record_model.get_records_by_source_id")
    @patch("requests.post")
    def test_valid_request_get_report_data_internal(
        self, mocked_response, mock_get_records, mock_verify_user
    ):
        url = "/query/get_report_data_internal/"
        source_ids = ["hbfhwbgufbo724n2n7", "hbfhwbgufbo724n2n7"]
        request_body = {"local_key": os.getenv("LOCAL_KEY"), "source_ids": source_ids}

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
            "timeseries": {},
        }
        mocked_response.return_value = mock_response

        response = self.client.post(
            path=url, data=json.dumps(request_body), content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "SUCCESS")
        self.assertEqual(data["domain"]["aggregated_metrics"], {})
        self.assertEqual(data["domain"]["meta_data"], {})
        self.assertEqual(data["domain"]["individual_metrics"], {})

    @patch("datamanager.refresh_queue.process_batch")
    @patch("datamanager.sentiment_record_model.add_record")
    @patch("requests.post")
    def test_try_refresh_success(self, mock_post, mock_add_record, mock_process_batch):
        mock_process_batch.return_value = (
            True,
            [
                {"timestamp": 12345, "text": "Sample text"},
                {"timestamp": 12345, "text": "Sample text"},
                {"timestamp": 12345, "text": "Sample text"},
                {"timestamp": 12345, "text": "Sample text"},
                {"timestamp": 12345, "text": "Sample text"},
            ],
        )

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "metrics": [
                {"some_metric": 42},
                {"some_metric": 42},
                {"some_metric": 42},
                {"some_metric": 42},
                {"some_metric": 42},
            ]
        }
        mock_post.return_value = mock_response

        url = "/query/try_refresh/"
        source_id = "hbfhwbgufbo724n2n7"
        request_body = {"source_id": source_id}

        response = self.client.post(
            path=url, data=json.dumps(request_body), content_type="application/json"
        )

        expected_response = JsonResponse({"status": "SUCCESS", "is_done": False})
        self.assertEqual(response.content, expected_response.content)
        self.assertEqual(response.status_code, 200)

    @patch("datamanager.refresh_queue.process_batch")
    @patch("datamanager.sentiment_record_model.add_record")
    @patch("requests.post")
    def test_try_refresh_no_source(
        self, mock_post, mock_add_record, mock_process_batch
    ):
        mock_process_batch.return_value = (
            False,
            "no source",
        )

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"metrics": [{"some_metric": 42}]}
        mock_post.return_value = mock_response

        url = "/query/try_refresh/"
        source_id = "hbfhwbgufbo724n2n7"
        request_body = {"source_id": source_id}

        response = self.client.post(
            path=url, data=json.dumps(request_body), content_type="application/json"
        )

        expected_response = JsonResponse(
            {
                "status": "FAILURE",
                "details": "No source with that ID is pending processing",
            }
        )
        self.assertEqual(response.content, expected_response.content)
        self.assertEqual(response.status_code, 200)

    @patch("datamanager.refresh_queue.process_batch")
    @patch("datamanager.sentiment_record_model.add_record")
    @patch("requests.post")
    def test_try_refresh_source_done(
        self, mock_post, mock_add_record, mock_process_batch
    ):
        mock_process_batch.return_value = (
            False,
            "source done",
        )

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"metrics": [{"some_metric": 42}]}
        mock_post.return_value = mock_response

        url = "/query/try_refresh/"
        source_id = "hbfhwbgufbo724n2n7"
        request_body = {"source_id": source_id}

        response = self.client.post(
            path=url, data=json.dumps(request_body), content_type="application/json"
        )

        expected_response = JsonResponse({"status": "SUCCESS", "is_done": True})
        self.assertEqual(response.content, expected_response.content)
        self.assertEqual(response.status_code, 200)

    @patch("datamanager.refresh_queue.process_batch")
    @patch("datamanager.sentiment_record_model.add_record")
    @patch("requests.post")
    def test_try_refresh_analyser_failure(
        self, mock_post, mock_add_record, mock_process_batch
    ):
        mock_process_batch.return_value = (
            True,
            [{"text": "hi there", "timestamp": 12345}],
        )

        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.json.return_value = {"metrics": [{"some_metric": 42}]}
        mock_post.return_value = mock_response

        url = "/query/try_refresh/"
        source_id = "hbfhwbgufbo724n2n7"
        request_body = {"source_id": source_id}

        response = self.client.post(
            path=url, data=json.dumps(request_body), content_type="application/json"
        )

        expected_response = JsonResponse(
            {
                "status": "FAILURE",
                "details": "Could not connect to Analyser",
            }
        )
        self.assertEqual(response.content, expected_response.content)
        self.assertEqual(response.status_code, 200)

    @patch("datamanager.refresh_queue.db")
    def test_batch_process_empty_queue(self, mock_db):
        mock_collection = mock_db["refresh_queue"]
        mock_collection.find_one.return_value = {"queue": []}

        source_id = "anfhbehbfksebf"

        result = refresh_queue.process_batch(source_id)

        self.assertFalse(result[0])
        self.assertEqual(result[1], ["source done"])

        mock_collection.find_one.assert_called_once_with({"source_id": source_id})
        mock_collection.update_one.assert_not_called()

    @patch("datamanager.refresh_queue.db")
    def test_batch_process_no_queue(self, mock_db):
        mock_collection = mock_db["refresh_queue"]
        mock_collection.find_one.return_value = None

        source_id = "anfhbehbfksebf"

        result = refresh_queue.process_batch(source_id)

        self.assertFalse(result[0])
        self.assertEqual(result[1], ["no source"])

        mock_collection.find_one.assert_called_once_with({"source_id": source_id})
        mock_collection.update_one.assert_not_called()

    @patch("datamanager.refresh_queue.db")
    def test_batch_process_sucess_five(self, mock_db):
        mock_collection = mock_db["refresh_queue"]
        mock_collection.find_one.return_value = {
            "queue": ["1", "2", "3", "4", "5", "6"]
        }

        source_id = "anfhbehbfksebf"

        result = refresh_queue.process_batch(source_id)

        self.assertTrue(result[0])
        self.assertEqual(result[1], ["1", "2", "3", "4", "5"])
        query = {"source_id": source_id}
        mock_collection.find_one.assert_called_once_with({"source_id": source_id})
        mock_collection.update_one.assert_called_once_with(
            query, {"$set": {"queue": ["6"]}}
        )

    @patch("datamanager.refresh_queue.db")
    def test_batch_process_sucess_less_than_five(self, mock_db):
        mock_collection = mock_db["refresh_queue"]
        mock_collection.find_one.return_value = {"queue": ["1", "2", "3", "4"]}

        source_id = "anfhbehbfksebf"

        result = refresh_queue.process_batch(source_id)

        self.assertTrue(result[0])
        self.assertEqual(result[1], ["1", "2", "3", "4"])
        query = {"source_id": source_id}
        mock_collection.find_one.assert_called_once_with({"source_id": source_id})
        mock_collection.update_one.assert_called_once_with(
            query, {"$set": {"queue": []}}
        )

    # ----------------------------------------------------------------
