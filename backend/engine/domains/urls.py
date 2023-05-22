from django.urls import path
from . import views

urlpatterns = [
    path("add_domain/<user_id>/<domain_name>/<domain_image_name>", views.add_domain),
    path("remove_domain/<user_id>/<domain_id>", views.remove_domain),
    path("add_source/<user_id>/<domain_id>/<source_name>/<source_image_name>", views.add_source),
    path("remove_source/<user_id>/<domain_id>/<source_id>", views.remove_source),
    path("get_domains/<user_id>", views.get_domains)
]