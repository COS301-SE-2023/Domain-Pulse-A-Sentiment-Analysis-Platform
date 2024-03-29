import json
from django.test import TestCase
from unittest import mock

# Create your tests here.
from django.test import TestCase, Client
from django.urls import reverse
from utils import profilescrud
from django.http import HttpRequest, JsonResponse
from profileservice import models as profile_models
from django.test.client import RequestFactory
from profileservice import views as profile_views
from django.contrib.auth.models import User
from django.contrib.sessions.middleware import SessionMiddleware
from django.contrib.auth import authenticate


def mocked_create_profile(dummy, dummy1, dummy2):
    profile = profile_models.Profiles.objects.create(
        id=dummy.id, userID_id=dummy.id, mode=dummy2, profileIcon=dummy1
    )
    return profile


def mocked_login(dummy, dummy1):
    return {}


def mocked_logout(dummy):
    return {}


class ProfilesTests(TestCase):
    # -------------------------- UNIT TESTS --------------------------

    def test_apm_enabled(self):
        from profiles import settings

        settings.append_installed_apps("True")
        self.assertIn("elasticapm.contrib.django", settings.INSTALLED_APPS)

    def test_ping(self):
        response = self.client.get(path="/avail_ping/")
        self.assertEqual(200, response.status_code)

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    def test_create_user(self, mocked_create_profile, mocked_login):
        testUsername = "test"
        testEmail = "test@t.com"
        testPassword = "testP"
        request = HttpRequest()
        request.method = "POST"

        result = profilescrud.create_user(
            request, testUsername, testPassword, testEmail
        )
        if result["status"] == "SUCCESS":
            assert (
                result["profileID"] == result["id"]
                and result["username"] == testUsername
                and result["email"] == testEmail
            )
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_swap_mode_success(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        data = {"id": user["profileID"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.swap_mode(request2, user["profileID"])
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["mode"] == True
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_swap_mode_fail(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        data = {"id": user["profileID"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        incorrectID = user["profileID"] + 1
        result = profilescrud.swap_mode(request2, incorrectID)
        self.assertEqual(result["status"], "FAILURE")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_profile(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        data = {"id": user["profileID"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.get_profile(request2, user["profileID"])
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"]
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_profile_failure(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        data = {"id": user["profileID"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        incorrectID = user["profileID"] + 1
        result = profilescrud.get_profile(request2, incorrectID)
        self.assertEqual(result["status"], "FAILURE")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_user_by_id(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        data = {"id": user["profileID"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.get_user_by_id(user["profileID"])
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"]
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_user_by_id_failure(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        incorrectID = user["profileID"] + 1
        data = {"id": incorrectID}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.get_user_by_id(incorrectID)
        self.assertEqual(result["status"], "FAILURE")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_edit_profile_picture_success(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"

        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testPictureURL = "test.com"
        data = {"id": user["id"], "pictureURL": testPictureURL}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.edit_profile_picture(request2, user["id"], testPictureURL)
        if result["status"] == "SUCCESS":
            assert (
                result["id"] == user["id"] and result["profileIcon"] == testPictureURL
            )
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_edit_profile_picture_failure(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"

        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testPictureURL = "test.com"
        incorrectID = user["id"] + 1
        data = {"id": incorrectID, "pictureURL": testPictureURL}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.edit_profile_picture(
            request2, incorrectID, testPictureURL
        )
        self.assertEqual(result["status"], "FAILURE")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_edit_profile_mode(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        testMode = True
        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        data = {"id": user["id"], "mode": testMode}

        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()

        result = profilescrud.edit_profile_mode(request2, user["id"], testMode)
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["mode"] == testMode
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_edit_profile_mode_failure(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        testMode = True
        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        incorrectID = user["id"] + 1
        data = {"id": incorrectID, "mode": testMode}

        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()

        result = profilescrud.edit_profile_mode(request2, incorrectID, testMode)
        self.assertEqual(result["status"], "FAILURE")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_add_domain_to_profile(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = 3

        result = profilescrud.add_domain_to_profile(user["id"], testDomainID)
        if result["status"] == "SUCCESS":
            assert (
                result["id"] == user["id"] and str(testDomainID) in result["domainIDs"]
            )
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_add_domain_to_profile_failure(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        incorrectID = user["id"] + 1
        testDomainID = 3

        result = profilescrud.add_domain_to_profile(incorrectID, testDomainID)
        self.assertEqual(result["status"], "FAILURE")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_remove_domain_from_profile(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = 3

        profilescrud.add_domain_to_profile(user["id"], testDomainID)

        result = profilescrud.remove_domain_from_profile(user["id"], testDomainID)
        if result["status"] == "SUCCESS":
            assert (
                result["id"] == user["id"]
                and str(testDomainID) not in result["domainIDs"]
            )
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_remove_domain_from_profile_failure_user(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = 3

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        incorrectID = user["id"] + 1
        result = profilescrud.remove_domain_from_profile(incorrectID, testDomainID)
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "No user exists")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_remove_domain_from_profile_failure_domain(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = 3

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        incorrectDomainID = testDomainID + 1
        result = profilescrud.remove_domain_from_profile(user["id"], incorrectDomainID)
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "No domain exists")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_domains_for_user(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = 3

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        data = {"id": user["id"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()

        result = profilescrud.get_domains_for_user(request2, user["id"])
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["domainIDs"] == [
                str(testDomainID)
            ]
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_domains_for_user_failure(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = 3

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        incorrectID = user["id"] + 1
        data = {"id": incorrectID}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()

        result = profilescrud.get_domains_for_user(request2, incorrectID)
        self.assertEqual(result["status"], "FAILURE")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_domains_for_user_internal(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = 3

        profilescrud.add_domain_to_profile(user["id"], testDomainID)

        result = profilescrud.get_domains_for_user_internal(user["id"])
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["domainIDs"] == [
                str(testDomainID)
            ]
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_domains_for_user_internal_failure(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = 3

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        incorrectID = user["id"] + 1
        result = profilescrud.get_domains_for_user_internal(incorrectID)
        self.assertEqual(result["status"], "FAILURE")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_add_source_to_domain(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        result = profilescrud.add_source_to_domain(
            user["id"], testDomainID, testSourceID
        )
        if result["status"] == "SUCCESS":
            self.assertEqual(result["domainID"], testDomainID)
            self.assertIn(testSourceID, result["sourceIDs"])
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_add_source_to_domain_user_failure(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        incorrectID = user["id"] + 1
        result = profilescrud.add_source_to_domain(
            incorrectID, testDomainID, testSourceID
        )
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "No user exists")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_add_source_to_domain_domain_failure(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        incorrectDomainID = "4"
        result = profilescrud.add_source_to_domain(
            user["id"], incorrectDomainID, testSourceID
        )
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "No domain exists")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_remove_source_to_domain(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        profilescrud.add_source_to_domain(user["id"], testDomainID, testSourceID)

        result = profilescrud.remove_source_from_domain(
            user["id"], testDomainID, testSourceID
        )
        if result["status"] == "SUCCESS":
            self.assertEqual(result["domainID"], testDomainID)
            self.assertNotIn(testSourceID, result["sourceIDs"])
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_remove_source_to_domain_user_failure(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        profilescrud.add_source_to_domain(user["id"], testDomainID, testSourceID)
        incorrectID = user["id"] + 1
        result = profilescrud.remove_source_from_domain(
            incorrectID, testDomainID, testSourceID
        )
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "No user exists")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_remove_source_to_domain_domain_failure(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        profilescrud.add_source_to_domain(user["id"], testDomainID, testSourceID)
        incorrectDomainID = "4"
        result = profilescrud.remove_source_from_domain(
            user["id"], incorrectDomainID, testSourceID
        )
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "No domain exists")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_sources_for_domain(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        profilescrud.add_source_to_domain(user["id"], testDomainID, testSourceID)

        result = profilescrud.get_sources_for_domain(user["id"], testDomainID)
        if result["status"] == "SUCCESS":
            self.assertEqual(result["id"], user["id"])
            self.assertEqual(result["domain_id"], testDomainID)
            self.assertIn(testSourceID, result["source_ids"])
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_sources_for_domain_user_failure(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        profilescrud.add_source_to_domain(user["id"], testDomainID, testSourceID)
        incorrectID = user["id"] + 1
        result = profilescrud.get_sources_for_domain(incorrectID, testDomainID)
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "No user exists")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_sources_for_domain_domain_failure(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        profilescrud.add_source_to_domain(user["id"], testDomainID, testSourceID)
        incorrectDomainID = "4"
        result = profilescrud.get_sources_for_domain(user["id"], incorrectDomainID)
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "No domain exists")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_sources_for_user_internal(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        profilescrud.add_source_to_domain(user["id"], testDomainID, testSourceID)

        result = profilescrud.get_sources_for_user_internal(user["id"])
        if result["status"] == "SUCCESS":
            self.assertEqual(result["id"], user["id"])
            self.assertIn(testSourceID, result["source_ids"])
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_sources_for_user_internal_user_failure(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        profilescrud.add_source_to_domain(user["id"], testDomainID, testSourceID)
        incorrectID = user["id"] + 1
        result = profilescrud.get_sources_for_user_internal(incorrectID)
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "No user exists")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_login_user_correct_credentials(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = False

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testUsername = "test"
        testPassword = "test"
        data = {"username": "test", "password": "test"}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.login_user(request2, testUsername, testPassword)
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"]
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_login_user_incorrect_credentials(
        self, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = False

        testUsername = "testWrong"
        testPassword = "test"
        data = {"username": "testWrong", "password": "test"}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        result = profilescrud.login_user(request1, testUsername, testPassword)
        if result["status"] == "SUCCESS":
            assert False
        else:
            assert True

    @mock.patch("utils.profilescrud.logout", side_effect=mocked_logout)
    def test_logout_user_logged_in(self, mocked_logout):
        class MockUser:
            is_authenticated = True

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        result = profilescrud.logout_user(request1)
        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    @mock.patch("utils.profilescrud.logout", side_effect=mocked_logout)
    def test_logout_user_logged_out(self, mocked_logout):
        class MockUser:
            is_authenticated = False

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        result = profilescrud.logout_user(request1)
        if result["status"] == "SUCCESS":
            assert False
        else:
            assert True

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_change_password(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testId = user["id"]
        testOldPassword = "test"
        testNewPassword = "test2"
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.change_password(
            request2, testId, testOldPassword, testNewPassword
        )
        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_change_password_failure(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        incorrectID = user["id"] + 1
        testOldPassword = "test"
        testNewPassword = "test2"
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.change_password(
            request2, incorrectID, testOldPassword, testNewPassword
        )
        self.assertEqual(result["status"], "FAILURE")

    @mock.patch("utils.profilescrud.logout", side_effect=mocked_logout)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("requests.post")
    def test_delete_user(
        self, mocked_post, mocked_logout, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        response = mock.MagicMock()
        response.status_code = 200
        response.json.return_value = {"status": "SUCCESS"}
        mocked_post.return_value = response

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test","t@test.com")
        testUsername = "test"
        testPassword = "test"
        data = {"username": user["id"], "oldpassword": "test", "newpassword": "test2"}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)

        user = authenticate(username="test", password="test")
        request2.user = user
        result = profilescrud.delete_user(request2, testUsername, testPassword)
        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    @mock.patch("utils.profilescrud.logout", side_effect=mocked_logout)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("requests.post")
    def test_delete_user_fail_domain_req(
        self, mocked_post, mocked_logout, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        response = mock.MagicMock()
        response.status_code = 400
        response.json.return_value = {"status": "SUCCESS"}
        mocked_post.return_value = response

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test","t@test.com")
        testUsername = "test"
        testPassword = "test"
        data = {"username": user["id"], "oldpassword": "test", "newpassword": "test2"}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)

        user = authenticate(username="test", password="test")
        request2.user = user
        result = profilescrud.delete_user(request2, testUsername, testPassword)
        if result["status"] == "FAILURE":
            assert True
        else:
            assert False

    @mock.patch("utils.profilescrud.logout", side_effect=mocked_logout)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("requests.post")
    def test_delete_user_invalid_domain_req(
        self, mocked_post, mocked_logout, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        response = mock.MagicMock()
        response.status_code = 200
        response.json.return_value = {"status": "FAILURE"}
        mocked_post.return_value = response

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testUsername = "test"
        testPassword = "test"
        data = {"username": user["id"], "oldpassword": "test", "newpassword": "test2"}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)

        user = authenticate(username="test", password="test")
        request2.user = user
        result = profilescrud.delete_user(request2, testUsername, testPassword)
        if result["status"] == "FAILURE":
            assert True
        else:
            assert False

    @mock.patch("utils.profilescrud.logout", side_effect=mocked_logout)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("requests.post")
    @mock.patch("django.contrib.auth.models.User.objects.get")
    @mock.patch("django.contrib.auth.models.User.check_password")
    def test_delete_user_auth_failures(
        self,
        mocked_password,
        mocked_get,
        mocked_post,
        mocked_logout,
        mocked_login,
        mocked_create_profile,
    ):
        class MockUser:
            id = 1
            is_authenticated = False

        response = mock.MagicMock()
        response.status_code = 200
        response.json.return_value = {"status": "SUCCESS"}
        mocked_post.return_value = response

        response = mock.MagicMock()
        response.id = 1
        mocked_get.return_value = response

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testUsername = "test"
        testPassword = "test"

        request2 = HttpRequest()
        user = MockUser()
        request2.user = user
        result = profilescrud.delete_user(request2, testUsername, testPassword)
        self.assertEqual(
            result, {"status": "FAILURE", "details": "Authentication failed"}
        )

        user = mock.MagicMock()
        user.id = 2
        request2 = HttpRequest()
        request2.user = user
        result = profilescrud.delete_user(request2, testUsername, testPassword)
        self.assertEqual(
            result, {"status": "FAILURE", "details": "Authentication failed"}
        )

        user.id = user.id - 1
        user.id = 1
        user.check_password.return_value = False
        request2 = HttpRequest()
        request2.user = user
        result = profilescrud.delete_user(request2, testUsername, "wrong")

        self.assertEqual(
            result, {"status": "FAILURE", "details": "Authentication failed"}
        )

    @mock.patch("utils.profilescrud.logout", side_effect=mocked_logout)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_delete_user_failure(
        self, mocked_logout, mocked_login, mocked_create_profile
    ):
        class MockUser:
            is_authenticated = True

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testUsername = "test"
        testPassword = "test"
        data = {"username": user["id"], "oldpassword": "test", "newpassword": "test2"}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)

        user = authenticate(username="test", password="test")
        user.id = user.id + 1
        request2.user = user
        result = profilescrud.delete_user(request2, testUsername, testPassword)
        self.assertEqual(result["status"], "FAILURE")

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------

    def test_create_profile_integration(self):
        testUsername = "test"
        testPassword = "testP"
        data = {"username": testUsername, "password": testPassword}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        result = json.loads(profile_views.create_user(request1).content.decode())
        if result["status"] == "SUCCESS":
            assert (
                result["profileID"] == result["id"]
                and result["username"] == testUsername
                and result["email"] == "*"
            )
        else:
            assert False

    def test_swap_mode_integration(self):
        class MockUser:
            is_authenticated = True

        data = {"username": "test", "password": "test"}
        self.client.login(username="test", password="test")
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        user = profile_views.create_user(request1).content.decode()
        user = json.loads(user)
        data = {"id": user["profileID"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = profile_views.swap_mode(request2).content.decode()
        result = json.loads(result)
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["mode"] == True
        else:
            assert False

    def test_edit_profile_picture_integration(self):
        class MockUser:
            is_authenticated = True

        data = {"username": "test", "password": "test"}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        user = json.loads(profile_views.create_user(request1).content.decode())
        testPictureURL = "test.com"
        data = {"id": user["id"], "pictureURL": testPictureURL}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = json.loads(
            profile_views.edit_profile_picture(request2).content.decode()
        )
        if result["status"] == "SUCCESS":
            assert (
                result["id"] == user["id"] and result["profileIcon"] == testPictureURL
            )
        else:
            assert False

    def test_edit_profile_mode_integration(self):
        class MockUser:
            is_authenticated = True

        testMode = True
        data = {"username": "test", "password": "test"}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())
        data = {"id": user["id"], "mode": testMode}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = json.loads(profile_views.edit_profile_mode(request2).content.decode())
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["mode"] == testMode
        else:
            assert False

    def test_get_domains_for_user_integration(self):
        class MockUser:
            is_authenticated = True

        data = {"username": "test", "password": "test"}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())
        testDomainID = 3

        request1.user = MockUser()
        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        data = {"id": user["id"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = json.loads(
            profile_views.get_domains_for_user(request2).content.decode()
        )
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["domainIDs"] == [
                str(testDomainID)
            ]
        else:
            assert False

    def test_login_user_correct_credentials_integration(self):
        class MockUser:
            is_authenticated = False

        data = {"username": "test", "password": "test"}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())
        data = {"username": "test", "password": "test"}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request2)
        request2.session.save()
        request2.user = MockUser()
        result = json.loads(profile_views.login_user(request2).content.decode())
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"]
        else:
            assert False

    def test_login_user_incorrect_credentials_integrations(self):
        class MockUser:
            is_authenticated = False

        data = {"username": "testWrong", "password": "test"}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        result = json.loads(profile_views.login_user(request1).content.decode())
        if result["status"] == "SUCCESS":
            assert False
        else:
            assert True

    def test_logout_user_logged_in_integration(self):
        class MockUser:
            is_authenticated = True

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        result = json.loads(profile_views.logout_user(request1).content.decode())
        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    def test_logout_user_logged_out_integration(self):
        class MockUser:
            is_authenticated = False

        data = {}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        result = json.loads(profile_views.logout_user(request1).content.decode())
        if result["status"] == "SUCCESS":
            assert False
        else:
            assert True

    def test_change_password_integration(self):
        class MockUser:
            is_authenticated = True

        data = {"username": "test", "password": "test"}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())

        data = {"id": user["id"], "oldpassword": "test", "newpassword": "test2"}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = json.loads(profile_views.change_password(request2).content.decode())
        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    @mock.patch("utils.profilescrud.requests.post")
    def test_delete_user_integration(self, mocked_post):
        class MockUser:
            is_authenticated = True

        response = mock.MagicMock()
        response.status_code = 200
        response.json.return_value = {"status": "SUCCESS"}
        mocked_post.return_value = response

        data = {"username": "test", "password": "test"}
        request1 = HttpRequest()
        request1.method = "POST"
        request1._body = json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())
        data = {"id": user["id"], "username": "test", "password": "test"}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)

        user = authenticate(username="test", password="test")
        request2.user = user
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request2)
        request2.session.save()
        result = json.loads(profile_views.delete_user(request2).content.decode())

        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_profile_view(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        data = {"id": user["profileID"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = json.loads(profile_views.get_profile(request2).content.decode())
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["id"], user["profileID"])

    def test_get_profile_view_invalid(self):
        request2 = HttpRequest()
        request2.method = "GET"
        result = json.loads(profile_views.get_profile(request2).content.decode())
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "Invalid Request")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_user_by_id_view(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        data = {"id": user["profileID"]}
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps(data)
        request2.user = MockUser()
        result = json.loads(profile_views.get_user_by_id(request2).content.decode())
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["id"], user["id"])

    def test_get_user_by_id_view_invalid(self):
        request2 = HttpRequest()
        request2.method = "GET"
        result = json.loads(profile_views.get_user_by_id(request2).content.decode())
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "Invalid Request")

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_get_sources_for_domain_view(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1 = HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "test", "t@test.com")
        testDomainID = "3"

        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        testSourceID = "5"
        profilescrud.add_source_to_domain(user["id"], testDomainID, testSourceID)
        request2 = HttpRequest()
        request2.method = "POST"
        request2._body = json.dumps({"id": user["id"], "domain_id": testDomainID})
        result = json.loads(
            profile_views.get_sources_for_domain(request2).content.decode()
        )
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["id"], user["id"])
        self.assertEqual(result["domain_id"], testDomainID)
        self.assertIn(testSourceID, result["source_ids"])

    def test_get_sources_for_domain_view_invalid(self):
        request2 = HttpRequest()
        request2.method = "GET"
        result = json.loads(
            profile_views.get_sources_for_domain(request2).content.decode()
        )
        self.assertEqual(result["status"], "FAILURE")
        self.assertEqual(result["details"], "Invalid Request")

    # ----------------------------------------------------------------
