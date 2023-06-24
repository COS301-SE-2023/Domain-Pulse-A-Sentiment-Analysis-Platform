from django.urls import path
from . import views

urlpatterns = [
    path("instagram/<source_id>", views.refresh_instagram_source),
    path("googlereviews/<source_id>", views.refresh_google_reviews_source),
]
