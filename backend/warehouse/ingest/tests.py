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

# Create your tests here.


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


def mocked_extract_token(dummy1):
    return (True, "some token")


def mocked_handle_request(dummy1):
    return {
        "status": "SUCCESS",
        "newdata": [{"text": "some text", "timestamp": 1234567890}],
        "latest_retrieval": "2021-01-01T00:00:00Z",
    }


class LiveIngestionTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_is_post_only(self):
        response = self.client.get(path="/ingest/live_review/")
        self.assertEqual(200, response.status_code)
        self.assertContains(
            response,
            """<body>
    <h1>There was an error submitting your review!</h1>
    <h2>Details: {{details}}</h2>
</body>""".replace(
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
            """<body>
    <p>You successfully submitted the review: {{review_text}}</p>
</body>""".replace(
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
            """<body>
    <h1>There was an error submitting your review!</h1>
    <h2>Details: {{details}}</h2>
</body>""".replace(
                "{{details}}", "Could not verify the source ID"
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
            """<body>
    <h1>There was an error submitting your review!</h1>
    <h2>Details: {{details}}</h2>
</body>""".replace(
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
            """<form method="post", action="/ingest/live_review/">
        <label for="review_text">Please provide your review for {{source_name}}:</label>
        <input type="text" name="review_text" id="review_text">
        <input type="hidden" name="source_id" value={{source_id}}>
        <br>
        <input type="submit" value="Submit">
    </form>""".replace(
                "{{source_name}}", "somesourcename"
            ).replace(
                "{{source_id}}", "abcde12345"
            ),
        )

    @mock.patch(
        "authchecker.auth_checks.extract_token", side_effect=mocked_extract_token
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
