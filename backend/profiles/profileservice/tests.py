from django.test import TestCase
from unittest import mock
# Create your tests here.
from django.test import TestCase, Client
from django.urls import reverse
from utils import profilescrud
from profileservice import models as profile_models



def mocked_create_profile(dummy,dummy1,dummy2):
    profile = profile_models.Profiles(id=dummy,userID_id=dummy,mode=dummy2,profileIcon=dummy1,domainIDs=[])
    return profile




class ProfilesTests(TestCase):
    # -------------------------- UNIT TESTS --------------------------

    @mock.patch(
        "util.profilescrud.create_profile", side_effect=mocked_create_profile
    )

    def test_create_user(self):
        testUsername="test"
        testEmail="test@t.com"
        testPassword="testP"
        result = profilescrud.create_user(testUsername,testEmail,testPassword)
        assert (
            (result["id"]).isnumeric()
            and result["profileID"] == result["id"]
            and result["username"] == testUsername
            and result["email"] == testEmail
        )

   

    
    

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