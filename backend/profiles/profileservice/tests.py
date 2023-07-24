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

    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    def test_create_user(self, mocked_create_profile, mocked_login):
        testUsername = "test"
        testEmail = "test@t.com"
        testPassword = "testP"
        request= HttpRequest()
        request.method = "POST"
       
        result = profilescrud.create_user(
            request, testUsername, testEmail, testPassword
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
    def test_swap_mode(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True
        request1= HttpRequest()
        request1.method = "POST"
        user = profilescrud.create_user(request1, "test", "t@test.com", "test")
        data = {"id": user["profileID"]}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.swap_mode(request2, user["profileID"])
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["mode"] == True
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_edit_profile_picture(self, mocked_create_profile, mocked_login):
        class MockUser:
            is_authenticated = True

        request1= HttpRequest()
        request1.method = "POST"

        user = profilescrud.create_user(request1, "test", "t@test.com", "test")
        testPictureURL = "test.com"
        data = {"id": user["id"], "pictureURL": testPictureURL}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.edit_profile_picture(
            request2, user["id"], testPictureURL
        )
        if result["status"] == "SUCCESS":
            assert (
                result["id"] == user["id"] and result["profileIcon"] == testPictureURL
            )
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_edit_profile_mode(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        testMode = True
        data = {}
        request1= HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "t@test.com", "test")
        data = {"id": user["id"], "mode": testMode}
        
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
        request2.user = MockUser()

        result = profilescrud.edit_profile_mode(request2, user["id"], testMode)
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["mode"] == testMode
        else:
            assert False

    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_add_domain_to_profile(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1= HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "t@test.com", "test")
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
    def test_remove_domain_from_profile(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1= HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "t@test.com", "test")
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
    def test_get_domains_for_user(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        request1= HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "t@test.com", "test")
        testDomainID = 3
        
        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        data = {"id": user["id"]}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
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
    def test_login_user_correct_credentials(self, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = False

        request1= HttpRequest()
        request1.method = "POST"
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "t@test.com", "test")
        testUsername = "test"
        testPassword = "test"
        data = {"username": "test", "password": "test"}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
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
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
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
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
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
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
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

        rf = RequestFactory()
        data = {}
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "t@test.com", "test")
        testId = user["id"]
        testOldPassword = "test"
        testNewPassword = "test2"
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
        request2.user = MockUser()
        result = profilescrud.change_password(
            request2, testId, testOldPassword, testNewPassword
        )
        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    @mock.patch("utils.profilescrud.logout", side_effect=mocked_logout)
    @mock.patch("utils.profilescrud.login", side_effect=mocked_login)
    @mock.patch("utils.profilescrud.create_profile", side_effect=mocked_create_profile)
    def test_delete_user(self, mocked_logout, mocked_login, mocked_create_profile):
        class MockUser:
            is_authenticated = True

        data = {}
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        request1.user = MockUser()
        user = profilescrud.create_user(request1, "test", "t@test.com", "test")
        testUsername = "test"
        testPassword = "test"
        data = {"username":user["id"], "oldpassword":"test", "newpassword":"test2"}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
        
        user = authenticate(username="test", password="test")
        request2.user = user
        result = profilescrud.delete_user(request2, testUsername, testPassword)
        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------

    def test_create_profile_integration(self):
        testUsername = "test"
        testEmail = "test@t.com"
        testPassword = "testP"
        data = {"username": testUsername, "email": testEmail, "password": testPassword}
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        result = json.loads(profile_views.create_user(request1).content.decode())
        if result["status"] == "SUCCESS":
            assert (
                result["profileID"] == result["id"]
                and result["username"] == testUsername
                and result["email"] == testEmail
            )
        else:
            assert False

    def test_swap_mode_integration(self):
        class MockUser:
            is_authenticated = True

        data = {"username": "test", "email": "test@t.com", "password": "test"}
        self.client.login(username="test", password="test")
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        user = profile_views.create_user(request1).content.decode()
        user = json.loads(user)
        data = {"id": user["profileID"]}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
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

        data = {"username": "test", "email": "test@t.com", "password": "test"}
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        user = json.loads(profile_views.create_user(request1).content.decode())
        testPictureURL = "test.com"
        data = {"id": user["id"], "pictureURL": testPictureURL}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
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
        data = {"username": "test", "email": "test@t.com", "password": "test"}
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())
        data = {"id": user["id"], "mode": testMode}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
        request2.user = MockUser()
        result = json.loads(
            profile_views.edit_profile_mode(request2).content.decode()
        )
        if result["status"] == "SUCCESS":
            assert result["id"] == user["id"] and result["mode"] == testMode
        else:
            assert False

    def test_get_domains_for_user_integration(self):
        class MockUser:
            is_authenticated = True

        data = {"username": "test", "email": "test@t.com", "password": "test"}
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())
        testDomainID = 3

        request1.user = MockUser()
        profilescrud.add_domain_to_profile(user["id"], testDomainID)
        data = {"id": user["id"]}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
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

        data = {"username": "test", "email": "test@t.com", "password": "test"}
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())
        data = {"username": "test", "password": "test"}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
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
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
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
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
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
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
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

        data = {"username": "test", "email": "test@t.com", "password": "test"}
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())

        data = {"id": user["id"], "oldpassword": "test", "newpassword": "test2"}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
        request2.user = MockUser()
        result = json.loads(
            profile_views.change_password(request2).content.decode()
        )
        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    def test_delete_user_integration(self):
        class MockUser:
            is_authenticated = True

        data = {"username": "test", "email": "test@t.com", "password": "test"}
        request1= HttpRequest()
        request1.method = "POST"
        request1._body=json.dumps(data)
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request1)
        request1.session.save()
        request1.user = MockUser()
        user = json.loads(profile_views.create_user(request1).content.decode())
        data = {"id": user["id"], "username": "test", "password": "test"}
        request2= HttpRequest()
        request2.method = "POST"
        request2._body=json.dumps(data)
        
        user = authenticate(username="test", password="test")
        request2.user  = user
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request2)
        request2.session.save()
        result = json.loads(profile_views.delete_user(request2).content.decode())

        if result["status"] == "SUCCESS":
            assert True
        else:
            assert False

    # ----------------------------------------------------------------
