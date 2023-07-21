from django.test import TestCase
from unittest import mock


class MockedItem:
    def __init__(self):
        self.deleted_count = 1
        self.inserted_id = "1234567890"
        self._id = "1234567890"
        self.name = "test"
        self.icon = "test.com"
        self.description = "mock data"
        self.sources = []


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
        "sources": [],
    }


def mocked_update_one(dummy1, dummy2):
    return True
