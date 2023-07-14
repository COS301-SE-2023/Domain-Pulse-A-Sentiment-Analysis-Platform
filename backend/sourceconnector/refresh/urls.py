from django.urls import path
from . import views

urlpatterns = [
    path("source/", views.refresh_source),
]
