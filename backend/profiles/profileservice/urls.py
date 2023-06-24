from django.urls import path
from . import views

urlpatterns = [
    path("login_user",views.login_user),
    path("logout_user",views.logout_user),

    path("create_user",views.create_user),
    path("create_profile/<user_id>/<profileIcon>/<mode>", views.create_profile),
    path("swap_mode/<id>", views.swap_mode),
    path("edit_profile_picture/<id>/<pictureURL>", views.edit_profile_picture),
    path("edit_profile_mode/<id>/<mode>", views.edit_profile_mode),
    path("get_profile/<id>", views.get_profile),
    path("add_domain_to_profile/<id>/<domain_id>", views.add_domain_to_profile),
    path("remove_domain_from_profile/<id>/<domain_id>", views.remove_domain_from_profile),
    path("get_domains_for_user/<id>", views.get_domains_for_user)
]