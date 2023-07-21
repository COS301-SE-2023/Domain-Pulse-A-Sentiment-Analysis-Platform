from django.test import TestCase
from unittest import mock
from utils import domainscrud


class MockedItem:
    def __init__(self):
        self.deleted_count = 1
        self.inserted_id = "1234567890"
        self._id = "1234567890"
        self.name = "test"
        self.icon = "test.com"
        self.description = "mock data"
        self.sources = [
            {
                "source_id": "Source1230",
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
    return MockedItem()


def mocked_find_one(dummy):
    return {
        "_id": "1234567890",
        "name": "test",
        "icon": "test.com",
        "description": "mock data",
        "sources": [
            {
                "source_id": "Source1230",
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
        self.assertEqual(result["id"], "1234567890")
        self.assertEqual(result["name"], "test")
        self.assertEqual(result["icon"], "test.com")
        self.assertEqual(result["description"], "mock data")
        self.assertEqual(result["sources"], [])
