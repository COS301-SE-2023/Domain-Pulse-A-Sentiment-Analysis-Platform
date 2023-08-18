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
