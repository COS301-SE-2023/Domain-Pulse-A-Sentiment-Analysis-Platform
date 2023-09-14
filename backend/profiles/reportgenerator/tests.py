from reportgenerator import views as report_views
from datetime import datetime
import os
import json
from django.test import TestCase
from unittest.mock import patch, Mock, MagicMock
from django.http import HttpRequest


# Create your tests here.


def mocked_requests_post_correct(url, **kwargs):
    mock_response = MagicMock()
    if (
        url
        == "http://localhost:"
        + str(os.getenv("DJANGO_DOMAINS_PORT"))
        + "/domains/get_domain"
    ):
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "SUCCESS",
            "domain": {
                "_id": "64e245de5da9ebd795ec574e",
                "name": "Testing",
                "icon": "https://domainpulseblob.blob.core.windows.net/blob/defaultDomain1.png",
                "description": "Testing",
                "sources": [
                    {
                        "source_id": "testSouceID",
                        "source_name": "Youtube Video",
                        "source_icon": "youtube-logo.png",
                        "last_refresh_timestamp": 1694119695,
                        "params": {"source_type": "youtube", "video_id": "VQjPKqE39No"},
                    }
                ],
            },
        }
    elif (
        url
        == f"http://localhost:{str(os.getenv('DJANGO_WAREHOUSE_PORT'))}/query/get_report_data_internal/"
    ):
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "SUCCESS",
            "domain": {
                "aggregated_metrics": {
                    "general": {"category": "No data", "score": 0},
                    "emotions": {
                        "anger": 0,
                        "disgust": 0,
                        "fear": 0,
                        "joy": 0,
                        "neutral": 0,
                        "sadness": 0,
                        "surprise": 0,
                    },
                    "toxicity": {
                        "level_of_toxic": "No data",
                        "score": 0,
                    },
                    "ratios": {
                        "positive": 0,
                        "neutral": 0,
                        "negative": 0,
                    },
                },
                "meta_data": {
                    "num_analysed": 1,
                    "earliest_record": (datetime.now()).strftime("%d %B %Y"),
                    "latest_record": (datetime.now()).strftime("%d %B %Y"),
                },
                "individual_metrics": [
                    {
                        "_id": "64d5fc4a094459b793def2eb",
                        "data": "Test data.",
                        "general": {"category": "UNDECIDED", "score": 0.5},
                        "emotions": {
                            "surprise": 0.9775,
                            "sadness": 0.0087,
                            "joy": 0.0138,
                        },
                        "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                        "ratios": {"positive": 0.38, "neutral": 0.36, "negative": 0.25},
                        "timestamp": 1691745104,
                        "source_id": "64d5fb86521cb3711dea36bb",
                    }
                ],
                "timeseries": {
                    "overall": [[(datetime.now()).strftime("%Y-%m-%dT%H:%M:%S"), 0.6]]
                },
            },
            "testSouceID": {
                "aggregated_metrics": {
                    "general": {"category": "No data", "score": 0},
                    "emotions": {
                        "anger": 0,
                        "disgust": 0,
                        "fear": 0,
                        "joy": 0,
                        "neutral": 0,
                        "sadness": 0,
                        "surprise": 0,
                    },
                    "toxicity": {
                        "level_of_toxic": "No data",
                        "score": 0,
                    },
                    "ratios": {
                        "positive": 0,
                        "neutral": 0,
                        "negative": 0,
                    },
                },
                "meta_data": {
                    "num_analysed": 1,
                    "earliest_record": (datetime.now()).strftime("%d %B %Y"),
                    "latest_record": (datetime.now()).strftime("%d %B %Y"),
                },
                "individual_metrics": [
                    {
                        "_id": "64d5fc4a094459b793def2eb",
                        "data": "Test data.",
                        "general": {"category": "UNDECIDED", "score": 0.5},
                        "emotions": {
                            "surprise": 0.9775,
                            "sadness": 0.0087,
                            "joy": 0.0138,
                        },
                        "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                        "ratios": {"positive": 0.38, "neutral": 0.36, "negative": 0.25},
                        "timestamp": 1691745104,
                        "source_id": "64d5fb86521cb3711dea36bb",
                    }
                ],
                "timeseries": {
                    "overall": [[(datetime.now()).strftime("%Y-%m-%dT%H:%M:%S"), 0.6]]
                },
            },
        }

    return mock_response


def mocked_requests_post_failed_domains(url, **kwargs):
    mock_response = MagicMock()
    mock_response.status_code = 400
    return mock_response


def mocked_requests_post_invalid_domains(url, **kwargs):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"status": "FAILURE", "details": "Test Error"}
    return mock_response


def mocked_requests_post_failed_warehouse(url, **kwargs):
    mock_response = MagicMock()
    if (
        url
        == "http://localhost:"
        + str(os.getenv("DJANGO_DOMAINS_PORT"))
        + "/domains/get_domain"
    ):
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "SUCCESS",
            "domain": {
                "_id": "64e245de5da9ebd795ec574e",
                "name": "Testing",
                "icon": "https://domainpulseblob.blob.core.windows.net/blob/defaultDomain1.png",
                "description": "Testing",
                "sources": [
                    {
                        "source_id": "testSouceID",
                        "source_name": "Youtube Video",
                        "source_icon": "youtube-logo.png",
                        "last_refresh_timestamp": 1694119695,
                        "params": {"source_type": "youtube", "video_id": "VQjPKqE39No"},
                    }
                ],
            },
        }
    elif (
        url
        == f"http://localhost:{str(os.getenv('DJANGO_WAREHOUSE_PORT'))}/query/get_report_data_internal/"
    ):
        mock_response.status_code = 400

    return mock_response


def mocked_requests_post_invalid_warehouse(url, **kwargs):
    mock_response = MagicMock()
    if (
        url
        == "http://localhost:"
        + str(os.getenv("DJANGO_DOMAINS_PORT"))
        + "/domains/get_domain"
    ):
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "SUCCESS",
            "domain": {
                "_id": "64e245de5da9ebd795ec574e",
                "name": "Testing",
                "icon": "https://domainpulseblob.blob.core.windows.net/blob/defaultDomain1.png",
                "description": "Testing",
                "sources": [
                    {
                        "source_id": "testSouceID",
                        "source_name": "Youtube Video",
                        "source_icon": "youtube-logo.png",
                        "last_refresh_timestamp": 1694119695,
                        "params": {"source_type": "youtube", "video_id": "VQjPKqE39No"},
                    }
                ],
            },
        }
    elif (
        url
        == f"http://localhost:{str(os.getenv('DJANGO_WAREHOUSE_PORT'))}/query/get_report_data_internal/"
    ):
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "FAILURE",
            "details": "Test Error",
        }
    return mock_response


class TestGenerateReport(TestCase):
    @patch("reportgenerator.views.upload_pdf_to_azure")
    @patch("reportgenerator.views.generate_domain_graphs_js")
    @patch("reportgenerator.views.generate_domain_html")
    @patch("reportgenerator.views.generate_source_graph_js")
    @patch("reportgenerator.views.generate_source_html")
    @patch("tempfile.NamedTemporaryFile")
    @patch("pdfkit.configuration")
    @patch("pdfkit.from_string")
    @patch("os.unlink")
    @patch("requests.post", side_effect=mocked_requests_post_correct)
    def test_generate_report_success(
        self,
        mock_post,
        mock_os,
        mock_pdfkit,
        mock_pdfkit_config,
        mock_tempfile,
        mock_source_html,
        mock_source_js,
        mock_domain_html,
        mock_domain_js,
        mock_azure,
    ):
        mock_azure.return_value = "http://example.com/report.pdf"
        mock_domain_js.return_value = ""
        mock_domain_html.return_value = ""
        mock_source_js.return_value = ""
        mock_source_html.return_value = ""
        mocked_tempfile_response = MagicMock()
        mocked_tempfile_response.name = "test.pdf"
        mock_tempfile.return_value = mocked_tempfile_response
        mock_pdfkit_config.return_value = ""
        mock_pdfkit.return_value = ""

        request = HttpRequest()
        request.method = "POST"
        request._body = json.dumps({"domain_id": "12345"})

        response = report_views.generate_report(request)

        response_data = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response_data,
            {"status": "SUCCESS", "url": "http://example.com/report.pdf"},
        )

    @patch("requests.post", side_effect=mocked_requests_post_failed_domains)
    def test_generate_report_failed_domains(self, mock_request):
        request = HttpRequest()
        request.method = "POST"
        request._body = json.dumps({"domain_id": "12345"})

        response = report_views.generate_report(request)

        response_data = json.loads(response.content)

        self.assertEqual(
            response_data,
            {"status": "FAILURE", "details": "Error in domain request"},
        )

    @patch("requests.post", side_effect=mocked_requests_post_invalid_domains)
    def test_generate_report_invalid_domains(self, mock_request):
        request = HttpRequest()
        request.method = "POST"
        request._body = json.dumps({"domain_id": "12345"})

        response = report_views.generate_report(request)

        response_data = json.loads(response.content)

        self.assertEqual(
            response_data,
            {"status": "FAILURE", "details": "Test Error"},
        )

    @patch("requests.post", side_effect=mocked_requests_post_failed_warehouse)
    def test_generate_report_failed_warehouse(self, mock_request):
        request = HttpRequest()
        request.method = "POST"
        request._body = json.dumps({"domain_id": "12345"})

        response = report_views.generate_report(request)

        response_data = json.loads(response.content)

        self.assertEqual(
            response_data,
            {"status": "FAILURE", "details": "Error in warehouse request"},
        )

    @patch("requests.post", side_effect=mocked_requests_post_invalid_warehouse)
    def test_generate_report_invalid_warehouse(self, mock_request):
        request = HttpRequest()
        request.method = "POST"
        request._body = json.dumps({"domain_id": "12345"})

        response = report_views.generate_report(request)

        response_data = json.loads(response.content)

        self.assertEqual(
            response_data,
            {"status": "FAILURE", "details": "Test Error"},
        )
