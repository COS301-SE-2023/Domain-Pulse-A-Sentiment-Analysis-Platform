from django.test import TestCase

# Create your tests here.
from django.test import TestCase, Client
from django.urls import reverse
from utils import domainscrud


class DomainsTests(TestCase):
    def test_add_domain(self):
        result = domainscrud.add_domain(2, "ReadDeadRedemption2", "testurl")
        exists = False
        for i in result["domains"]:
            if i["domain_name"] == "ReadDeadRedemption2":
                exists = True
        assert exists

    def test_get_domains(self):
        result = domainscrud.get_domains(2)
        assert result["user_id"] == 2
        assert result.get("domains")

    def test_remove_domain(self):
        result = domainscrud.remove_domain(2, 2)
        deleted = True
        for i in result["domains"]:
            if i["domain_name"] == "GodOfWar":
                deleted = False
        assert deleted

    def test_add_source(self):
        result = domainscrud.add_source(2, 3, "Reddit", "testurl")
        exists = False
        for i in result["domains"]:
            if i["domain_id"] == 2:
                for j in i["sources"]:
                    if j["source_name"] == "Reddit":
                        exists = True
        assert exists

    def test_remove_source(self):
        result = domainscrud.remove_source(3, 4, 8)
        deleted = True
        for i in result["domains"]:
            if i["domain_id"] == 4:
                for j in i["sources"]:
                    if j["source_id"] == 8:
                        deleted = False
        assert deleted

    def test_next_user_id(self):
        prevID = int(domainscrud.USER_ID_COUNTER)
        assert domainscrud.next_user_id() == (prevID + 1)

    def test_next_domain_id(self):
        prevID = domainscrud.DOMAIN_ID_COUNTER
        assert domainscrud.next_domain_id() == prevID + 1

    def test_next_source_id(self):
        prevID = domainscrud.SOURCE_ID_COUNTER
        assert domainscrud.next_source_id() == prevID + 1
