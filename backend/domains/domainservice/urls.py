from django.urls import path
from . import views

urlpatterns = [
    path("create_domain", views.create_domain),
    path("delete_domain",views.delete_domain),
]
