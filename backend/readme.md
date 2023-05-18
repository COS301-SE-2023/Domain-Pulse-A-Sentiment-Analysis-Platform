## How to set up environment

pipenv install django (install django and dependencies)
pipenv shell (to take you into the virtual environment in the terminal - all command must be issues from the venv)

## To run servers (locally)

In the appropriate directory and in seperate terminals, issue:
For the warehouse: python manage.py runserver localhost:8000
For the engine: python manage.py runserver localhost:8001
For the profilemanager: python manage.py runserver localhost:8002
Note: Make sure you issue the commands from the venv (ie: pipenv shell -> cd projectname)

## Some terminology

Project refers to a django project, they are: profilemanager, warehouse and engine
An 'app' in django is effectively a service, each project has multiple apps/services
This is where is gets really weird. In django a 'view' refers to a request/response (unlike the V in MVC)

## To create a new service

In the appropriate directory and in seperate terminals, issue:
python manage.py startapp servicename

## Setting up endpoints to those services

In the specific app, in the views.py you define functions, each of which corresponding to a different request/response
The function needs to take a request as a parameter, and returns a JSON response.
To create the actual endpoint/url, first in the relevant app, create a urls.py (if it does not already exist)
In that urls.py, add the following:

from django.urls import path
from . import views

urlpatterns = [
path("endpointname/", views.function_name)
]

In the main app of the project (ie: the one of the same name of the project), register the app in the settings.py of warehouse|engine|profilemanager (in INSTALLED_APPS).

Next update the urls.py in the main app. It will look something like this:

urlpatterns = [
path('admin/', admin.site.urls),
path('appname/', include('appname.urls'))
]

You are now good to go! Test it by running the django project and using your browser to make a request to that endpoint
