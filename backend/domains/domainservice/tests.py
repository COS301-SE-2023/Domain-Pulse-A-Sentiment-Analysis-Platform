import json
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.test import TestCase
from unittest import mock

from requests import Response
from utils import domainscrud
from bson.objectid import ObjectId
from domainservice import views as domain_views
from django.test.client import RequestFactory
from authchecker import auth_checks
from sourcevalidator import validator


class MockedItem:
    def __init__(self):
        self.deleted_count = 1
        self.inserted_id = ObjectId("64a2d2a2580b40e94e42b72a")
        self._id = "64a2d2a2580b40e94e42b72a"
        self.name = "test"
        self.icon = "test.com"
        self.description = "mock data"
        self.sources = [
            {
                "source_id": ObjectId("64a2d2e0b5b66c122b03e8d2"),
                "last_refresh_timestamp": 0,
                "source_name": "testSource",
                "source_icon": "testSource.com",
                "params": {"t": "t"},
            }
        ]


def mocked_find_one_with_excpetion(dummy):
    raise Exception()


def mocked_insert_one(dummy):
    mock = MockedItem()
    mock.name = dummy["name"]
    mock.icon = dummy["icon"]
    mock.description = dummy["description"]
    mock.sources = dummy["sources"]
    return mock


def mocked_delete_one(dummy):
    return MockedItem()


def mocked_find_one(dummy):
    return {
        "_id": ObjectId("64a2d2a2580b40e94e42b72a"),
        "name": "test",
        "icon": "test.com",
        "description": "mock data",
        "sources": [
            {
                "source_id": ObjectId("64a2d2e0b5b66c122b03e8d2"),
                "last_refresh_timestamp": 0,
                "source_name": "testSource",
                "source_icon": "testSource.com",
                "params": {"t": "t"},
            }
        ],
    }


def mocked_update_one(dummy1, dummy2):
    return {}


class MockedRequest:
    def __init__(self):
        self.status_code = 200
        self.data = {
            "status": "SUCCESS",
            "details": "User is authorized",
        }
        self.content = json.dumps(self.data)
        self._json_data = self.data

    def json(self):
        return self._json_data


def mocked_request_json():
    return {"status": "SUCCESS", "details": "User is authorized"}


def mocked_request_post(dummy1, json, headers):
    return MockedRequest()


def mocked_request_get(url, headers=None):
    if not headers == None:
        data = {"data": ["test"]}
        mock = MockedRequest()
        mock.data = data
        mock._json_data = data
        return mock
    return MockedRequest()


class MockedApiClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self._json_data = {"status": "SUCCESS", "details": "User is authorized"}

    def json(self):
        return self._json_data

    def google_maps_reviews(
        self, query, reviews_limit, limit, ignore_empty, language, region
    ):
        return [{"place_id": "test"}]


def mocked_ApiClient(api_key):
    return MockedApiClient(api_key)


def mocked_extract_token(dummy):
    return True, "token"


def mocked_find_one_and_update(dummy1, dummy2):
    return {
        "_id": ObjectId("64a2d2a2580b40e94e42b72a"),
        "name": "test",
        "icon": "test.com",
        "description": "mock data",
        "sources": [
            {
                "source_id": ObjectId("64a2d2e0b5b66c122b03e8d2"),
                "last_refresh_timestamp": 0,
                "source_name": "testSource",
                "source_icon": "testSource.com",
                "params": {"t": "t"},
            }
        ],
    }


class DomainsTests(TestCase):
    @mock.patch(
        "pymongo.collection.Collection.insert_one", side_effect=mocked_insert_one
    )
    def test_create_domain(self, mock_insert):
        result = domainscrud.create_domain("test", "test.com", "mock data")
        self.assertEqual(result["id"], "64a2d2a2580b40e94e42b72a")
        self.assertEqual(result["name"], "test")
        self.assertEqual(result["icon"], "test.com")
        self.assertEqual(result["description"], "mock data")
        self.assertEqual(result["sources"], [])

    @mock.patch(
        "pymongo.collection.Collection.find_one_and_update",
        side_effect=mocked_find_one_and_update,
    )
    def test_edit_domain(self, mock_insert):
        result = domainscrud.edit_domain(
            "64a2d2a2580b40e94e42b72a", "test", "test.com", "mock data 2"
        )
        self.assertEqual(result["id"], "64a2d2a2580b40e94e42b72a")
        self.assertEqual(result["name"], "test")
        self.assertEqual(result["icon"], "test.com")
        self.assertEqual(result["description"], "mock data 2")
        self.assertEqual(
            result["sources"],
            [
                {
                    "source_id": ("64a2d2e0b5b66c122b03e8d2"),
                    "last_refresh_timestamp": 0,
                    "source_name": "testSource",
                    "source_icon": "testSource.com",
                    "params": {"t": "t"},
                }
            ],
        )

    @mock.patch(
        "pymongo.collection.Collection.delete_one", side_effect=mocked_delete_one
    )
    def test_delete_domain(self, mock_delete):
        result = domainscrud.delete_domain("64a2d2a2580b40e94e42b72a")
        self.assertEqual(result["status"], "SUCCESS")

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    def test_get_domain(self, mock_find):
        result = domainscrud.get_domain("64a2d2a2580b40e94e42b72a")
        self.assertEqual(result["_id"], "64a2d2a2580b40e94e42b72a")

    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    def test_update_last_refresh(self, mock_update, mock_find):
        result = domainscrud.update_last_refresh("64a2d2a2580b40e94e42b72a", 1)
        self.assertEqual(result, True)

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_add_source(self, mock_find, mock_update):
        result = domainscrud.add_source(
            "64a2d2a2580b40e94e42b72a", "testSource2", "testSource2.com", {}
        )
        self.assertEqual(result["_id"], "64a2d2a2580b40e94e42b72a")
        self.assertEqual(result["name"], "test")
        self.assertEqual(result["icon"], "test.com")
        self.assertEqual(result["description"], "mock data")
        self.assertIn(
            {
                "source_id": result["new_source_id"],
                "last_refresh_timestamp": 0,
                "source_name": "testSource2",
                "source_icon": "testSource2.com",
                "params": {},
            },
            result["sources"],
        )

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_remove_source(self, mock_find, mock_update):
        result = domainscrud.remove_source(
            "64a2d2a2580b40e94e42b72a", "64a2d2e0b5b66c122b03e8d2"
        )
        self.assertEqual(result["_id"], "64a2d2a2580b40e94e42b72a")
        self.assertNotIn("64a2d2e0b5b66c122b03e8d2", result["sources"])

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_create_param(self, mock_find, mock_update):
        test_key = "test_key"
        test_value = "test_value"
        result = domainscrud.create_param(
            "64a2d2a2580b40e94e42b72a", "64a2d2e0b5b66c122b03e8d2", test_key, test_value
        )
        self.assertEqual(result["_id"], "64a2d2a2580b40e94e42b72a")
        self.assertEqual(result["sources"][0]["params"][test_key], test_value)

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_edit_source(self, mock_find, mock_update):
        result = domainscrud.edit_source("64a2d2e0b5b66c122b03e8d2", "test123")
        self.assertEqual(result["sources"][0]["source_id"], "64a2d2e0b5b66c122b03e8d2")
        self.assertEqual(result["sources"][0]["source_name"], "test123")

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_delete_param(self, mock_find, mock_update):
        test_key = "t"
        result = domainscrud.delete_param(
            "64a2d2a2580b40e94e42b72a", "64a2d2e0b5b66c122b03e8d2", test_key
        )
        self.assertEqual(result["_id"], "64a2d2a2580b40e94e42b72a")
        self.assertNotIn(test_key, result["sources"][0]["params"])

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    def test_get_source(self, mock_find):
        result = domainscrud.get_source("64a2d2e0b5b66c122b03e8d2")
        self.assertEqual(result["source_id"], "64a2d2e0b5b66c122b03e8d2")

    # def test_extract_token(self):
    #     request2 = HttpRequest()
    #     request2.method = "POST"
    #     jwt = "testJWT"
    #     headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
    #     request2.headers = headers
    #     flag, token = auth_checks.extract_token(request2)
    #     self.assertEqual(flag, True)
    #     self.assertEqual(token, jwt)

    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_verify_user_owns_domain_ids(self, mock_post):
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps({"id": "64a2d2a2580b40e94e42b72a"})
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = auth_checks.verify_user_owns_domain_ids(
            request2, ["64a2d2a2580b40e94e42b72a"]
        )
        self.assertEqual(response, (True, "User is authorized"))

    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_verify_user_owns_domain_ids_and_remove(self, mock_post):
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps({"id": "64a2d2a2580b40e94e42b72a"})
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = auth_checks.verify_user_owns_domain_ids(
            request2, ["64a2d2a2580b40e94e42b72a"], "remove_domain"
        )
        self.assertEqual(response, (True, "User is authorized"))

    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_verify_user_owns_source_ids(self, mock_post):
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps({"id": "64a2d2a2580b40e94e42b72a"})
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = auth_checks.verify_user_owns_source_ids(
            request2, ["64a2d2a2580b40e94e42b72a"]
        )
        self.assertEqual(response, (True, "User is authorized"))

    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_verify_user_owns_source_ids_and_remove(self, mock_post):
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps({"id": "64a2d2a2580b40e94e42b72a"})
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = auth_checks.verify_user_owns_source_ids(
            request2, ["64a2d2a2580b40e94e42b72a"], "remove_source"
        )
        self.assertEqual(response, (True, "User is authorized"))

    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_create_domain_in_profile(self, mock_post):
        request2 = HttpRequest()
        request2.method = "POST"
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = auth_checks.create_domain_in_profile(request2, "1")
        self.assertEqual(response._json_data["status"], "SUCCESS")

    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_add_source_in_profile(self, mock_post):
        request2 = HttpRequest()
        request2.method = "POST"
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = auth_checks.add_source_in_profile(request2, "1", "1")
        self.assertEqual(response._json_data["status"], "SUCCESS")

    @mock.patch(
        "sourcevalidator.validator.youtube_validate_video_id", return_value=True
    )
    def test_handler_youtube_success(self, mock_validate):
        params = {"source_type": "youtube", "video_id": "test"}
        is_valid, details = validator.handler(params)
        self.assertEqual(is_valid, True)
        self.assertEqual(details, "Source details are valid")

    @mock.patch(
        "sourcevalidator.validator.youtube_validate_video_id", return_value=False
    )
    def test_handler_youtube_Failure(self, mock_validate):
        params = {"source_type": "youtube", "video_id": "test"}
        is_valid, details = validator.handler(params)
        self.assertEqual(is_valid, False)
        self.assertEqual(details, "video_id is invalid")

    @mock.patch("sourcevalidator.validator.validate_google_reviews", return_value=True)
    def test_handler_google_reviews_success(self, mock_validate):
        params = {"source_type": "googleReviews", "maps_url": "test"}
        is_valid, details = validator.handler(params)
        self.assertEqual(is_valid, True)
        self.assertEqual(details, "Source details are valid")

    @mock.patch("sourcevalidator.validator.validate_google_reviews", return_value=False)
    def test_handler_google_reviews_Failure(self, mock_validate):
        params = {"source_type": "googleReviews", "maps_url": "test"}
        is_valid, details = validator.handler(params)
        self.assertEqual(is_valid, False)
        self.assertEqual(details, "maps_url is invalid")

    @mock.patch("sourcevalidator.validator.validate_tripadvisor", return_value=True)
    def test_handler_tripadvisor_success(self, mock_validate):
        params = {"source_type": "tripadvisor", "tripadvisor_url": "test"}
        is_valid, details = validator.handler(params)
        self.assertEqual(is_valid, True)
        self.assertEqual(details, "Source details are valid")

    @mock.patch("sourcevalidator.validator.validate_tripadvisor", return_value=False)
    def test_handler_tripadvisor_Failure(self, mock_validate):
        params = {"source_type": "tripadvisor", "tripadvisor_url": "test"}
        is_valid, details = validator.handler(params)
        self.assertEqual(is_valid, False)
        self.assertEqual(details, "tripadvisor_url is invalid")

    @mock.patch("requests.get", side_effect=mocked_request_get)
    def test_youtube_validate_video_id(self, mock_get):
        result = validator.youtube_validate_video_id("test")
        self.assertEqual(result, True)

    @mock.patch("sourcevalidator.validator.ApiClient", side_effect=mocked_ApiClient)
    def test_validate_google_reviews(self, mock_ApiClient):
        result = validator.validate_google_reviews("test")
        self.assertEqual(result, True)

    @mock.patch("requests.get", side_effect=mocked_request_get)
    def test_validate_tripadvisor(self, mock_ApiClient):
        result = validator.validate_tripadvisor("test")
        self.assertEqual(result, True)

    @mock.patch("requests.get", side_effect=mocked_request_get)
    def test_validate_trustpilot(self, mock):
        result = validator.validate_trustpilot("test")
        self.assertEqual(result, True)

    @mock.patch("sourcevalidator.validator.validate_trustpilot", return_value=True)
    def test_handler_trustpilot_success(self, mock_validate):
        params = {"source_type": "trustpilot", "query_url": "test"}
        is_valid, details = validator.handler(params)
        self.assertEqual(is_valid, True)
        self.assertEqual(details, "Source details are valid")

    @mock.patch("sourcevalidator.validator.validate_trustpilot", return_value=False)
    def test_handler_trustpilot_Failure(self, mock_validate):
        params = {"source_type": "trustpilot", "query_url": "test"}
        is_valid, details = validator.handler(params)
        self.assertEqual(is_valid, False)
        self.assertEqual(details, "query_url is invalid")

    @mock.patch("sourcevalidator.validator.validate_trustpilot", return_value=False)
    def test_handler_trustpilot_Failure_on_param(self, mock_validate):
        params = {"source_type": "trustpilot", "wrong_url": "test"}
        is_valid, details = validator.handler(params)
        self.assertEqual(is_valid, False)
        self.assertEqual(details, "Missing parameter: query_url")

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------
    @mock.patch(
        "pymongo.collection.Collection.insert_one", side_effect=mocked_insert_one
    )
    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_create_domain_integration(self, mock_insert, mock_query):
        data = {"name": "test", "icon": "test.com", "description": "mocked"}
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/create_domain",
            data=data,
            content_type="application/json",
            headers=headers,
        )
        response_data = json.loads(response.content)
        self.assertEqual(response_data["status"], "SUCCESS")

    @mock.patch(
        "pymongo.collection.Collection.find_one_and_update",
        side_effect=mocked_find_one_and_update,
    )
    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_edit_domain_integration(self, mock_insert, mock_query):
        data = {
            "id": "64a2d2a2580b40e94e42b72a",
            "name": "test",
            "icon": "test.com",
            "description": "mocked",
        }
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/edit_domain",
            data=data,
            content_type="application/json",
            headers=headers,
        )
        response_data = json.loads(response.content)
        self.assertEqual(response_data["status"], "SUCCESS")

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch("requests.post", side_effect=mocked_request_post)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_remove_source_integration(self, mock_find, mock_update, mock_post):
        data = {
            "id": "64a2d2a2580b40e94e42b72a",
            "source_id": "64a2d2e0b5b66c122b03e8d2",
        }
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/remove_source",
            data=data,
            content_type="application/json",
            headers=headers,
        )
        response_data = json.loads(response.content)
        self.assertEqual(response_data["status"], "SUCCESS")

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch("requests.post", side_effect=mocked_request_post)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_edit_source_integration(self, mock_find, mock_update, mock_post):
        data = {
            "source_id": "64a2d2e0b5b66c122b03e8d2",
            "name": "test123",
        }
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/edit_source",
            data=data,
            content_type="application/json",
            headers=headers,
        )
        response_data = json.loads(response.content)
        self.assertEqual(response_data["status"], "SUCCESS")

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch("requests.post", side_effect=mocked_request_post)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_create_param_integration(self, mock_find, mock_update, mock_post):
        test_key = "test_key"
        test_value = "test_value"
        data = {
            "id": "64a2d2a2580b40e94e42b72a",
            "source_id": "64a2d2e0b5b66c122b03e8d2",
            "key": test_key,
            "value": test_value,
        }
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}

        response: JsonResponse = self.client.post(
            path="/domains/create_param",
            data=data,
            content_type="application/json",
            headers=headers,
        )
        response_data = json.loads(response.content)

        self.assertEqual(
            response_data["confirmation"]["_id"], "64a2d2a2580b40e94e42b72a"
        )
        self.assertEqual(
            response_data["confirmation"]["sources"][0]["params"][test_key], test_value
        )

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch("requests.post", side_effect=mocked_request_post)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_delete_param_integration(self, mock_find, mock_update, mock_post):
        test_key = "t"
        data = {
            "id": "64a2d2a2580b40e94e42b72a",
            "source_id": "64a2d2e0b5b66c122b03e8d2",
            "key": test_key,
        }
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/delete_param",
            data=data,
            content_type="application/json",
            headers=headers,
        )
        response_data = json.loads(response.content)
        self.assertNotIn(
            test_key, response_data["confirmation"]["sources"][0]["params"]
        )

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_get_source_integration(self, mock_find, mock_post):
        source_id = "64a2d2e0b5b66c122b03e8d2"
        data = {
            "source_id": source_id,
        }
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/get_source",
            data=data,
            content_type="application/json",
            headers=headers,
        )
        response_data = json.loads(response.content)
        self.assertEqual(response_data["source"]["source_id"], source_id)

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch("requests.post", side_effect=mocked_request_post)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    def test_update_last_refresh_integration(self, mock_find, mock_update, mock_post):
        data = {
            "source_id": "64a2d2e0b5b66c122b03e8d2",
            "new_last_refresh": 2,
        }
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/update_last_refresh",
            data=data,
            content_type="application/json",
            headers=headers,
        )
        response_data = json.loads(response.content)
        self.assertEqual(response_data["status"], "SUCCESS")

    @mock.patch(
        "pymongo.collection.Collection.delete_one", side_effect=mocked_delete_one
    )
    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_delete_domain_integration(self, mock_insert, mock_post):
        data = {"id": "64a2d2a2580b40e94e42b72a"}
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/delete_domain",
            data=data,
            content_type="application/json",
            headers=headers,
        )

        response_data = json.loads(response.content)
        self.assertEqual(response_data["status"], "SUCCESS")

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_get_domain_integration(self, mock_insert, mock_post):
        data = {"id": "64a2d2a2580b40e94e42b72a"}
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/get_domain",
            data=data,
            content_type="application/json",
            headers=headers,
        )
        response_data = json.loads(response.content)
        self.assertEqual(response_data["status"], "SUCCESS")

    @mock.patch("pymongo.collection.Collection.find_one", side_effect=mocked_find_one)
    @mock.patch(
        "pymongo.collection.Collection.update_one", side_effect=mocked_update_one
    )
    @mock.patch("requests.post", side_effect=mocked_request_post)
    @mock.patch("requests.get", side_effect=mocked_request_get)
    def test_add_source_integration(
        self, mock_insert, mock_update, mock_post, mock_get
    ):
        data = {
            "id": "64a2d2a2580b40e94e42b72a",
            "source_name": "testSource2",
            "source_icon": "testSource2.com",
            "params": {"source_type": "youtube", "video_id": ""},
        }
        jwt = "testJWT"
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        response: JsonResponse = self.client.post(
            path="/domains/add_source",
            data=data,
            content_type="application/json",
            headers=headers,
        )

        response_data = json.loads(response.content)
        self.assertEqual(response_data["status"], "SUCCESS")

    @mock.patch(
        "pymongo.collection.Collection.find_one",
        side_effect=mocked_find_one_with_excpetion,
    )
    def test_connection_error_cases(self, *mocks):
        assert (
            domainscrud.update_last_refresh(
                ObjectId("64d5f6df18d3d3b8b648b077"), 123456789
            )
            == False
        )

    def test_extract_token(self):
        # Valid case
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        result, token = auth_checks.extract_token(request)
        self.assertTrue(result)
        self.assertEqual(token, "valid_token")

        # Missing header
        request = HttpRequest()
        result, error_msg = auth_checks.extract_token(request)
        self.assertFalse(result)
        self.assertEqual(error_msg, "Authorization header missing")

        # Test invalid token
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "InvalidToken"
        result, error_msg = auth_checks.extract_token(request)
        self.assertFalse(result)
        self.assertEqual(error_msg, "Invalid token format")

        # Test invalid type of header
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "Basic invalid_token"
        result, error_msg = auth_checks.extract_token(request)
        self.assertFalse(result)
        self.assertEqual(error_msg, "Authorization header - Missing Bearer")

    def test_endpoints_post_only(self):
        response: JsonResponse = self.client.get(
            path="/domains/delete_domain",
        )
        assert response.json()["status"] == "FAILURE"

        response: JsonResponse = self.client.get(
            path="/domains/create_domain",
        )
        assert response.json()["status"] == "FAILURE"

        response: JsonResponse = self.client.get(
            path="/domains/get_domain",
        )
        assert response.json()["status"] == "FAILURE"

        response: JsonResponse = self.client.get(
            path="/domains/add_source",
        )
        assert response.json()["status"] == "FAILURE"

        response: JsonResponse = self.client.get(
            path="/domains/remove_source",
        )
        assert response.json()["status"] == "FAILURE"

        response: JsonResponse = self.client.get(
            path="/domains/create_param",
        )
        assert response.json()["status"] == "FAILURE"

        response: JsonResponse = self.client.get(
            path="/domains/delete_param",
        )
        assert response.json()["status"] == "FAILURE"

        response: JsonResponse = self.client.get(
            path="/domains/get_source",
        )
        assert response.json()["status"] == "FAILURE"

        response: JsonResponse = self.client.get(
            path="/domains/update_last_refresh",
        )
        assert response.json()["status"] == "FAILURE"


        response: JsonResponse = self.client.get(
            path="/domains/edit_source",
        )
        assert response.json()["status"] == "FAILURE"


        response: JsonResponse = self.client.get(
            path="/domains/edit_domain",
        )
        assert response.json()["status"] == "FAILURE"

    @mock.patch("requests.post")
    def test_auth_checker(self, mocked_response):
        # FOR DOMAIN IDs

        # Successful case
        # mock_response = MagicMock()
        # mock_response.status_code = 200
        # mock_response.json.return_value = {
        #     "status": "SUCCESS",
        #     "details": "Successful case",
        # }
        # mocked_response.return_value = mock_response
        # request = HttpRequest()
        # request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        # domain_ids = ["1", "2", "3"]
        # status, details = auth_checks.verify_user_owns_domain_ids(request, domain_ids)

        # self.assertEqual(status, True)
        # self.assertEqual(details, "User is authorized")

        # # Unsuccessful case (auth failed)
        # mock_response = MagicMock()
        # mock_response.status_code = 200
        # mock_response.json.return_value = {
        #     "status": "FAILURE",
        #     "details": "Some authentication failure",
        # }
        # mocked_response.return_value = mock_response
        # request = HttpRequest()
        # request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        # domain_ids = ["1", "2", "3"]
        # status, details = auth_checks.verify_user_owns_domain_ids(request, domain_ids)

        # self.assertEqual(status, False)
        # self.assertEqual(details, "Some authentication failure")

        # Unsuccessful case (token extraction issue)
        request = HttpRequest()
        domain_ids = ["1", "2", "3"]
        status, details = auth_checks.verify_user_owns_domain_ids(request, domain_ids)
        self.assertEqual(status, False)
        self.assertEqual(details, "Authorization header missing")

        # # FOR SOURCE IDs

        # # Successful case
        # mock_response = MagicMock()
        # mock_response.status_code = 200
        # mock_response.json.return_value = {
        #     "status": "SUCCESS",
        #     "details": "Successful case",
        # }
        # mocked_response.return_value = mock_response
        # request = HttpRequest()
        # request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        # source_ids = ["1", "2", "3"]
        # status, details = auth_checks.verify_user_owns_source_ids(request, source_ids)

        # self.assertEqual(status, True)
        # self.assertEqual(details, "User is authorized")

        # # Unsuccessful case (auth failed)
        # mock_response = MagicMock()
        # mock_response.status_code = 200
        # mock_response.json.return_value = {
        #     "status": "FAILURE",
        #     "details": "Some authentication failure",
        # }
        # mocked_response.return_value = mock_response
        # request = HttpRequest()
        # request.META["HTTP_AUTHORIZATION"] = "Bearer valid_token"
        # source_ids = ["1", "2", "3"]
        # status, details = auth_checks.verify_user_owns_source_ids(request, source_ids)

        # self.assertEqual(status, False)
        # self.assertEqual(details, "Some authentication failure")

        # Unsuccessful case (token extraction issue)
        request = HttpRequest()
        source_ids = ["1", "2", "3"]
        status, details = auth_checks.verify_user_owns_source_ids(request, source_ids)
        self.assertEqual(status, False)
        self.assertEqual(details, "Authorization header missing")
