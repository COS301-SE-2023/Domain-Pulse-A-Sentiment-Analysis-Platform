from django.urls import path
from . import views

urlpatterns = [
    path("source_ids/", views.check_source_ids),
    path("domain_ids/", views.check_domain_ids),
    path("source_ids_and_remove_source/",views.check_source_ids_and_remove_source)
]
