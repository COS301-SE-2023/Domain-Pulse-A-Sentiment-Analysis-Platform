from django.urls import path
from . import views

urlpatterns = [
    path("source/", views.refresh_source),
    path("avail_ping/", views.ping),
]
