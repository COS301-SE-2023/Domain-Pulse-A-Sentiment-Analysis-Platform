from django.test import TestCase, RequestFactory
from django.urls import reverse
from django.http import HttpRequest, JsonResponse
from utils import mock_data
from googlereviews import google_reviews_connector
from tripadvisor import tripadvisor_connector
from youtube import youtube_connector
from . import views
from datetime import datetime
import json
import mock


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
        self.factory = RequestFactory()

    # ---------------------------------------------------
