from reportgenerator import views as report_views
from datetime import datetime, timedelta
import os
import json
from django.test import TestCase
from unittest.mock import patch, Mock, MagicMock, mock_open
from django.http import HttpRequest


# Create your tests here.


def mocked_requests_post_correct(url, json, **kwargs):
    source_type = "csv"

    key = ""
    if (list(json.values()))[0].__contains__("youtube"):
        source_type = "youtube"
        key = "video_id"
    elif (list(json.values()))[0].__contains__("googlereviews"):
        source_type = "googlereviews"
        key = "maps_url"
    elif (list(json.values()))[0].__contains__("tripadvisor"):
        source_type = "tripadvisor"
        key = "tripadvisor_url"
    elif (list(json.values()))[0].__contains__("trustpilot"):
        source_type = "trustpilot"
        key = "query_url"

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
                        "params": {"source_type": source_type, key: "VQjPKqE39No"},
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
                    "earliest_record": (
                        (datetime.today()) - timedelta(days=1)
                    ).strftime("%d %B %Y"),
                    "latest_record": (datetime.now()).strftime("%d %B %Y"),
                },
                "individual_metrics": [
                    {
                        "_id": "64d5fc4a094459b793def2eb",
                        "data": "Test data.",
                        "general": {"category": "Positive", "score": 0.7},
                        "emotions": {
                            "surprise": 0.9775,
                            "sadness": 0.0087,
                            "joy": 0.0138,
                        },
                        "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                        "ratios": {"positive": 0.38, "neutral": 0.36, "negative": 0.25},
                        "timestamp": 1691745104,
                        "source_id": "64d5fb86521cb3711dea36bb",
                    },
                    {
                        "_id": "64d5fc4a094459b793def2ed",
                        "data": "nice haircut dawg",
                        "general": {"category": "POSITIVE", "score": 0.8552},
                        "emotions": {
                            "surprise": 0.5332,
                            "sadness": 0.3991,
                            "joy": 0.0677,
                        },
                        "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0057},
                        "ratios": {"positive": 0.76, "neutral": 0.21, "negative": 0.03},
                        "timestamp": 1691745057,
                        "source_id": "64d5fb86521cb3711dea36bb",
                    },
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
                    "earliest_record": (
                        (datetime.today()) - timedelta(days=1)
                    ).strftime("%d %B %Y"),
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
                    },
                    {
                        "_id": "64d5fc4a094459b793def2ed",
                        "data": "nice haircut dawg",
                        "general": {"category": "POSITIVE", "score": 0.8552},
                        "emotions": {
                            "surprise": 0.5332,
                            "sadness": 0.3991,
                            "joy": 0.0677,
                        },
                        "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0057},
                        "ratios": {"positive": 0.76, "neutral": 0.21, "negative": 0.03},
                        "timestamp": 1691745057,
                        "source_id": "64d5fb86521cb3711dea36bb",
                    },
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
        additions = ["", "youtube", "googlereviews", "tripadvisor", "trustpilot"]
        for i in range(0, 5, 1):
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
            request._body = json.dumps({"domain_id": "12345" + additions[i]})

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

    def test_generate_report_invalid_request(self):
        request = HttpRequest()
        request.method = "GET"

        response = report_views.generate_report(request)

        response_data = json.loads(response.content)

        self.assertEqual(
            response_data,
            {"status": "FAILURE", "details": "Invalid request"},
        )

    @patch("builtins.open", new_callable=mock_open, read_data="data")
    @patch("reportgenerator.views.BlobClient.from_blob_url", autospec=True)
    def test_upload_pdf_to_azure(self, mock_blob_client, mock_open):
        mock_client = MagicMock()
        mock_client.url = "http://example.com/report.pdf"
        mock_blob_client.return_value = mock_client
        response = report_views.upload_pdf_to_azure("fake/path", "test.pdf")
        mock_open.assert_called_once_with("fake/path", "rb")
        self.assertEqual(response, "http://example.com/report.pdf")

    test_read_string_domain_js = (
        "%domain_overall_data_points%,"
        + "%domain_ratios%,"
        + "%domain_emotions%,"
        + "%source_names%,"
        + "%domain_num_per_source%,"
        + "%domain_timeseries%"
    )

    @patch(
        "builtins.open", new_callable=mock_open, read_data=test_read_string_domain_js
    )
    def test_generate_domain_graphs_js(self, mock_open):
        time = (datetime.now()).strftime("%Y-%m-%dT%H:%M:%S")
        test_data = {
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
                "timeseries": {"overall": [[time, 0.6]]},
            },
            "testSouceID": {
                "source_name": "testSource",
                "url": "testUrl",
                "source_icon": "testIcon",
                "source_type": "testType",
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
                "timeseries": {"overall": [[time, 0.6]]},
            },
        }
        response = report_views.generate_domain_graphs_js(test_data)

        self.assertEqual(
            response,
            "[0, 100],[0, 0, 0],[0, 0, 0, 0, 0, 0],['testSource'],[1],[{'x': '"
            + time
            + "', 'y': "
            + str(0.6)
            + "}]",
        )

    test_read_string_domain_html = "{domain_icon},{domain_description},{domain_overall_score},{domain_num_analysed},\
{domain_toxicity},{domain_positive},{domain_neutral},{domain_negative},{domain_anger},{domain_disgust},\
{domain_fear},{domain_joy},{domain_sadness},{domain_surprise},{domain_start_date},{domain_end_date}"

    @patch(
        "builtins.open", new_callable=mock_open, read_data=test_read_string_domain_html
    )
    def test_generate_domain_html(self, mock_open):
        time = (datetime.now()).strftime("%Y-%m-%dT%H:%M:%S")
        time_2 = (datetime.now()).strftime("%d %B %Y")
        test_data = {
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
                    "earliest_record": time_2,
                    "latest_record": time_2,
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
                    },
                    {
                        "_id": "64d5fc4a094459b793def2ed",
                        "data": "nice haircut dawg",
                        "general": {"category": "POSITIVE", "score": 0.8552},
                        "emotions": {
                            "surprise": 0.5332,
                            "sadness": 0.3991,
                            "joy": 0.0677,
                        },
                        "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0057},
                        "ratios": {"positive": 0.76, "neutral": 0.21, "negative": 0.03},
                        "timestamp": 1691745057,
                        "source_id": "64d5fb86521cb3711dea36bb",
                    },
                ],
                "timeseries": {"overall": [[time, 0.6]]},
            },
            "testSouceID": {
                "source_name": "testSource",
                "url": "testUrl",
                "source_icon": "testIcon",
                "source_type": "testType",
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
                    "earliest_record": time_2,
                    "latest_record": time_2,
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
                    },
                    {
                        "_id": "64d5fc4a094459b793def2ed",
                        "data": "nice haircut dawg",
                        "general": {"category": "POSITIVE", "score": 0.8552},
                        "emotions": {
                            "surprise": 0.5332,
                            "sadness": 0.3991,
                            "joy": 0.0677,
                        },
                        "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0057},
                        "ratios": {"positive": 0.76, "neutral": 0.21, "negative": 0.03},
                        "timestamp": 1691745057,
                        "source_id": "64d5fb86521cb3711dea36bb",
                    },
                ],
                "timeseries": {"overall": [[time, 0.6]]},
            },
        }
        response = report_views.generate_domain_html(
            "test",
            "testDescrip",
            test_data,
            1,
            [
                {"data": "nice haircut dawg"},
                {"data": "Test data."},
                {"data": "Test Again"},
            ],
        )

        self.assertEqual(
            response,
            "test,testDescrip,0,1,0,0,0,0,0,0,0,0,0,0," + time_2 + "," + time_2,
        )

    test_read_string_source_js = (
        "%source_overall_data_points%,"
        + "%source_ratios%,"
        + "%source_number%,"
        + "%source_emotions%,"
        + "%source_toxicity_data_points%,"
        + "%source_timeseries%,"
        + "%source_num%"
    )

    @patch(
        "builtins.open", new_callable=mock_open, read_data=test_read_string_source_js
    )
    def test_generate_source_graphs_js(self, mock_open):
        time = (datetime.now()).strftime("%Y-%m-%dT%H:%M:%S")
        test_data = {
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
                "timeseries": {"overall": [[time, 0.6]]},
            },
            "testSouceID": {
                "source_name": "testSource",
                "url": "testUrl",
                "source_icon": "testIcon",
                "source_type": "testType",
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
                "timeseries": {"overall": [[time, 0.6]]},
            },
        }
        response = report_views.generate_source_graph_js(test_data)

        self.assertEqual(
            response,
            "[0, 100],[0, 0, 0],1,[0, 0, 0, 0, 0, 0],[0, 100],[{'x': '"
            + time
            + "', 'y': "
            + str(0.6)
            + "}],1\n",
        )

    test_read_string_source_html = "{source_name},\
{source_number},{source_overall_score},{source_num_analysed},{source_toxicity},{source_positive},\
{source_negative},{source_neutral},{source_anger},{source_disgust},{source_fear},{source_joy},{source_sadness},{source_surprise},{source_start_date},{source_end_date},{page_num_1},{page_num_2}"

    @patch(
        "builtins.open", new_callable=mock_open, read_data=test_read_string_source_html
    )
    def test_generate_source_html(self, mock_open):
        time = (datetime.now()).strftime("%Y-%m-%dT%H:%M:%S")
        time_2 = (datetime.now()).strftime("%d %B %Y")
        test_data = {
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
                    "earliest_record": time_2,
                    "latest_record": time_2,
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
                    },
                    {
                        "_id": "64d5fc4a094459b793def2ed",
                        "data": "nice haircut dawg",
                        "general": {"category": "POSITIVE", "score": 0.8552},
                        "emotions": {
                            "surprise": 0.5332,
                            "sadness": 0.3991,
                            "joy": 0.0677,
                        },
                        "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0057},
                        "ratios": {"positive": 0.76, "neutral": 0.21, "negative": 0.03},
                        "timestamp": 1691745057,
                        "source_id": "64d5fb86521cb3711dea36bb",
                    },
                ],
                "timeseries": {"overall": [[time, 0.6]]},
            },
            "testSouceID": {
                "source_name": "testSource",
                "url": "testUrl",
                "source_icon": "testIcon",
                "source_type": "testType",
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
                    "earliest_record": time_2,
                    "latest_record": time_2,
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
                    },
                    {
                        "_id": "64d5fc4a094459b793def2ed",
                        "data": "nice haircut dawg",
                        "general": {"category": "POSITIVE", "score": 0.8552},
                        "emotions": {
                            "surprise": 0.5332,
                            "sadness": 0.3991,
                            "joy": 0.0677,
                        },
                        "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0057},
                        "ratios": {"positive": 0.76, "neutral": 0.21, "negative": 0.03},
                        "timestamp": 1691745057,
                        "source_id": "64d5fb86521cb3711dea36bb",
                    },
                ],
                "timeseries": {"overall": [[time, 0.6]]},
            },
        }
        response = report_views.generate_source_html(test_data, [])

        self.assertEqual(
            response,
            "testSource,1,0,1,0,0,0,0,0,0,0,0,0,0," + time_2 + "," + time_2 + ",3,4\n",
        )
