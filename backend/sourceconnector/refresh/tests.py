from django.test import TestCase, RequestFactory
from django.urls import reverse
from django.http import HttpRequest, JsonResponse
from utils import mock_data
from outscraper import ApiClient
from googlereviews import google_reviews_connector
from tripadvisor import tripadvisor_connector
from youtube import youtube_connector
from . import views
from datetime import datetime
import json
import mock
import requests


def mocked_source_handler(dummy_params):
    return JsonResponse({"status": "SUCCESS", "newdata": [], "latest_retrieval": 0})


def mocked_month_name_to_number(dummy_param):
    return 2


class TestingRefreshHandler(TestCase):
    # ------------------ UNIT TESTS---------------------
    @mock.patch(
        "googlereviews.google_reviews_connector.handle_request",
        side_effect=mocked_source_handler,
    )
    @mock.patch(
        "youtube.youtube_connector.handle_request", side_effect=mocked_source_handler
    )
    @mock.patch(
        "tripadvisor.tripadvisor_connector.handle_request",
        side_effect=mocked_source_handler,
    )
    def test_decide_function_unit(self, *mocked_functions):
        source1: str = "youtube"
        source2: str = "youtube"
        source3: str = "youtube"
        source4: str = "some other source"

        params = {}

        response1: JsonResponse = views.decide_function(source1, params)
        response2: JsonResponse = views.decide_function(source2, params)
        response3: JsonResponse = views.decide_function(source3, params)
        response4: JsonResponse = views.decide_function(source4, params)

        data1 = json.loads(response1.content)
        data2 = json.loads(response2.content)
        data3 = json.loads(response3.content)
        data4 = json.loads(response4.content)

        assert data1["status"] == "SUCCESS"
        assert data2["status"] == "SUCCESS"
        assert data3["status"] == "SUCCESS"
        assert data4["status"] == "FAILURE"

    def test_month_name_to_number_tripadvisor(self):
        months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]

        for num, letters in enumerate(months):
            assert num + 1 == tripadvisor_connector.month_name_to_number(letters)

    @mock.patch(
        "tripadvisor.tripadvisor_connector.month_name_to_number",
        side_effect=mocked_month_name_to_number,
    )
    def test_get_timestamp_from_date(self, *mocked_functions):
        test_cases = ["Feb 2023", "18 Feb"]

        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[0]) == 1675209600
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[1])
            == datetime(datetime.now().year, 2, 18, 0, 0, 0).timestamp()
        )

    def test_get_timestamp_from_date_long_version(self, *mocked_functions):
        test_cases = [
            "1 January 2022",
            "6 February 2023",
            "15 March 2023",
            "20 April 2023",
            "10 May 2023",
            "5 June 2023",
            "30 July 2023",
            "8 August 2023",
            "18 September 2023",
            "25 October 2023",
            "12 November 2023",
            "31 December 2023",
        ]

        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[0]),
            datetime(2022, 1, 1, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[1]),
            datetime(2023, 2, 6, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[2]),
            datetime(2023, 3, 15, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[3]),
            datetime(2023, 4, 20, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[4]),
            datetime(2023, 5, 10, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[5]),
            datetime(2023, 6, 5, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[6]),
            datetime(2023, 7, 30, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[7]),
            datetime(2023, 8, 8, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[8]),
            datetime(2023, 9, 18, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[9]),
            datetime(2023, 10, 25, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[10]),
            datetime(2023, 11, 12, 0, 0, 0).timestamp(),
        )
        self.assertEqual(
            tripadvisor_connector.get_timestamp_from_date(test_cases[11]),
            datetime(2023, 12, 31, 0, 0, 0).timestamp(),
        )

    def test_handle_request_youtube(self):
        params = {
            "video_id": "test_video_id",
            "last_refresh_timestamp": "1234567890.0",
        }

        comments = [
            {"comment_id": 1, "text": "Comment 1"},
            {"comment_id": 2, "text": "Comment 2"},
        ]
        latest_retrieval = 1597534567.0

        with mock.patch(
            "youtube.youtube_connector.get_comments_by_video_id"
        ) as mock_get_comments:
            mock_get_comments.return_value = (comments, latest_retrieval)

            response = youtube_connector.handle_request(params)

            self.assertIsInstance(response, JsonResponse)

            content = json.loads(response.content)
            self.assertEqual(content["status"], "SUCCESS")
            self.assertEqual(content["newdata"], comments)
            self.assertEqual(content["latest_retrieval"], latest_retrieval)

            mock_get_comments.assert_called_once_with(
                params["video_id"], float(params["last_refresh_timestamp"])
            )

    def test_handle_request_google_reviews(self):
        params = {
            "maps_url": "test url",
            "last_refresh_timestamp": "1234567890.0",
        }

        reviews = [
            {"review_id": 1, "text": "review 1"},
            {"review_id": 2, "text": "review 2"},
        ]
        latest_retrieval = 1597534567.0

        with mock.patch(
            "googlereviews.google_reviews_connector.get_google_reviews"
        ) as mock_get_reviews:
            mock_get_reviews.return_value = (reviews, latest_retrieval)

            response = google_reviews_connector.handle_request(params)

            self.assertIsInstance(response, JsonResponse)

            content = json.loads(response.content)
            self.assertEqual(content["status"], "SUCCESS")
            self.assertEqual(content["newdata"], reviews)
            self.assertEqual(content["latest_retrieval"], latest_retrieval)

            mock_get_reviews.assert_called_once_with(
                params["maps_url"], float(params["last_refresh_timestamp"])
            )

    def test_handle_request_tripadvisor(self):
        params = {
            "tripadvisor_url": "test_url",
            "last_refresh_timestamp": "1234567890.0",
        }

        reviews = [
            {"review_id": 1, "text": "review 1"},
            {"review_id": 2, "text": "review 2"},
        ]
        latest_retrieval = 1597534567.0

        with mock.patch(
            "tripadvisor.tripadvisor_connector.get_tripadvisor_reviews"
        ) as mock_get_reviews:
            mock_get_reviews.return_value = (reviews, latest_retrieval)

            response = tripadvisor_connector.handle_request(params)

            self.assertIsInstance(response, JsonResponse)

            content = json.loads(response.content)
            self.assertEqual(content["status"], "SUCCESS")
            self.assertEqual(content["newdata"], reviews)
            self.assertEqual(content["latest_retrieval"], latest_retrieval)

            mock_get_reviews.assert_called_once_with(
                params["tripadvisor_url"], float(params["last_refresh_timestamp"])
            )

    # ---------------------------------------------------

    # ------------------INTEGRATION TESTS------------------
    def setUp(self):
        pass

    def test_get_google_reviews(self):
        params = {
            "maps_url": "test_url",
            "last_refresh_timestamp": "1234567890.0",
        }

        reviews = [
            {
                "reviews_data": [
                    {"review_text": "test", "review_timestamp": 1234567892},
                    {"review_text": "test", "review_timestamp": 1234567890},
                    {"review_text": "test", "review_timestamp": 1234567891},
                ]
            }
        ]
        latest_retrieval = 1234567892

        with mock.patch(
            "googlereviews.google_reviews_connector.call_outscraper"
        ) as mock_call_outscraper:
            mock_call_outscraper.return_value = reviews

            ret_data, latest_ret = google_reviews_connector.get_google_reviews(
                params, 0
            )

            self.assertEqual(
                ret_data,
                [
                    {"text": "test", "timestamp": 1234567892},
                    {"text": "test", "timestamp": 1234567890},
                    {"text": "test", "timestamp": 1234567891},
                ],
            )
            self.assertEqual(latest_ret, latest_retrieval)

    def test_get_tripadvisor_reviews(self):
        params = {
            "tripadvisor_url": "test_url",
            "last_refresh_timestamp": 0,
        }

        reviews = [
            {"description": "test", "reviewed": "Feb 2023"},
            {"description": "test", "reviewed": "Feb 2023"},
            {"description": "test", "reviewed": "18 Feb"},
        ]
        latest_retrieval = datetime(datetime.now().year, 2, 18, 0, 0, 0).timestamp()

        with mock.patch(
            "tripadvisor.tripadvisor_connector.call_outscraper"
        ) as mock_call_outscraper:
            mock_call_outscraper.return_value = reviews

            ret_data, latest_ret = tripadvisor_connector.get_tripadvisor_reviews(
                params, 0
            )

            self.assertEqual(
                ret_data,
                [
                    {"text": "test", "timestamp": 1675209600},
                    {"text": "test", "timestamp": 1675209600},
                    {
                        "text": "test",
                        "timestamp": datetime(
                            datetime.now().year, 2, 18, 0, 0, 0
                        ).timestamp(),
                    },
                ],
            )
            self.assertEqual(latest_ret, latest_retrieval)

    @mock.patch("youtube.youtube_connector.call_youtube_api")
    def test_get_comments_by_video_id(self, mock_call_youtube_api):
        video_id = "test_video_id"
        last_refresh_time = 0

        youtube_api_data = {
            "items": [
                {
                    "snippet": {
                        "topLevelComment": {
                            "snippet": {
                                "textOriginal": "Comment 1",
                                "updatedAt": "2023-07-23T10:00:00Z",
                            }
                        }
                    }
                },
                {
                    "snippet": {
                        "topLevelComment": {
                            "snippet": {
                                "textOriginal": "Comment 2",
                                "updatedAt": "2023-07-25T15:30:00Z",
                            }
                        }
                    }
                },
            ]
        }

        last_refresh_datetime = datetime.strptime(
            "2023-07-24T10:00:00Z", "%Y-%m-%dT%H:%M:%SZ"
        ).timestamp()

        mock_call_youtube_api.return_value = youtube_api_data

        comments, latest_retrieval = youtube_connector.get_comments_by_video_id(
            video_id, last_refresh_datetime
        )

        expected_comments = [
            {
                "text": "Comment 2",
                "timestamp": int(datetime(2023, 7, 25, 15, 30).timestamp()),
            }
        ]
        expected_latest_retrieval = int(datetime(2023, 7, 25, 15, 30).timestamp())

        self.assertEqual(comments, expected_comments)
        self.assertEqual(latest_retrieval, expected_latest_retrieval)

    @mock.patch("youtube.youtube_connector.call_youtube_api")
    def test_handle_youtube_request_integration(self, mocked_youtube):
        youtube_api_data = {
            "items": [
                {
                    "snippet": {
                        "topLevelComment": {
                            "snippet": {
                                "textOriginal": "Comment 1",
                                "updatedAt": "2023-07-23T10:00:00Z",
                            }
                        }
                    }
                },
                {
                    "snippet": {
                        "topLevelComment": {
                            "snippet": {
                                "textOriginal": "Comment 2",
                                "updatedAt": "2023-07-25T15:30:00Z",
                            }
                        }
                    }
                },
            ]
        }

        mocked_youtube.return_value = youtube_api_data

        # Youtube
        data1 = {
            "source": "youtube",
            "params": {
                "video_id": "testid",
                "last_refresh_timestamp": datetime.strptime(
                    "2023-07-24T10:00:00Z", "%Y-%m-%dT%H:%M:%SZ"
                ).timestamp(),
            },
        }
        response1: JsonResponse = self.client.post(
            path="/refresh/source/",
            data=json.dumps(data1),
            content_type="application/json",
        )
        response1_data = json.loads(response1.content)
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response1_data["status"], "SUCCESS")
        expected_comments = [
            {
                "text": "Comment 2",
                "timestamp": int(datetime(2023, 7, 25, 15, 30).timestamp()),
            }
        ]
        expected_latest_retrieval = int(datetime(2023, 7, 25, 15, 30).timestamp())
        self.assertEqual(expected_comments, response1_data["newdata"])
        self.assertEqual(expected_latest_retrieval, response1_data["latest_retrieval"])

    @mock.patch("tripadvisor.tripadvisor_connector.call_outscraper")
    def test_handle_tripadvisor_request_integration(self, mocked_tripadvisor):
        tripadvisor_api_data = [
            {"description": "test", "reviewed": "Feb 2023"},
            {"description": "test", "reviewed": "Feb 2023"},
            {"description": "test", "reviewed": "18 Feb"},
        ]

        mocked_tripadvisor.return_value = tripadvisor_api_data

        data1 = {
            "source": "tripadvisor",
            "params": {
                "tripadvisor_url": "testurl",
                "last_refresh_timestamp": 0,
            },
        }
        response1: JsonResponse = self.client.post(
            path="/refresh/source/",
            data=json.dumps(data1),
            content_type="application/json",
        )
        response1_data = json.loads(response1.content)
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response1_data["status"], "SUCCESS")
        expected_reviews = [
            {"text": "test", "timestamp": 1675209600},
            {"text": "test", "timestamp": 1675209600},
            {
                "text": "test",
                "timestamp": datetime(datetime.now().year, 2, 18, 0, 0, 0).timestamp(),
            },
        ]
        self.assertEqual(expected_reviews, response1_data["newdata"])
        self.assertEqual(
            datetime(datetime.now().year, 2, 18, 0, 0, 0).timestamp(),
            response1_data["latest_retrieval"],
        )

    @mock.patch("googlereviews.google_reviews_connector.call_outscraper")
    def test_handle_googlereviews_request_integration(self, mocked_google_reviews):
        google_api_data = [
            {
                "reviews_data": [
                    {"review_text": "test", "review_timestamp": 1234567892},
                    {"review_text": "test", "review_timestamp": 1234567890},
                    {"review_text": "test", "review_timestamp": 1234567891},
                ]
            }
        ]

        mocked_google_reviews.return_value = google_api_data

        data1 = {
            "source": "googlereviews",
            "params": {
                "maps_url": "testurl",
                "last_refresh_timestamp": 0,
            },
        }
        response1: JsonResponse = self.client.post(
            path="/refresh/source/",
            data=json.dumps(data1),
            content_type="application/json",
        )
        response1_data = json.loads(response1.content)
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response1_data["status"], "SUCCESS")
        expected_reviews = [
            {"text": "test", "timestamp": 1234567892},
            {"text": "test", "timestamp": 1234567890},
            {"text": "test", "timestamp": 1234567891},
        ]
        self.assertEqual(expected_reviews, response1_data["newdata"])
        self.assertEqual(
            1234567892,
            response1_data["latest_retrieval"],
        )

    # ---------------------------------------------------
