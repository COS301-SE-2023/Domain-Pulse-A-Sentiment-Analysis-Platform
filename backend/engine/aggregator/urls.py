from django.urls import path
from . import views

urlpatterns = [path("aggregate", views.aggregate_metrics)]
