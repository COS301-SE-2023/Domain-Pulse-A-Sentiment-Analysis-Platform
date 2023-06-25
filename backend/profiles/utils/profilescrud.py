from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from profileservice import models as profile_models

LIGHT = False
DARK = True



def create_user(uname,email,pword):
    user = User.objects.create_user(username=uname,
                                 email=email,
                                 password=pword)
    profile = create_profile(user,"https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg",LIGHT)
    return {"status":"SUCCESS","id":user.id, "username":user.username,"email":user.email,"password":user.password,"profileID":profile.id}

def create_profile(user_id, profileIcon, mode=LIGHT):
    
    # user_id = int(user_id)
    profile=profile_models.Profiles.objects.create( id = user_id.id,
        mode=mode, profileIcon=profileIcon, userID=user_id, domainIDs=[])
    
    return profile


def swap_mode(request,id):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        profile.mode= not bool(profile.mode)
        profile.save()
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def edit_profile_picture(request,id, pictureURL):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        profile.profileIcon=pictureURL 
        profile.save()
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def edit_profile_mode(request,id, mode):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        profile.mode= mode
        profile.save()
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}

def change_password(request,id,oldpass,newpass):
    if request.user.is_authenticated:
        id = int(id)
        user= User.objects.get(id=id)
        if user.check_password(oldpass):
            user.set_password(newpass)
            user.save()
            return {"status":"SUCCESS"}
        else:
            return {"status":"FAILURE"}
    else:
            return {"status":"FAILURE"}
        


def add_domain_to_profile(request,id, domain_id):
    if request.user.is_authenticated:
        id = int(id)
        domain_id = int(domain_id)
        profile= profile_models.Profiles.objects.get(id=id)
        if domain_id not in profile.domainIDs:
            profile.domainIDs.append(domain_id)
            profile.save()
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def remove_domain_from_profile(request,id, domain_id):
    if request.user.is_authenticated:
        id = int(id)
        domain_id = int(domain_id)
        profile= profile_models.Profiles.objects.get(id=id)
        if domain_id in profile.domainIDs:
            profile.domainIDs.remove(domain_id)
            profile.save()
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def get_domains_for_user(request,id):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        return {"status":"SUCCESS","id":profile.id, "domainIDs":profile.domainIDs}
    else:
        return {"status":"FAILURE"}


def get_profile(request,id):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}

def login_user(request,username,password):
    if not request.user.is_authenticated:
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request,user)
            return {"status": "SUCCESS", "id":user.id}
        else:
            return {"status": "FAILURE"}
    else:
            return {"status": "FAILURE"}

def logout_user(request):
    if request.user.is_authenticated:
        logout(request)
        return {"status": "SUCCESS"}
    else:
        return {"status": "FAILURE"}

def delete_user(request,username,password):
    if request.user.is_authenticated:
        user = User.objects.get(username = username)
        
        if request.user == user:
            if user.check_password(password):
                user.delete()
                logout(request)
                return {"status": "SUCCESS"}
            else:
                return {"status": "FAILURE"}
        else:
            return {"status": "FAILURE"}
    else:
        return {"status": "FAILURE"}

