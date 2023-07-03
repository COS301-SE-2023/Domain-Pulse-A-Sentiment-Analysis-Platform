from django.urls import path
from . import views

urlpatterns = [
    path("create_domain", views.create_domain),
    path("delete_domain",views.delete_domain),
    path("get_domain",views.get_domain),
    path("add_source",views.add_source),


]
