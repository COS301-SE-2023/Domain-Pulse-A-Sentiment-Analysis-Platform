from django.urls import path
from . import views

urlpatterns = [
    path("live_review/", views.ingest_live_review),
    path("post-review/<source_id>/<source_name>/", views.make_live_review),
    path("ingest_csv/", views.ingest_CSV_file),
    path("avail_ping/", views.ping),
]
