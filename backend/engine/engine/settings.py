"""
Django settings for engine project.

Generated by 'django-admin startproject' using Django 4.2.1.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ENV DIR is 2 parent directories up from BASE_DIR
ENV_FILE = BASE_DIR.parent / ".env"
load_dotenv(ENV_FILE)

RUNSERVER_PORT = os.getenv("DJANGO_ENGINE_PORT")

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    "154.73.32.89",
    ".domainpulse.app",
    ".dp.cos301.thuthuka.me",
    "dev-domains",
    "dev-engine",
    "dev-profiles",
    "dev-sourceconnector",
    "dev-warehouse",
    "prod-domains",
    "prod-engine",
    "prod-profiles",
    "prod-sourceconnector",
    "prod-warehouse",
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

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "analyser",
    "aggregator",
    "corsheaders",
]


def append_installed_apps(enabled):
    if enabled == "True":
        INSTALLED_APPS.append("elasticapm.contrib.django")


APM_ENABLED = os.getenv("APM_ENABLED")
append_installed_apps(APM_ENABLED)

ELASTIC_APM = {
    "DEBUG": False,
    "LOG_LEVEL": "debug",
    "SERVER_URL": os.getenv("APM_SERVER_URL"),
    "SERVICE_NAME": "engine",
    "SECRET_TOKEN": os.getenv("APM_TOKEN"),
}

MIDDLEWARE = [
    'elasticapm.contrib.django.middleware.Catch404Middleware',
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

ROOT_URLCONF = "engine.urls"

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

WSGI_APPLICATION = "engine.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
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
