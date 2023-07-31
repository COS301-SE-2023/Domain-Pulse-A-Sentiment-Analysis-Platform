from django.urls import path
from . import views

urlpatterns = [
    path("source_ids/", views.check_source_ids),
    path("domain_ids/", views.check_domain_ids),
    path("source_ids_and_remove_source/",views.check_source_ids_and_remove_source),
    path("add_domain/",views.add_domain),
    path("add_source/",views.add_source),
    path("domain_ids_and_remove_domain/",views.check_domain_ids_and_remove_domain),
    path("check_logged_in/",views.check_logged_in),
]
