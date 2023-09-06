import os
from django.test import TestCase
from profileservice import models as profile_models
from profileservice import views as profile_views
from check_auth import views as check_views
from unittest import mock
from unittest.mock import patch, MagicMock
from django.http import HttpRequest, JsonResponse
from utils import profilescrud
import json
import socket


# Create your tests here.
def mocked_create_profile(dummy, dummy1, dummy2):
    profile = profile_models.Profiles.objects.create(
        id=dummy.id, userID_id=dummy.id, mode=dummy2, profileIcon=dummy1
    )
    return profile


def mocked_login(dummy, dummy1):
    return {}


def mocked_extract_token(dummy):
    return True, "token"


def mocked_get_user_from_token(dummy):
    class MockedUser:
        id = 1

    return MockedUser()


def mocked_get_domains_for_user_internal(dummy):
    return {"domainIDs": ["1"]}


def mocked_remove_domain_from_profile(dummy, dummy1):
    return {"status": "SUCCESS"}


def mocked_add_source_to_domain(dummy, dummy1, dummy2):
    return {"status": "SUCCESS"}


def mocked_add_domain_to_profile(dummy, dummy1):
    return {"status": "SUCCESS"}


def mocked_get_sources_for_user_internal(dummy):
    return {"source_ids": ["1"]}


def mocked_remove_source_from_domain(dummy, dummy1, dummy2):
    return {"status": "SUCCESS"}


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

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @mock.patch(
        "check_auth.views.get_user_from_token", side_effect=mocked_get_user_from_token
    )
    @mock.patch(
        "utils.profilescrud.get_domains_for_user_internal",
        side_effect=mocked_get_domains_for_user_internal,
    )
    @mock.patch(
        "utils.profilescrud.remove_domain_from_profile",
        side_effect=mocked_remove_domain_from_profile,
    )
    def test_check_domain_ids_and_remove_domain_success(
        self,
        mock_create_profile,
        mock_login,
        mock_extract_token,
        mock_get_user,
        mock_get_domains,
        mock_remove_domain,
    ):
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

        profilescrud.add_domain_to_profile(response["id"], "1")
        data = {
            "domain_ids": ["1"],
            "item": {"id": "1"},
            "local_key": os.getenv("LOCAL_KEY"),
        }
        request2.user = MockUserLoggedIn()
        request2._body = json.dumps(data)

        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.check_domain_ids_and_remove_domain(request2)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "SUCCESS")

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @mock.patch(
        "check_auth.views.get_user_from_token", side_effect=mocked_get_user_from_token
    )
    @mock.patch(
        "utils.profilescrud.get_domains_for_user_internal",
        side_effect=mocked_get_domains_for_user_internal,
    )
    @mock.patch(
        "utils.profilescrud.remove_domain_from_profile",
        side_effect=mocked_remove_domain_from_profile,
    )
    def test_check_domain_ids_and_remove_domain_failure(
        self,
        mock_create_profile,
        mock_login,
        mock_extract_token,
        mock_get_user,
        mock_get_domains,
        mock_remove_domain,
    ):
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

        data = {"domain_ids": ["1", "2", "3"], "local_key": os.getenv("LOCAL_KEY")}
        request2.user = MockUserLoggedIn()
        request2._body = json.dumps(data)
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.check_domain_ids_and_remove_domain(request2)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @mock.patch(
        "check_auth.views.get_user_from_token", side_effect=mocked_get_user_from_token
    )
    @mock.patch(
        "utils.profilescrud.add_source_to_domain",
        side_effect=mocked_add_source_to_domain,
    )
    def test_add_source(
        self,
        mock_create_profile,
        mock_login,
        mock_extract_token,
        mock_get_user,
        mock_add_source,
    ):
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

        profilescrud.add_domain_to_profile(response["id"], "1")

        data = {"domain_id": "1", "source_id": "1", "local_key": os.getenv("LOCAL_KEY")}
        request2.user = MockUserLoggedIn()
        request2._body = json.dumps(data)
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.add_source(request2)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "SUCCESS")

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @mock.patch(
        "check_auth.views.get_user_from_token", side_effect=mocked_get_user_from_token
    )
    @mock.patch(
        "utils.profilescrud.add_domain_to_profile",
        side_effect=mocked_add_domain_to_profile,
    )
    def test_add_domain(
        self,
        mock_create_profile,
        mock_login,
        mock_extract_token,
        mock_get_user,
        mock_add_domain,
    ):
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

        data = {"id": "1", "local_key": os.getenv("LOCAL_KEY")}

        request2.user = MockUserLoggedIn()
        request2._body = json.dumps(data)
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.add_domain(request2)
        data = json.loads(response.content)

        self.assertEqual(data["status"], "SUCCESS")

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @mock.patch(
        "check_auth.views.get_user_from_token", side_effect=mocked_get_user_from_token
    )
    @mock.patch(
        "utils.profilescrud.get_sources_for_user_internal",
        side_effect=mocked_get_sources_for_user_internal,
    )
    @mock.patch(
        "utils.profilescrud.remove_source_from_domain",
        side_effect=mocked_remove_source_from_domain,
    )
    def test_check_source_ids_and_remove_source(
        self,
        mock_create_profile,
        mock_login,
        mock_extract_token,
        mock_get_user,
        mock_get_sources,
        mock_remove_source,
    ):
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

        profilescrud.add_domain_to_profile(response["id"], "1")

        data = {
            "source_ids": ["1"],
            "item": {"id": "1", "source_id": "1"},
            "local_key": os.getenv("LOCAL_KEY"),
        }
        request2.user = MockUserLoggedIn()
        request2._body = json.dumps(data)
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.check_source_ids_and_remove_source(request2)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "SUCCESS")

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    def test_extract_token(self, mock_create_profile, mock_login):
        class MockUserNotLoggedIn:
            is_authenticated = False

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUserNotLoggedIn()
        response = profilescrud.create_user(request1, "test", "t@test.com", "test")

        request2 = HttpRequest()
        request2.method = "POST"
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        flag, token = check_views.extract_token(request2)
        self.assertEqual(flag, True)

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    def test_extract_token(self, mock_create_profile, mock_login):
        class MockUserNotLoggedIn:
            is_authenticated = False

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUserNotLoggedIn()
        response = profilescrud.create_user(request1, "test", "t@test.com", "test")

        request2 = HttpRequest()
        request2.method = "POST"
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        flag, token = check_views.extract_token(request2)
        user = check_views.get_user_from_token(token)
        self.assertEqual(user.id, response["id"])

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @mock.patch(
        "check_auth.views.get_user_from_token", side_effect=mocked_get_user_from_token
    )
    @mock.patch(
        "utils.profilescrud.get_domains_for_user_internal",
        side_effect=mocked_get_domains_for_user_internal,
    )
    def test_check_domain_ids(
        self,
        mock_create_profile,
        mock_login,
        mock_extract_token,
        mock_get_user,
        mock_get_sources,
    ):
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

        profilescrud.add_domain_to_profile(response["id"], "1")

        data = {"domain_ids": ["1"]}
        request2.user = MockUserLoggedIn()
        request2._body = json.dumps(data)
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.check_domain_ids(request2)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "SUCCESS")

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @mock.patch(
        "check_auth.views.get_user_from_token", side_effect=mocked_get_user_from_token
    )
    @mock.patch(
        "utils.profilescrud.get_domains_for_user_internal",
        side_effect=mocked_get_domains_for_user_internal,
    )
    def test_check_domain_ids_non_matching_domains(
        self,
        mock_create_profile,
        mock_login,
        mock_extract_token,
        mock_get_user,
        mock_get_sources,
    ):
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

        profilescrud.add_domain_to_profile(response["id"], "1")

        data = {"domain_ids": ["789456123"]}
        request2.user = MockUserLoggedIn()
        request2._body = json.dumps(data)
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.check_domain_ids(request2)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Non Matching Domain IDs")

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @mock.patch(
        "check_auth.views.get_user_from_token", side_effect=mocked_get_user_from_token
    )
    @mock.patch(
        "utils.profilescrud.get_sources_for_user_internal",
        side_effect=mocked_get_sources_for_user_internal,
    )
    def test_check_source_ids(
        self,
        mock_create_profile,
        mock_login,
        mock_extract_token,
        mock_get_user,
        mock_get_domains,
    ):
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

        profilescrud.add_domain_to_profile(response["id"], "123")
        profilescrud.add_source_to_domain(response["id"], "123", "1")
        data = {"source_ids": ["1"]}
        request2.user = MockUserLoggedIn()
        request2._body = json.dumps(data)
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.check_source_ids(request2)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "SUCCESS")

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @mock.patch(
        "check_auth.views.get_user_from_token", side_effect=mocked_get_user_from_token
    )
    @mock.patch(
        "utils.profilescrud.get_sources_for_user_internal",
        side_effect=mocked_get_sources_for_user_internal,
    )
    def test_check_source_ids_non_matching_sources(
        self,
        mock_create_profile,
        mock_login,
        mock_extract_token,
        mock_get_user,
        mock_get_domains,
    ):
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

        profilescrud.add_domain_to_profile(response["id"], "123")
        profilescrud.add_source_to_domain(response["id"], "123", "1")
        data = {"source_ids": ["789456123"]}
        request2.user = MockUserLoggedIn()
        request2._body = json.dumps(data)
        jwt = response["JWT"]
        headers = {"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
        request2.headers = headers
        response = check_views.check_source_ids(request2)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Non Matching Source IDs")

    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @patch("check_auth.views.get_user_from_token")
    def test_check_source_ids_none_user(self, mock_get_user, mock_extract_token):
        MockResponse = None
        mock_get_user.return_value = MockResponse
        data = {"source_ids": ["1"]}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        response = check_views.check_source_ids(request1)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Could not verify the user's identity")

    @mock.patch("check_auth.views.extract_token", side_effect=mocked_extract_token)
    @patch("check_auth.views.get_user_from_token")
    def test_check_domain_ids_none_user(self, mock_get_user, mock_extract_token):
        MockResponse = None
        mock_get_user.return_value = MockResponse
        data = {"domain_ids": ["1"]}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        response = check_views.check_domain_ids(request1)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Could not verify the user's identity")

    def test_check_domain_ids_invalid_req(self):
        request1 = HttpRequest()
        request1.method = "GET"
        response = check_views.check_domain_ids(request1)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Invalid request to Profiles service")

    def test_check_source_ids_invalid_req(self):
        request1 = HttpRequest()
        request1.method = "GET"
        response = check_views.check_source_ids(request1)
        data = json.loads(response.content)
        self.assertEqual(data["status"], "FAILURE")
        self.assertEqual(data["details"], "Invalid request to Profiles service")
