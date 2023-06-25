from django.test import TestCase, RequestFactory
from django.urls import reverse
from django.http import HttpRequest, JsonResponse
from utils import mock_data
from . import views


class RefreshInstagramSourceTestCase(TestCase):
    # ------------------INTEGRATION TESTS------------------
    def setUp(self):
        self.factory = RequestFactory()

    def test_refresh_instagram_source_with_source_id_2(self):
        response = self.client.get("/refresh/instagram/2/")

        self.assertEqual(response.status_code, 200)

        expected_data = {"new_data": mock_data.MOCK_DATA["2"]}
        self.assertEqual(response.content, JsonResponse(expected_data).content)

    def test_refresh_instagram_source_with_source_id_3(self):
        response = self.client.get("/refresh/instagram/3/")

        self.assertEqual(response.status_code, 200)

        expected_data = {"new_data": mock_data.MOCK_DATA["3"]}
        self.assertEqual(response.content, JsonResponse(expected_data).content)

    def test_refresh_googlereviews_source_with_source_id_0(self):
        response = self.client.get("/refresh/googlereviews/0/")

        self.assertEqual(response.status_code, 200)

        expected_data = {"new_data": mock_data.MOCK_DATA["0"]}
        self.assertEqual(response.content, JsonResponse(expected_data).content)

    def test_refresh_googlereviews_source_with_source_id_1(self):
        response = self.client.get("/refresh/googlereviews/1/")

        self.assertEqual(response.status_code, 200)

        expected_data = {"new_data": mock_data.MOCK_DATA["1"]}
        self.assertEqual(response.content, JsonResponse(expected_data).content)

    def test_refresh_googlereviews_source_with_source_id_4(self):
        response = self.client.get("/refresh/googlereviews/4/")

        self.assertEqual(response.status_code, 200)

        expected_data = {"new_data": mock_data.MOCK_DATA["4"]}
        self.assertEqual(response.content, JsonResponse(expected_data).content)

    # ---------------------------------------------------
