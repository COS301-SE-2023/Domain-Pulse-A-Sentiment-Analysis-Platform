from django.urls import path
from . import views

urlpatterns = [
    path("create_domain", views.create_domain),
    path("delete_domain", views.delete_domain),
    path("get_domain", views.get_domain),
    path("add_source", views.add_source),
    path("remove_source", views.remove_source),
    path("create_param", views.create_param),
    path("delete_param", views.delete_param),
    path("get_source", views.get_source),
    path("update_last_refresh", views.update_last_refresh),
    path("edit_domain", views.edit_domain),
    path("edit_source", views.edit_source),
]
