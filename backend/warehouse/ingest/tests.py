from io import StringIO
import json
from django.test import TestCase
from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from django.test import TestCase, RequestFactory
from django.urls import reverse
from unittest.mock import patch, MagicMock, ANY
import os
import mock
from . import views
from datamanager import sentiment_record_model
from urllib.parse import urlencode
from django.core.files.uploadedfile import SimpleUploadedFile
from CSV import csv_connector

# Create your tests here.


def getAndIncrement(number):
    temp = number
    number += 1
    return temp


def mocked_add_record(dummy_record):
    return


def mocked_analyser_request(dummy1, **kwargs):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": "some data",
        "general": {},
        "ratios": {},
        "emotions": {},
        "toxicity": {},
        "status": "SUCCESS",
    }
    return mock_response


def mocked_down_analyser_request(dummy1, json=None, headers=None, data=None):
    ANALYSER_ENDPOINT = (
        f"http://localhost:{str(os.getenv('DJANGO_ENGINE_PORT'))}/analyser/compute/"
    )
    GET_SOURCE_ENDPOINT = (
        f"http://localhost:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/domains/get_source"
    )
    DOMAINS_ENDPOINT = f"http://localhost:{str(os.getenv('DJANGO_DOMAINS_PORT'))}/domains/verify_live_source"
    if dummy1 == ANALYSER_ENDPOINT:
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.json.return_value = {
            "data": "some data",
            "general": {},
            "ratios": {},
            "emotions": {},
            "toxicity": {},
            "status": "SUCCESS",
        }
        return mock_response
    elif dummy1 == GET_SOURCE_ENDPOINT:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "source_name": "some source name",
            "source_type": "some source type",
            "source_id": "some source id",
            "status": "SUCCESS",
        }
        return mock_response
    elif dummy1 == DOMAINS_ENDPOINT:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "SUCCESS",
        }
        return mock_response


def mocked_extract_token_true(dummy1):
    return (True, "some token")


def mocked_extract_token_false(dummy1):
    return (False, "some token")


def mocked_handle_request(dummy1):
    return {
        "status": "SUCCESS",
        "newdata": [{"text": "some text", "timestamp": 1234567890}],
        "latest_retrieval": "2021-01-01T00:00:00Z",
    }


def mocked_handle_request_fail(dummy1):
    return {"status": "FAILURE", "details": "Invalid CSV file provided"}


class LiveIngestionTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_is_post_only(self):
        response = self.client.get(path="/ingest/live_review/")
        self.assertEqual(200, response.status_code)
        self.assertContains(
            response,
            """<p class = "message" style="font-size: 1em;">Details: {{details}}</p>""".replace(
                "{{details}}", "Invalid request"
            ),
        )

    @mock.patch(
        "datamanager.sentiment_record_model.add_record", side_effect=mocked_add_record
    )
    @patch("requests.post")
    def test_positive_case(self, mocked_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "metrics": [
                {
                    "data": "some data",
                    "general": {},
                    "ratios": {},
                    "emotions": {},
                    "toxicity": {},
                }
            ],
            "status": "SUCCESS",
        }
        mocked_post.return_value = mock_response

        response: HttpResponse = self.client.post(
            path="/ingest/live_review/",
            data=urlencode(
                {
                    "review_text": "some data",
                    "source_id": "some source id",
                }
            ),
            content_type="application/x-www-form-urlencoded",
        )

        self.assertContains(
            response,
            """<p class = "message">Your review was submitted successfully!</p>""".replace(
                "{{review_text}}", "some data"
            ),
        )

    @patch("requests.post")
    def test_domains_service_down_case(self, mocked_post):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mocked_post.return_value = mock_response

        response: HttpResponse = self.client.post(
            path="/ingest/live_review/",
            data=urlencode(
                {
                    "review_text": "some data",
                    "source_id": "some source id",
                }
            ),
            content_type="application/x-www-form-urlencoded",
        )

        self.assertContains(
            response,
            """ <p class = "message" style="font-size: 1em;">Details: {{details}}</p>""".replace(
                "{{details}}", "Could not verify the source ID"
            ),
        )

    @mock.patch("requests.post", side_effect=mocked_down_analyser_request)
    def test_analyser_service_down_case(self, mocked_post):
        response: HttpResponse = self.client.post(
            path="/ingest/live_review/",
            data=urlencode(
                {
                    "review_text": "some data",
                    "source_id": "some source id",
                }
            ),
            content_type="application/x-www-form-urlencoded",
        )

        self.assertContains(
            response,
            """<body>
    <h1>There was an error submitting your review!</h1>
    <h2>Details: {{details}}</h2>
</body>""".replace(
                "{{details}}", "Error communicating with analyser"
            ),
        )

    @patch("requests.post")
    def test_domains_service_failed_case(self, mocked_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mocked_post.return_value = mock_response
        mock_response.json.return_value = {"status": "FAILURE", "details": "Some error"}

        response: HttpResponse = self.client.post(
            path="/ingest/live_review/",
            data=urlencode(
                {
                    "review_text": "some data",
                    "source_id": "some source id",
                }
            ),
            content_type="application/x-www-form-urlencoded",
        )

        self.assertContains(
            response,
            """<p class = "message" style="font-size: 1em;">Details: {{details}}</p>""".replace(
                "{{details}}", "Some error"
            ),
        )

    def test_form_endpoint(self):
        response = self.client.get(
            path="/ingest/post-review/abcde12345/somesourcename/"
        )
        self.assertEqual(200, response.status_code)
        self.assertContains(
            response,
            """<div class="title">
          <p>What do you think about</p>
          <p class="domain-name">{{source_name}}?</p>
        </div>
        <form
          class="form flex-column center"
          method="post"
          ,
          action="/ingest/live_review/"
        >
          <textarea
            name="review_text"
            id="review_text"
            class="textbox"
            placeholder="Write your review here..."
          ></textarea>
          <input type="hidden" name="source_id" value="{{source_id}}" />
          <button type="submit" value="Submit" class="button center clickable-item">
            submit
            <div class="button-spinner"></div>
          </button>
        </form>""".replace(
                "{{source_name}}", "somesourcename"
            ).replace(
                "{{source_id}}", "abcde12345"
            ),
        )

    @mock.patch(
        "authchecker.auth_checks.extract_token", side_effect=mocked_extract_token_true
    )
    @mock.patch("CSV.csv_connector.handle_request", side_effect=mocked_handle_request)
    @mock.patch(
        "datamanager.sentiment_record_model.add_record", side_effect=mocked_add_record
    )
    @patch("requests.post")
    def test_valid_csv_ingestion(self, mock_post):
        # Mock the necessary external API calls
        # Mock the response from the Domains Service
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "metrics": [
                {
                    "data": "some data",
                    "general": {},
                    "ratios": {},
                    "emotions": {},
                    "toxicity": {},
                }
            ],
            "status": "SUCCESS",
        }
        mock_post.return_value = mock_response

        # Create a mock CSV file
        csv_data = "header1,header2\nvalue1,value2\n"
        csv_file = SimpleUploadedFile("test.csv", csv_data.encode("utf-8"))

        # Create a mock HTTP POST request
        request = HttpRequest()
        request.method = "POST"
        request.FILES["file"] = csv_file
        request.POST["source_id"] = "1"

        # Call the view function
        response = views.ingest_CSV_file(request)

        # Assert that the response is as expected
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            json.loads(response.content),
            {"status": "SUCCESS", "details": "Data source refreshed successfully"},
        )

    @mock.patch(
        "authchecker.auth_checks.extract_token", side_effect=mocked_extract_token_true
    )
    @mock.patch("CSV.csv_connector.handle_request", side_effect=mocked_handle_request)
    @mock.patch(
        "datamanager.sentiment_record_model.add_record", side_effect=mocked_add_record
    )
    @patch("requests.post")
    def test_invalid_file_type_csv_ingestion(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "metrics": [
                {
                    "data": "some data",
                    "general": {},
                    "ratios": {},
                    "emotions": {},
                    "toxicity": {},
                }
            ],
            "status": "SUCCESS",
        }
        mock_post.return_value = mock_response

        csv_data = "header1,header2\nvalue1,value2\n"
        csv_file = SimpleUploadedFile("test.txt", csv_data.encode("utf-8"))

        request = HttpRequest()
        request.method = "POST"
        request.FILES["file"] = csv_file
        request.POST["source_id"] = "1"

        response = views.ingest_CSV_file(request)

        self.assertEqual(
            json.loads(response.content),
            {"status": "FAILURE", "details": "File must be a CSV"},
        )

    @mock.patch(
        "authchecker.auth_checks.extract_token", side_effect=mocked_extract_token_true
    )
    @mock.patch("CSV.csv_connector.handle_request", side_effect=mocked_handle_request)
    @mock.patch(
        "datamanager.sentiment_record_model.add_record", side_effect=mocked_add_record
    )
    @patch("requests.post")
    def test_failed_domains_request_csv_ingestion(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.json.return_value = {
            "metrics": [
                {
                    "data": "some data",
                    "general": {},
                    "ratios": {},
                    "emotions": {},
                    "toxicity": {},
                }
            ],
            "status": "SUCCESS",
        }
        mock_post.return_value = mock_response

        csv_data = "header1,header2\nvalue1,value2\n"
        csv_file = SimpleUploadedFile("test.txt", csv_data.encode("utf-8"))

        request = HttpRequest()
        request.method = "POST"
        request.FILES["file"] = csv_file
        request.POST["source_id"] = "1"

        response = views.ingest_CSV_file(request)

        self.assertEqual(
            json.loads(response.content),
            {"status": "FAILURE", "details": "Could not connect to Domains Service"},
        )

    @mock.patch(
        "authchecker.auth_checks.extract_token", side_effect=mocked_extract_token_true
    )
    @mock.patch("CSV.csv_connector.handle_request", side_effect=mocked_handle_request)
    @mock.patch(
        "datamanager.sentiment_record_model.add_record", side_effect=mocked_add_record
    )
    @patch("requests.post")
    def test_incorrect_domains_request_csv_ingestion(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "metrics": [
                {
                    "data": "some data",
                    "general": {},
                    "ratios": {},
                    "emotions": {},
                    "toxicity": {},
                }
            ],
            "details": "Some error",
            "status": "FAILURE",
        }
        mock_post.return_value = mock_response

        csv_data = "header1,header2\nvalue1,value2\n"
        csv_file = SimpleUploadedFile("test.txt", csv_data.encode("utf-8"))

        request = HttpRequest()
        request.method = "POST"
        request.FILES["file"] = csv_file
        request.POST["source_id"] = "1"

        response = views.ingest_CSV_file(request)

        self.assertEqual(
            json.loads(response.content)["status"],
            "FAILURE",
        )

    @mock.patch(
        "authchecker.auth_checks.extract_token", side_effect=mocked_extract_token_true
    )
    @mock.patch("CSV.csv_connector.handle_request", side_effect=mocked_handle_request)
    @mock.patch(
        "datamanager.sentiment_record_model.add_record", side_effect=mocked_add_record
    )
    @patch("requests.post")
    def test_csv_ingestion_get_request(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "metrics": [
                {
                    "data": "some data",
                    "general": {},
                    "ratios": {},
                    "emotions": {},
                    "toxicity": {},
                }
            ],
            "status": "SUCCESS",
        }
        mock_post.return_value = mock_response

        csv_data = "header1,header2\nvalue1,value2\n"
        csv_file = SimpleUploadedFile("test.txt", csv_data.encode("utf-8"))

        request = HttpRequest()
        request.method = "GET"
        request.FILES["file"] = csv_file

        response = views.ingest_CSV_file(request)

        self.assertEqual(
            json.loads(response.content),
            {"status": "FAILURE", "details": "Invalid request"},
        )

    @mock.patch(
        "authchecker.auth_checks.extract_token", side_effect=mocked_extract_token_true
    )
    @mock.patch("CSV.csv_connector.handle_request", side_effect=mocked_handle_request)
    @mock.patch(
        "datamanager.sentiment_record_model.add_record", side_effect=mocked_add_record
    )
    @mock.patch("requests.post", side_effect=mocked_down_analyser_request)
    def test_down_analyzer_csv_ingestion(
        self, mock_extract_token, mock_handle_request, mock_add_record, mock_post
    ):
        csv_data = "header1,header2\nvalue1,value2\n"
        csv_file = SimpleUploadedFile("test.csv", csv_data.encode("utf-8"))

        request = HttpRequest()
        request.method = "POST"
        request.FILES["file"] = csv_file
        request.POST["source_id"] = "1"

        response = views.ingest_CSV_file(request)

        self.assertEqual(
            json.loads(response.content),
            {"status": "FAILURE", "details": "Could not connect to Analyser"},
        )

    def test_valid_csv(self):
        valid_csv_data = (
            "reviews,time\nReview 1,2023-09-05T12:00:00Z\nReview 2,2023-09-05T13:00:00Z"
        )
        file = SimpleUploadedFile("test.csv", valid_csv_data.encode("utf-8"))
        result = csv_connector.handle_request(file)

        self.assertEqual(result["status"], "SUCCESS")
        self.assertTrue("latest_retrieval" in result)

    def test_invalid_csv(self):
        valid_csv_data = "wrong,wrongagain\nReview 1,2023-09-05T12:00:00Z\nReview 2,2023-09-05T13:00:00Z"
        file = SimpleUploadedFile("test.csv", valid_csv_data.encode("utf-8"))
        result = csv_connector.handle_request(file)

        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "Invalid CSV file provided")

    def test_empty_csv(self):
        valid_csv_data = ""
        file = SimpleUploadedFile("test.csv", valid_csv_data.encode("utf-8"))
        result = csv_connector.handle_request(file)

        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "Invalid CSV file provided")
