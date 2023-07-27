from django.test import TestCase
from profileservice import models as profile_models
from profileservice import views as profile_views
from check_auth import views as check_views
from unittest import mock
from django.http import HttpRequest, JsonResponse
from utils import profilescrud
import json


# Create your tests here.
def mocked_create_profile(dummy, dummy1, dummy2):
    profile = profile_models.Profiles.objects.create(
        id=dummy.id, userID_id=dummy.id, mode=dummy2, profileIcon=dummy1
    )
    return profile


def mocked_login(dummy, dummy1):
    return {}


class ProfileChecksTests(TestCase):
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    def test_check_logged_in(self, mock_create_profile, mock_login):
        class MockUserNotLoggedIn:
            is_authenticated = False

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUserNotLoggedIn()
        response = profilescrud.create_user(request1, "test", "t@test.com", "test")
        request2 = HttpRequest()
        request2.method = "POST"

        class MockUserLoggedIn:
            is_authenticated = True
            id = 5

        request2.user = MockUserLoggedIn()
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.check_logged_in(request2)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "SUCCESS")
