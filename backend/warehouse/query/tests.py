from django.test import TestCase
from django.http import JsonResponse, HttpRequest

# Create your tests here.


class QueryEngineTests(TestCase):
    def test_endpoints_are_post_only(self):
        response1: JsonResponse = self.client.get(path="/query/get_source_dashboard/")
        response2: JsonResponse = self.client.get(path="/query/get_domain_dashboard/")
        response3: JsonResponse = self.client.get(path="/query/refresh_source/")

        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(response3.status_code, 200)

        expected_data = {"status": "FAILURE", "details": "Invalid request"}

        self.assertEqual(response1.json(), expected_data)
        self.assertEqual(response2.json(), expected_data)
        self.assertEqual(response3.json(), expected_data)
