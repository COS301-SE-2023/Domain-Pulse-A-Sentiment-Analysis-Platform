from django.urls import path
from . import views

urlpatterns = [path("live_review/", views.ingest_live_review)]
