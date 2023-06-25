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


def mocked_create_profile(dummy,dummy1,dummy2):
    profile = profile_models.Profiles(id=dummy,userID_id=dummy,mode=dummy2,profileIcon=dummy1,domainIDs=[])
    return profile




class ProfilesTests(TestCase):
    # -------------------------- UNIT TESTS --------------------------

    @mock.patch(
        "utils.profilescrud.create_profile", side_effect=mocked_create_profile
    )

    def test_create_user(self,mocked_create_profile):
        testUsername="test"
        testEmail="test@t.com"
        testPassword="testP"
        result = profilescrud.create_user(testUsername,testEmail,testPassword)
        if result["status"] == "SUCCESS":
            assert (result["profileID"].id == result["id"]
                and result["username"] == testUsername
                and result["email"] == testEmail
            )
        else:
            assert (False)

    def test_swap_mode(self):
        class MockUser:
            is_authenticated = True

        user = profilescrud.create_user("test","t@test.com","test")
        rf = RequestFactory()
        data={'id': user["id"]}
        post_request = rf.post('/profiles/swap_mode', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.swap_mode(post_request).content)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["mode"] == True
            )
        else:
            assert (False)

    def test_edit_profile_picture(self):
        class MockUser:
            is_authenticated = True

        user = profilescrud.create_user("test","t@test.com","test")
        rf = RequestFactory()
        testPictureURL="test.com"
        data={'id': user["id"], "pictureURL": testPictureURL}
        post_request = rf.post('/profiles/edit_profile_picture', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.edit_profile_picture(post_request).content)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["profileIcon"] == testPictureURL
            )
        else:
            assert (False)
        
    def test_edit_profile_mode(self):
        class MockUser:
            is_authenticated = True

        user = profilescrud.create_user("test","t@test.com","test")
        rf = RequestFactory()
        testMode=True
        data={'id': user["id"], "mode":testMode }
        post_request = rf.post('/profiles/edit_profile_mode', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.edit_profile_mode(post_request).content)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and result["mode"] ==testMode
            )
        else:
            assert (False)

    def test_add_domain_to_profile(self):
        class MockUser:
            is_authenticated = True

        user = profilescrud.create_user("test","t@test.com","test")
        rf = RequestFactory()
        testDomainID=3
        data={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/add_domain_to_profile', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.add_domain_to_profile(post_request).content)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and testDomainID in result["domainIDs"]
            )
        else:
            assert (False)

    def test_remove_domain_from_profile(self):
        class MockUser:
            is_authenticated = True

        user = profilescrud.create_user("test","t@test.com","test")
        rf = RequestFactory()

        testDomainID=3
        setupData={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/add_domain_to_profile', setupData, content_type='application/json')
        post_request.user = MockUser()
        profile_views.add_domain_to_profile(post_request)
        data={'id': user["id"], "domain_id":testDomainID }
        post_request = rf.post('/profiles/remove_domain_from_profile', data, content_type='application/json')
        post_request.user = MockUser()
        result=json.loads(profile_views.remove_domain_from_profile(post_request).content)
        if result["status"] == "SUCCESS":
            assert (result["id"] == user["id"]
                and testDomainID not in result["domainIDs"]
            )
        else:
            assert (False)

   

    
    

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------

    # def test_process_data_integration(self):
    #     test_data = []
    #     test_data += mock_data.bitcoin_article
    #     test_data += mock_data.the_witcher_reviews_reddit
    #     test_data += mock_data.lance_reddit_data
    #     test_data += mock_data.starbucks_rosebank_tripadvisor
    #     test_data += mock_data.leinster_loss_to_munster_insta
    #     test_data += [""]

    #     for t in test_data:
    #         assert len(t) >= len(preprocessing.process_data(t))

    # def test_analyse_content_integration(self):
    #     data = "This is some test data!"

    #     result = processing.analyse_content(data)

    #     assert result["data"] == data
    #     assert result["general"] != {}
    #     assert result["emotions"] != {}
    #     assert result["toxicity"] != {}
    #     assert result["ratios"] != {}

    # ----------------------------------------------------------------