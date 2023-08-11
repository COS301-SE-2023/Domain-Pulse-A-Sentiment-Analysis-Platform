"""
Django settings for profiles project.

Generated by 'django-admin startproject' using Django 4.2.1.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import datetime

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

ENV_FILE = BASE_DIR.parent / ".env"
DATABASE_ENV_FILE = BASE_DIR.parent / ".postgresql.env"
load_dotenv(ENV_FILE)
load_dotenv(DATABASE_ENV_FILE)

RUNSERVER_PORT = os.getenv("DJANGO_PROFILES_PORT")

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    '127.0.0.1',
    "localhost",
    "154.73.32.89",
    ".domainpulse.app",
    ".dp.cos301.thuthuka.me",
]

CORS_ORIGIN_ALLOW_ALL = False
CORS_ORIGIN_WHITELIST = (
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "http://154.73.32.89",
    "http://154.73.32.89:4200",
)
CORS_ORIGIN_REGEX_WHITELIST = (
    "^(https?:\/\/)?((\w(-\w)*)+\.)*thuthuka\.me$",
    "^(https?:\/\/)?((\w(-\w)*)+\.)*domainpulse\.app$",
)

CORS_ALLOW_CREDENTIALS = True

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "profileservice",
    "check_auth",
    "reportgenerator",
    "corsheaders",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

ROOT_URLCONF = "profiles.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "profiles.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

from sshtunnel import SSHTunnelForwarder

local_port_to_connect_to = -1
if os.getenv("USE_TUNNEL") != "False":

    # setup ssh tunnel
    ssh_tunnel = SSHTunnelForwarder(
        os.getenv("DB_TUNNEL_HOST"),
        ssh_username=os.getenv("DB_TUNNEL_USERNAME"),
        ssh_pkey=os.getenv("DB_TUNNEL_PRIVATE_KEY"),
        remote_bind_address=("127.0.0.1", int(os.getenv("SQL_DATABASE_PORT"))),
    )

    ssh_tunnel.start()
    print("SSH tunnel started")

    local_port_to_connect_to = ssh_tunnel.local_bind_port
else:
    local_port_to_connect_to = int(os.getenv("SQL_DATABASE_PORT"))

DATABASES = {
    # "default": {
    #     "ENGINE": "django.db.backends.postgresql",
    #     "NAME": os.getenv("SQL_DATABASE_NAME"),
    #     "USER": os.getenv("SQL_DATABASE_USER"),
    #     "PASSWORD": os.getenv("SQL_DATABASE_PASS"),
    #     "HOST": "localhost",
    #     "PORT": "5432",
    # },
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": os.getenv("SQL_DATABASE_HOST"),
        "PORT": local_port_to_connect_to,
        "NAME": os.getenv("SQL_DATABASE_NAME"),
        "USER": os.getenv("SQL_DATABASE_USER"),
        "PASSWORD": os.getenv("SQL_DATABASE_PASS"),
    },
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# SECRET KEY
SECRET_KEY = os.getenv("SECRET_KEY")


# JWT Authentication Settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": datetime.timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": datetime.timedelta(days=1),
}
