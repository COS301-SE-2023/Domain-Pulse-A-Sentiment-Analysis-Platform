from django.urls import path
from . import views

urlpatterns = [
    path("metrics/", views.get_sentiment_metrics)
]
