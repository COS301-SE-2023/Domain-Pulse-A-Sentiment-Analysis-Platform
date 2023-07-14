from django.urls import path
from . import views

urlpatterns = [
    path("youtube_video/", views.refresh_youtube_video),
    path("google_reviews/", views.refresh_google_reviews),
    path("tripadvisor/", views.refresh_tripadvisor),
]
