from django.urls import path
from . import views

urlpatterns = [
    path("login_user", views.login_user),
    path("logout_user", views.logout_user),
    path("change_password", views.change_password),
    path("delete_user", views.delete_user),
    path("create_user", views.create_user),
    # path("create_profile/<user_id>/<profileIcon>/<mode>", views.create_profile),
    path("swap_mode", views.swap_mode),
    path("edit_profile_picture", views.edit_profile_picture),
    path("edit_profile_mode", views.edit_profile_mode),
    path("get_profile", views.get_profile),
    path("get_domains_for_user", views.get_domains_for_user),
    path("get_user_by_id", views.get_user_by_id),
    path("get_sources_for_domain", views.get_sources_for_domain),
]

