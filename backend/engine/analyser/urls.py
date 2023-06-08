from django.urls import path
from . import views

urlpatterns = [
    path("metrics/<source_id>", views.get_sentiment_metrics),
    # path("testing_preprocessing", views.testing_preprocessing),
]
