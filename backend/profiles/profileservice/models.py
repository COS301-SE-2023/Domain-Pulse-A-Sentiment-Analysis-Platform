from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import User

# Create your models here.


class Profiles(models.Model):
    userID = models.ForeignKey(User, on_delete=models.CASCADE)
    id = models.AutoField(primary_key=True)
    mode = models.BooleanField()
    profileIcon = models.URLField(max_length=200)
    domainIDs = ArrayField(models.IntegerField())
    # userID = models.TextField(max_length=10)

class Domains(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.TextField(max_length=200)
    description = models.TextField(max_length=200)
    icon = models.URLField(max_length=200)
    sources = ArrayField(models.IntegerField())
