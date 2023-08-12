from django.test import TestCase
from django.http import JsonResponse, HttpRequest
from django.test import TestCase, RequestFactory
from django.urls import reverse
from unittest.mock import patch, MagicMock, ANY
import os
import mock
from . import views
from datamanager import sentiment_record_model

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
    }
    return mock_response


class LiveIngestionTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_is_post_only(self):
        response = self.client.get(path="/ingest/live_review/").json()
        assert response["status"] == "FAILURE"
        assert response["details"] == "Invalid request"

    @mock.patch(
        "datamanager.sentiment_record_model.add_record", side_effect=mocked_add_record
    )
    @mock.patch("requests.post", side_effect=mocked_analyser_request)
    def test_positive_case(self, *mocks):
        response: JsonResponse = self.client.post(
            path="/ingest/live_review/",
            data={
                "timestamp": 123456789,
                "review_text": "some data",
                "source_id": "some source id",
            },
            content_type="application/json",
        )

        assert response.json()["status"] == "SUCCESS"

        assert response.json()["details"] == "Review ingested successfully!"

        assert response.json()["confirmation"] == {
            "data": "some data",
            "timestamp": 123456789,
            "source_id": "some source id",
            "general": {},
            "ratios": {},
            "emotions": {},
            "toxicity": {},
        }
