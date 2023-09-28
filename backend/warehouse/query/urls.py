from django.urls import path
from . import views

urlpatterns = [
    path("get_source_dashboard/", views.get_dashboard_data_source),
    path("get_domain_dashboard/", views.get_dashboard_data_domain),
    path("get_report_data_internal/", views.get_report_data_internal),
    path("refresh_source/", views.refresh_source),
    path("try_refresh/", views.try_refresh),
]
