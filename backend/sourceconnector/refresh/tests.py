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
        request = self.client.get("/refresh/instagram/<source_id>/", args=[2])

        response = views.refresh_instagram_source(request, source_id=2)

        self.assertEqual(response.status_code, 200)

        expected_data = {"new_data": mock_data.MOCK_DATA["2"]}
        self.assertEqual(response.content, JsonResponse(expected_data).content)

    def test_refresh_instagram_source_with_source_id_3(self):
        request = self.client.get("/refresh/instagram/<source_id>/", args=[3])

        response = views.refresh_instagram_source(request, source_id=3)

        self.assertEqual(response.status_code, 200)

        expected_data = {"new_data": mock_data.MOCK_DATA["3"]}
        self.assertEqual(response.content, JsonResponse(expected_data).content)

    # ---------------------------------------------------
