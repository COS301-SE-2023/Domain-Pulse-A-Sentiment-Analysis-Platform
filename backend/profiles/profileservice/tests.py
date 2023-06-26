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


def mocked_create_profile(dummy,dummy1,dummy2):
    profile = profile_models.Profiles.objects.create(id=dummy.id,userID_id=dummy.id,mode=dummy2,profileIcon=dummy1,domainIDs=[])
    return profile

def mocked_login(dummy,dummy1):
    return {}

def mocked_logout(dummy):
    return {}

class ProfilesTests(TestCase):
    # -------------------------- UNIT TESTS --------------------------

    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)

    def test_create_user(self,mocked_create_profile,mocked_login):
        testUsername="test"
        testEmail="test@t.com"
        testPassword="testP"
        rf = RequestFactory()
        data={}
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        result = profilescrud.create_user(post_request,testUsername,testEmail,testPassword)
        if result["status"] == "SUCCESS":
            assert (result["profileID"] == result["id"]
                and result["username"] == testUsername
                and result["email"] == testEmail
            )
        else:
            assert (False)

    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_swap_mode(self,mocked_create_profile,mocked_login):
        class MockUser:
            is_authenticated = True

        rf = RequestFactory()
        data={}
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        user = profilescrud.create_user(post_request,"test","t@test.com","test")
        data={'id': user["profileID"]}
        post_request = rf.post('/profiles/swap_mode', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.swap_mode(post_request,user["profileID"])
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["mode"] == True
            )
        else:
            assert (False)

    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_edit_profile_picture(self,mocked_create_profile,mocked_login):
        class MockUser:
            is_authenticated = True

        rf = RequestFactory()
        data={}
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        user = profilescrud.create_user(post_request,"test","t@test.com","test")
        testPictureURL="test.com"
        data={'id': user["id"], "pictureURL": testPictureURL}
        post_request = rf.post('/profiles/edit_profile_picture', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.edit_profile_picture(post_request,user["id"],testPictureURL)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["profileIcon"] == testPictureURL
            )
        else:
            assert (False)
        
    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_edit_profile_mode(self,mocked_login,mocked_create_profile):
        class MockUser:
            is_authenticated = True

        rf = RequestFactory()
        testMode=True
        data={ }
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        post_request.user = MockUser()
        user = profilescrud.create_user(post_request,"test","t@test.com","test")
        data={'id': user["id"], "mode":testMode }
        post_request = rf.post('/profiles/edit_profile_mode', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.edit_profile_mode(post_request,user["id"],testMode)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["mode"] ==testMode
            )
        else:
            assert (False)

    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_add_domain_to_profile(self,mocked_login,mocked_create_profile):
        class MockUser:
            is_authenticated = True

        rf = RequestFactory()
        data={ }
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        post_request.user = MockUser()
        user = profilescrud.create_user(post_request,"test","t@test.com","test")
        testDomainID=3
        data={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/add_domain_to_profile', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.add_domain_to_profile(post_request,user["id"],testDomainID)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and testDomainID in result["domainIDs"]
            )
        else:
            assert (False)

    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_remove_domain_from_profile(self,mocked_login,mocked_create_profile):
        class MockUser:
            is_authenticated = True

        rf = RequestFactory()
        data={ }
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        post_request.user = MockUser()
        user = profilescrud.create_user(post_request,"test","t@test.com","test")
        testDomainID=3
        setupData={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/add_domain_to_profile', setupData, content_type='application/json')
        post_request.user = MockUser()
        profilescrud.add_domain_to_profile(post_request,user["id"],testDomainID)
        data={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/remove_domain_from_profile', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.remove_domain_from_profile(post_request,user["id"],testDomainID)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and testDomainID not in result["domainIDs"]
            )
        else:
            assert (False)


    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_get_domains_for_user(self,mocked_login,mocked_create_profile):
        class MockUser:
            is_authenticated = True
            

        rf = RequestFactory()
        data={ }
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        post_request.user = MockUser()
        user = profilescrud.create_user(post_request,"test","t@test.com","test")
        testDomainID=3
        setupData={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/add_domain_to_profile', setupData, content_type='application/json')
        post_request.user = MockUser()
        profilescrud.add_domain_to_profile(post_request,user["id"],testDomainID)
        data={'id': user["id"] }
        post_request = rf.post('/profiles/get_domains_for_user', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.get_domains_for_user(post_request,user["id"])
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["domainIDs"]==[testDomainID]
            )
        else:
            assert (False)
    
   
    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_login_user_correct_credentials(self,mocked_login,mocked_create_profile):
        class MockUser:
            is_authenticated = False

        rf = RequestFactory()
        data={ }
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        post_request.user = MockUser()
        user = profilescrud.create_user(post_request,"test","t@test.com","test")
        testUsername="test"
        testPassword="test"
        data={'username':'test','password':'test' }
        post_request = rf.post('/profiles/login_user', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.login_user(post_request,testUsername,testPassword)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"])
        else:
            assert (False)

    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_login_user_incorrect_credentials(self,mocked_login,mocked_create_profile):
        class MockUser:
            is_authenticated = False

        rf = RequestFactory()
        testUsername="testWrong"
        testPassword="test"
        data={'username':'testWrong','password':'test' }
        post_request = rf.post('/profiles/login_user', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.login_user(post_request,testUsername,testPassword)
        if result["status"] == "SUCCESS":
            assert (False)
        else:
            assert (True)

    @mock.patch('utils.profilescrud.logout', side_effect=mocked_logout)
    def test_logout_user_logged_in(self,mocked_logout):
        class MockUser:
            is_authenticated = True
        rf = RequestFactory()
        data={}
        post_request = rf.post('/profiles/logout_user', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.logout_user(post_request)
        if result["status"] == "SUCCESS":
            assert (True)
        else:
            assert (False)

    @mock.patch('utils.profilescrud.logout', side_effect=mocked_logout)
    def test_logout_user_logged_out(self,mocked_logout):
        class MockUser:
            is_authenticated = False
        rf = RequestFactory()
        data={}
        post_request = rf.post('/profiles/logout_user', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.logout_user(post_request)
        if result["status"] == "SUCCESS":
            assert (False)
        else:
            assert (True)

    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_change_password(self,mocked_login,mocked_create_profile):
        class MockUser:
            is_authenticated = True
        rf = RequestFactory()
        data={ }
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        post_request.user = MockUser()
        user = profilescrud.create_user(post_request,"test","t@test.com","test")
        testId=user["id"]
        testOldPassword="test"
        testNewPassword="test2"
        data={user["id"],"test","test2"}
        post_request = rf.post('/profiles/change_password', data, content_type='application/json')
        post_request.user = MockUser()
        result=profilescrud.change_password(post_request,testId,testOldPassword,testNewPassword)
        if result["status"] == "SUCCESS":
            assert (True)
        else:
            assert (False)

    @mock.patch('utils.profilescrud.logout', side_effect=mocked_logout)
    @mock.patch('utils.profilescrud.login', side_effect=mocked_login)
    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )
    def test_delete_user(self,mocked_logout,mocked_login,mocked_create_profile):
        class MockUser:
            is_authenticated = True
            user=None
            def setUser(self,user):
               self.user=user
        rf = RequestFactory()
        data={ }
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        post_request.user = MockUser()
        user = profilescrud.create_user(post_request,"test","t@test.com","test")
        testId=user["id"]
        testOldPassword="test"
        testNewPassword="test2"
        data={user["id"],"test","test2"}
        post_request = rf.post('/profiles/delete_user', data, content_type='application/json')
        temp = MockUser()
        temp.setUser(user)
        post_request.user = temp

        result=profilescrud.change_password(post_request,testId,testOldPassword,testNewPassword)
        if result["status"] == "SUCCESS":
            assert (True)
        else:
            assert (False)
   
    
    

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------

    def test_create_profile_integration(self):
        testUsername="test"
        testEmail="test@t.com"
        testPassword="testP"
        rf = RequestFactory()
        data={"username":testUsername,"email":testEmail,"password":testPassword}
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(post_request)
        post_request.session.save()
        result = json.loads(profile_views.create_user(post_request).content.decode())
        if result["status"] == "SUCCESS":
            assert (result["profileID"] == result["id"]
                and result["username"] == testUsername
                and result["email"] == testEmail
            )
        else:
            assert (False)

    def test_swap_mode_integration(self):
        class MockUser:
            is_authenticated = True
        
        rf = RequestFactory()
        data={"username":"test","email":"test@t.com","password":"test"}
        self.client.login(username='test', password='test')
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(post_request)
        post_request.session.save()
        user = profile_views.create_user(post_request).content.decode()
        user = json.loads(user)
        data={'id': user["profileID"]}
        post_request = rf.post('/profiles/swap_mode', data, content_type='application/json')
        post_request.user = MockUser()
        result=profile_views.swap_mode(post_request).content.decode()
        result=json.loads(result)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["mode"] == True
            )
        else:
            assert (False)

    def test_edit_profile_picture_integration(self):
        class MockUser:
            is_authenticated = True

        rf = RequestFactory()
        data={"username":"test","email":"test@t.com","password":"test"}
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(post_request)
        post_request.session.save()
        user = json.loads(profile_views.create_user(post_request).content.decode())
        testPictureURL="test.com"
        data={'id': user["id"], "pictureURL": testPictureURL}
        post_request = rf.post('/profiles/edit_profile_picture', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.edit_profile_picture(post_request).content.decode())
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["profileIcon"] == testPictureURL
            )
        else:
            assert (False)

    def test_edit_profile_mode_integration(self):
        class MockUser:
            is_authenticated = True

        rf = RequestFactory()
        testMode=True
        data={"username":"test","email":"test@t.com","password":"test"}
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(post_request)
        post_request.session.save()
        post_request.user = MockUser()
        user = json.loads(profile_views.create_user(post_request).content.decode())
        data={'id': user["id"], "mode":testMode }
        post_request = rf.post('/profiles/edit_profile_mode', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.edit_profile_mode(post_request).content.decode())
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["mode"] ==testMode
            )
        else:
            assert (False)

    def test_add_domain_to_profile_integration(self):
        class MockUser:
            is_authenticated = True

        rf = RequestFactory()
        data={"username":"test","email":"test@t.com","password":"test"}
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(post_request)
        post_request.session.save()
        post_request.user = MockUser()
        user = json.loads(profile_views.create_user(post_request).content.decode())
        testDomainID=3
        data={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/add_domain_to_profile', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.add_domain_to_profile(post_request).content.decode())
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and testDomainID in result["domainIDs"]
            )
        else:
            assert (False)

    def test_remove_domain_from_profile_integration(self):
        class MockUser:
            is_authenticated = True

        rf = RequestFactory()
        data={"username":"test","email":"test@t.com","password":"test"}
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(post_request)
        post_request.session.save()
        post_request.user = MockUser()
        user = json.loads(profile_views.create_user(post_request).content.decode())
        testDomainID=3
        setupData={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/add_domain_to_profile', setupData, content_type='application/json')
        post_request.user = MockUser()
        profile_views.add_domain_to_profile(post_request)
        data={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/remove_domain_from_profile', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.remove_domain_from_profile(post_request).content.decode())
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and testDomainID not in result["domainIDs"]
            )
        else:
            assert (False)

    def test_get_domains_for_user_integration(self):
        class MockUser:
            is_authenticated = True
            

        rf = RequestFactory()
        data={"username":"test","email":"test@t.com","password":"test"}
        post_request = rf.post('/profiles/create_user', data, content_type='application/json')
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(post_request)
        post_request.session.save()
        post_request.user = MockUser()
        user = json.loads(profile_views.create_user(post_request).content.decode())
        testDomainID=3
        setupData={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/add_domain_to_profile', setupData, content_type='application/json')
        post_request.user = MockUser()
        profile_views.add_domain_to_profile(post_request)
        data={'id': user["id"] }
        post_request = rf.post('/profiles/get_domains_for_user', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.get_domains_for_user(post_request).content.decode())
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["domainIDs"]==[testDomainID]
            )
        else:
            assert (False)

    # ----------------------------------------------------------------