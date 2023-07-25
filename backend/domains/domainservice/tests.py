import json
from django.http import JsonResponse
from django.test import TestCase
from unittest import mock
from utils import domainscrud
from bson.objectid import ObjectId
from domainservice import views as domain_views
from django.test.client import RequestFactory


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
        data = {
            "status": "SUCCESS",
            "details": "User is authorized",
        }
        self.json = json.dumps(data)


def mocked_request_post(dummy1, dummy2, dummy3):
    return MockedRequest()


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

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------
    @mock.patch(
        "pymongo.collection.Collection.insert_one", side_effect=mocked_insert_one
    )
    @mock.patch("requests.post", side_effect=mocked_request_post)
    def test_create_domain_integration(self, mock_insert, mock_query):
        data = {"name": "test", "icon": "test.com", "description": "mocked"}
        response: JsonResponse = self.client.post(
            path="/domains/create_domain", data=data, content_type="application/json"
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
        response: JsonResponse = self.client.post(
            path="/domains/remove_source", data=data, content_type="application/json"
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
        response: JsonResponse = self.client.post(
            path="/domains/create_param", data=data, content_type="application/json"
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
        response: JsonResponse = self.client.post(
            path="/domains/delete_param", data=data, content_type="application/json"
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
        response: JsonResponse = self.client.post(
            path="/domains/get_source", data=data, content_type="application/json"
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
        response: JsonResponse = self.client.post(
            path="/domains/update_last_refresh",
            data=data,
            content_type="application/json",
        )
        response_data = json.loads(response.content)
        self.assertEqual(response_data["status"], "SUCCESS")
