from django.test import TestCase, RequestFactory
from django.urls import reverse
from django.http import HttpRequest, JsonResponse
from utils import mock_data
from outscraper import ApiClient
from googlereviews import google_reviews_connector
from tripadvisor import tripadvisor_connector
from youtube import youtube_connector
from trustpilot import trustpilot_connector
from . import views
from datetime import datetime
import json
import mock
import requests
from unittest.mock import patch, MagicMock, ANY


def mocked_source_handler(dummy_params):
    return JsonResponse({"status": "SUCCESS", "newdata": [], "latest_retrieval": 0})


def mocked_month_name_to_number(dummy_param):
    return 2


class TestingRefreshHandler(TestCase):
    # ------------------ UNIT TESTS---------------------
    def test_ping(self):
        response = self.client.get(path="/avail_ping/")
        self.assertEqual(200, response.status_code)

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
    @mock.patch(
        "trustpilot.trustpilot_connector.handle_request",
        side_effect=mocked_source_handler,
    )
    def test_decide_function_unit(self, *mocked_functions):
        source1: str = "youtube"
        source2: str = "googlereviews"
        source3: str = "tripadvisor"
        source4: str = "trustpilot"
        source5: str = "some other source"

        params = {}

        response1: JsonResponse = views.decide_function(source1, params)
        response2: JsonResponse = views.decide_function(source2, params)
        response3: JsonResponse = views.decide_function(source3, params)
        response4: JsonResponse = views.decide_function(source4, params)
        response5: JsonResponse = views.decide_function(source5, params)

        data1 = json.loads(response1.content)
        data2 = json.loads(response2.content)
        data3 = json.loads(response3.content)
        data4 = json.loads(response4.content)
        data5 = json.loads(response5.content)

        assert data1["status"] == "SUCCESS"
        assert data2["status"] == "SUCCESS"
        assert data3["status"] == "SUCCESS"
        assert data4["status"] == "SUCCESS"
        assert data5["status"] == "FAILURE"

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
            tripadvisor_connector.get_timestamp_from_date(test_cases[0]) >= 1675209600
            and tripadvisor_connector.get_timestamp_from_date(test_cases[0])
            <= 1675309600
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[1])
            <= datetime(datetime.now().year, 2, 18, 23, 59, 59).timestamp()
            and tripadvisor_connector.get_timestamp_from_date(test_cases[1])
            >= datetime(datetime.now().year, 2, 18, 0, 0, 0).timestamp()
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
            "December 31, 2023",
            "February 6, 2023",
        ]

        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[0])
            >= datetime(2022, 1, 1, 0, 0, 0).timestamp()
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[1])
            >= datetime(2023, 2, 6, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[2])
            >= datetime(2023, 3, 15, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[3])
            >= datetime(2023, 4, 20, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[4])
            >= datetime(2023, 5, 10, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[5])
            >= datetime(2023, 6, 5, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[6])
            >= datetime(2023, 7, 30, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[7])
            >= datetime(2023, 8, 8, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[8])
            >= datetime(2023, 9, 18, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[9])
            >= datetime(2023, 10, 25, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[10])
            >= datetime(2023, 11, 12, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[11])
            >= datetime(2023, 12, 31, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[12])
            >= datetime(2023, 12, 31, 0, 0, 0).timestamp(),
        )
        assert (
            tripadvisor_connector.get_timestamp_from_date(test_cases[13])
            >= datetime(2023, 2, 6, 0, 0, 0).timestamp(),
        )

    def test_handle_request_youtube(self):
        params = {
            "video_id": "test_video_id",
            "last_refresh_timestamp": "1234567890",
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
                params["video_id"], int(params["last_refresh_timestamp"])
            )

    def test_handle_request_google_reviews(self):
        params = {
            "maps_url": "test url",
            "last_refresh_timestamp": "1234567890",
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
                params["maps_url"], int(params["last_refresh_timestamp"])
            )

    def test_handle_request_tripadvisor(self):
        params = {
            "tripadvisor_url": "test_url",
            "last_refresh_timestamp": "1234567890",
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
                params["tripadvisor_url"], int(params["last_refresh_timestamp"])
            )

    def test_handle_request_trustpilot(self):
        params = {
            "query_url": "test_url",
            "last_refresh_timestamp": "1234567890",
        }

        reviews = [
            {"review_id": 1, "text": "review 1"},
            {"review_id": 2, "text": "review 2"},
        ]
        latest_retrieval = 1597534567.0

        with mock.patch(
            "trustpilot.trustpilot_connector.get_trustpilot_reviews"
        ) as mock_get_reviews:
            mock_get_reviews.return_value = (reviews, latest_retrieval)

            response = trustpilot_connector.handle_request(params)

            self.assertIsInstance(response, JsonResponse)

            content = json.loads(response.content)
            self.assertEqual(content["status"], "SUCCESS")
            self.assertEqual(content["newdata"], reviews)
            self.assertEqual(content["latest_retrieval"], latest_retrieval)

            mock_get_reviews.assert_called_once_with(
                params["query_url"], int(params["last_refresh_timestamp"])
            )

    # ---------------------------------------------------

    # ------------------INTEGRATION TESTS------------------

    def setUp(self):
        pass

    def test_get_google_reviews(self):
        params = {
            "maps_url": "test_url",
            "last_refresh_timestamp": "1234567890",
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

            assert (
                ret_data != []
                and len(ret_data) == 3
                # [
                #     {"text": "test", "timestamp": 1675209600},
                #     {"text": "test", "timestamp": 1675209600},
                #     {
                #         "text": "test",
                #         "timestamp": datetime(
                #             datetime.now().year, 2, 18, 0, 0, 0
                #         ).timestamp(),
                #     },
                # ],
            )
            assert latest_ret >= latest_retrieval

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

    @mock.patch("trustpilot.trustpilot_connector.call_outscraper")
    def test_get_trustpilot_reviews(self, mock_call_outscraper):
        query_url = "turbodebt.com"
        last_refresh_time = 0

        raw_trustpilot_data = {
            "id": "a-a42bbfd0-5a64-4c45-968c-efeb7c1c12a5",
            "status": "Success",
            "data": [
                [
                    {
                        "query": "turbodebt.com",
                        "total_reviews": 7766,
                        "review_rating": 5,
                        "review_title": "Please see previous.",
                        "review_text": "Wil, my initial contact was extraordinarily understanding of my situation. He was patient and explained the program without missing a single step. Thank you, Wil!",
                        "review_likes": 0,
                        "review_date": 1690576111,
                        "review_date_utc": "07/28/2023 20:28:31",
                        "review_id": "64c408cf706f837cb11564ee",
                        "author_title": "Carol Ertwine",
                        "author_id": "64c408cd7dada80012966f3c",
                        "author_reviews_number": 1,
                        "author_reviews_number_same_domain": 1,
                        "author_country_code": "US",
                        "owner_answer": None,
                        "owner_answer_date": None,
                    },
                    {
                        "query": "turbodebt.com",
                        "total_reviews": 7766,
                        "review_rating": 5,
                        "review_title": "Greatest Experience Ever",
                        "review_text": "Best support we've ever dealt with! We currently had $112k in debt between credit card and personal loan debt, which long story short we got more than 75% of it wiped away using Turbos debt program. Don't wait!",
                        "review_likes": 0,
                        "review_date": 1689130850,
                        "review_date_utc": "07/12/2023 03:00:50",
                        "review_id": "64adfb42b98f45a0de582934",
                        "author_title": "Robert M.",
                        "author_id": "64adfa4a26e9da0011685496",
                        "author_reviews_number": 1,
                        "author_reviews_number_same_domain": 1,
                        "author_country_code": "US",
                        "owner_answer": None,
                        "owner_answer_date": None,
                    },
                    {
                        "query": "turbodebt.com",
                        "total_reviews": 7766,
                        "review_rating": 5,
                        "review_title": 'While speaking with Nicholas  "Stellar Employee"',
                        "review_text": "While speaking with Nicholas, he was more than helpful, he was knowledgeable and more importantly he seemed genuinely caring. Plus he was very patient as I was caring for my Grandchildren.\nHe was incredible in helping me understand what this program does to help. How it saves us so much wasted interest and enables us to start saving a little money instead of being behind every month.\nSimple put, I cannot say enough positive words towards Nicholas and his ability to explain how this will help me in the long run.  Thank you Nicholas!",
                        "review_likes": 1,
                        "review_date": 1686441936,
                        "review_date_utc": "06/11/2023 00:05:36",
                        "review_id": "6484f3afc4234462867464fe",
                        "author_title": "Sherry Tranter",
                        "author_id": "6306728551a92b0017208c75",
                        "author_reviews_number": 2,
                        "author_reviews_number_same_domain": 1,
                        "author_country_code": "US",
                        "owner_answer": "Thanks for the awesome review! At Turbodebt we work hard to meet expectations like yours, and we’re happy to hear we hit the mark for you.",
                        "owner_answer_date": "2023-06-20T18:04:10.000Z",
                    },
                    {
                        "query": "turbodebt.com",
                        "total_reviews": 7766,
                        "review_rating": 5,
                        "review_title": "Recommendation",
                        "review_text": "There are two ways to fix your credit. DIY: do-it-yourself or hiring a Credit Expert. DIY is normally slow and very stressful with little result( I tried this for a very long time). If you’re looking to hire a professional credit repair company; I strongly 7 6 0 P L U S    C R E D I T    S C O R E, they're the best in terms of credit repair. They helped me realize my long time dream of becoming a homeowner. .",
                        "review_likes": 1,
                        "review_date": 1686606674,
                        "review_date_utc": "06/12/2023 21:51:14",
                        "review_id": "64877732d4ed5b2ba2e0ea25",
                        "author_title": "Jimmy Allen",
                        "author_id": "5fc95981bcb45e0019eed2ad",
                        "author_reviews_number": 1,
                        "author_reviews_number_same_domain": 1,
                        "author_country_code": "US",
                        "owner_answer": None,
                        "owner_answer_date": None,
                    },
                    {
                        "query": "turbodebt.com",
                        "total_reviews": 7766,
                        "review_rating": 5,
                        "review_title": "The worker Ms. Roxann Foley",
                        "review_text": "The worker Ms. Roxann Foley was very helpful and explained everything to the fullest. Without her I would still be indebted I thank her from my heart all the way.",
                        "review_likes": 1,
                        "review_date": 1689876225,
                        "review_date_utc": "07/20/2023 18:03:45",
                        "review_id": "64b95ae1dc8f3d936c544f0c",
                        "author_title": "Yolanda Smith",
                        "author_id": "64b95ac40d13ea00123eb860",
                        "author_reviews_number": 1,
                        "author_reviews_number_same_domain": 1,
                        "author_country_code": "US",
                        "owner_answer": None,
                        "owner_answer_date": None,
                    },
                ]
            ],
        }
        last_refresh_datetime = 0

        mock_call_outscraper.return_value = raw_trustpilot_data

        reviews, latest_retrieval = trustpilot_connector.get_trustpilot_reviews(
            query_url, last_refresh_datetime
        )
        expected_reviews = [
            {
                "text": "Wil, my initial contact was extraordinarily understanding of my situation. He was patient and explained the program without missing a single step. Thank you, Wil!",
                "timestamp": 1690576111,
            },
            {
                "text": "Best support we've ever dealt with! We currently had $112k in debt between credit card and personal loan debt, which long story short we got more than 75% of it wiped away using Turbos debt program. Don't wait!",
                "timestamp": 1689130850,
            },
            {
                "text": "While speaking with Nicholas, he was more than helpful, he was knowledgeable and more importantly he seemed genuinely caring. Plus he was very patient as I was caring for my Grandchildren.\nHe was incredible in helping me understand what this program does to help. How it saves us so much wasted interest and enables us to start saving a little money instead of being behind every month.\nSimple put, I cannot say enough positive words towards Nicholas and his ability to explain how this will help me in the long run.  Thank you Nicholas!",
                "timestamp": 1686441936,
            },
            {
                "text": "There are two ways to fix your credit. DIY: do-it-yourself or hiring a Credit Expert. DIY is normally slow and very stressful with little result( I tried this for a very long time). If you're looking to hire a professional credit repair company; I strongly 7 6 0 P L U S    C R E D I T    S C O R E, they're the best in terms of credit repair. They helped me realize my long time dream of becoming a homeowner. .",
                "timestamp": 1686606674,
            },
            {
                "text": "The worker Ms. Roxann Foley was very helpful and explained everything to the fullest. Without her I would still be indebted I thank her from my heart all the way.",
                "timestamp": 1689876225,
            },
        ]
        expected_latest_retrieval = 1690576111

        self.assertEqual(reviews, expected_reviews)
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
        # expected_reviews = [
        #     {"text": "test", "timestamp": 1675209600},
        #     {"text": "test", "timestamp": 1675209600},
        #     {
        #         "text": "test",
        #         "timestamp": datetime(datetime.now().year, 2, 18, 0, 0, 0).timestamp(),
        #     },
        # ]
        assert len(response1_data["newdata"]) == 3
        assert (
            datetime(datetime.now().year, 2, 18, 0, 0, 0).timestamp()
            <= response1_data["latest_retrieval"],
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

    @mock.patch("trustpilot.trustpilot_connector.call_outscraper")
    def test_handle_trustpilot_request_integration(self, mocked_trustpilot):
        trustpilot_api_data = {
            "status": "Success",
            "data": [
                [
                    {"review_text": "test", "review_date": 123456789},
                    {"review_text": "test", "review_date": 124455678},
                    {"review_text": "test", "review_date": 124455678},
                ]
            ],
        }

        mocked_trustpilot.return_value = trustpilot_api_data

        data1 = {
            "source": "trustpilot",
            "params": {
                "query_url": "test_url",
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
            {"text": "test", "timestamp": 123456789},
            {"text": "test", "timestamp": 124455678},
            {"text": "test", "timestamp": 124455678},
        ]
        self.assertEqual(expected_reviews, response1_data["newdata"])
        self.assertEqual(
            124455678,
            response1_data["latest_retrieval"],
        )

    # ---------------------------------------------------
