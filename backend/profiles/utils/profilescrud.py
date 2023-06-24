from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from profileservice import models as profile_models

LIGHT = False
DARK = True
ID_COUNTER = 10

profiles_db = [
    {
        "id": 1,
        "mode": LIGHT,
        "profileIcon": "https://www.waterfront.co.za/wp-content/uploads/2018/05/mcdonalds.jpg",
        "domainIDs": ["1", "2"],
        "user_id":1,
    },
    {
        "id": 2,
        "mode": DARK,
        "profileIcon": "https://pbs.twimg.com/profile_images/1655865005370163207/o1wfCDc3_400x400.jpg",
        "domainIDs": ["3", "4"],
        "user_id":2,
    },
    {
        "id": 3,
        "mode": LIGHT,
        "profileIcon": "https://logos-world.net/wp-content/uploads/2022/12/Nandos-Logo.jpg",
        "domainIDs": ["5"],
        "user_id":3,
    }
]


def next_id():
    global ID_COUNTER
    ID_COUNTER += 1
    return ID_COUNTER


def create_user(uname,email,pword):
    user = User.objects.create_user(username=uname,
                                 email=email,
                                 password=pword)
    profile = create_profile(user,"https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg",LIGHT)
    return {"user_id":user.id, "username":user.username,"email":user.email,"password":user.password,"profileID":profile.id}

def create_profile(user_id, profileIcon, mode=LIGHT):
    
    # user_id = int(user_id)
    id = next_id()
    profile=profile_models.Profiles.objects.create( id = user_id.id,
        mode=mode, profileIcon=profileIcon, userID=user_id, domainIDs=[])
    
    return profile


def swap_mode(request,id):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        profile.mode= not bool(profile.mode)
        profile.save()
        return {"id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def edit_profile_picture(request,id, pictureURL):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        profile.profileIcon=pictureURL 
        profile.save()
        return {"id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def edit_profile_mode(id, mode):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        profile.mode= mode
        profile.save()
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
        return {"id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
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
        return {"id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def get_domains_for_user(request,id):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        return {"id":profile.id, "domainIDs":profile.domainIDs}
    else:
        return {"status":"FAILURE"}


def get_profile(request,id):
    if request.user.is_authenticated:
        id = int(id)
        profile= profile_models.Profiles.objects.get(id=id)
        return {"id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}

def login_user(request,username,password):
    if not request.user.is_authenticated:
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request,user)
            return {"status": "SUCCESS"}
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
        return {"status": "SUCCESS"}
    else:
        return {"status": "FAILURE"}

