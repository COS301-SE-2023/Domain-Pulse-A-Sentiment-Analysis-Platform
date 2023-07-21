from django.test import TestCase
from unittest import mock
from utils import domainscrud


class MockedItem:
    def __init__(self):
        self.deleted_count = 1
        self.inserted_id = "64a2d2a2580b40e94e42b72a"
        self._id = "64a2d2a2580b40e94e42b72a"
        self.name = "test"
        self.icon = "test.com"
        self.description = "mock data"
        self.sources = [
            {
                "source_id": "64a2d2e0b5b66c122b03e8d2",
                "last_refresh_timestamp": 0,
                "source_name": "testSource",
                "source_icon": "testSource.com",
                "params": {},
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
    mock = MockedItem()
    return mock


def mocked_find_one(dummy):
    return {
        "_id": "64a2d2a2580b40e94e42b72a",
        "name": "test",
        "icon": "test.com",
        "description": "mock data",
        "sources": [
            {
                "source_id": "64a2d2e0b5b66c122b03e8d2",
                "last_refresh_timestamp": 0,
                "source_name": "testSource",
                "source_icon": "testSource.com",
                "params": {},
            }
        ],
    }


def mocked_update_one(dummy1, dummy2):
    return {}


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
        self.assertNotIn("64a2d2e0b5b66c122b03e8d2", result["sources"])
