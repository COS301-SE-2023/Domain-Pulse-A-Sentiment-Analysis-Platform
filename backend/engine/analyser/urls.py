from django.urls import path
from . import views

urlpatterns = [
    path("compute/", views.perform_analysis),
    path("avail_ping/", views.ping),
]
