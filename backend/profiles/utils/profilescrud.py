from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from profileservice import models as profile_models
from django.core.exceptions import ObjectDoesNotExist
 
LIGHT = False
DARK = True



def create_user(request,uname,email,pword):
    user = User.objects.create_user(username=uname,
                                 email=email,
                                 password=pword)
    profile = create_profile(user,"https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg",LIGHT)
    login(request, user)
    return {"status":"SUCCESS","id":user.id, "username":user.username,"email":user.email,"password":user.password,"profileID":profile.id}

def create_profile(user_id, profileIcon, mode=LIGHT):
    
    # user_id = int(user_id)
    profile=profile_models.Profiles.objects.create( id = user_id.id,
        mode=mode, profileIcon=profileIcon, userID=user_id)
    
    return profile


def swap_mode(request,id):
    if request.user.is_authenticated:
        id = int(id)
        profile = None
        try:
            profile= profile_models.Profiles.objects.get(id=id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        profile.mode= not bool(profile.mode)
        profile.save()
        domain_list=[]
        for i in profile.domainIDs.all().values_list('id',flat=True):
            domain_list.append(i)
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":domain_list,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def edit_profile_picture(request,id, pictureURL):
    if request.user.is_authenticated:
        id = int(id)
        profile = None
        try:
            profile= profile_models.Profiles.objects.get(id=id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        profile.profileIcon=pictureURL 
        profile.save()
        domain_list=[]
        for i in profile.domainIDs.all().values_list('id',flat=True):
            domain_list.append(i)
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":domain_list,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def edit_profile_mode(request,id, mode):
    if request.user.is_authenticated:
        id = int(id)
        profile = None
        try:
            profile= profile_models.Profiles.objects.get(id=id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        profile.mode= mode
        profile.save()
        domain_list=[]
        for i in profile.domainIDs.all().values_list('id',flat=True):
            domain_list.append(i)
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":domain_list,"userID":profile.userID_id}
    else:
        return {"id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":profile.domainIDs,"userID":profile.userID_id}

def change_password(request,id,oldpass,newpass):
    if request.user.is_authenticated:
        id = int(id)
        user=None
        try:
            user= User.objects.get(id=id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
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
        profile = None
        try:
            profile= profile_models.Profiles.objects.get(id=id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        domain=profile_models.Domains.objects.create(id=domain_id,sourceIDs=[])
        profile.domainIDs.add(domain)
        domain_list=[]
        for i in profile.domainIDs.all().values_list('id',flat=True):
            domain_list.append(i)
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":domain_list,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def remove_domain_from_profile(request,id, domain_id):
    if request.user.is_authenticated:
        id = int(id)
        profile = None
        try:
            profile= profile_models.Profiles.objects.get(id=id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        
        domain = None
        try:
            domain=profile_models.Domains.objects.get(id=domain_id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No domain exists"}
        profile.domainIDs.remove(domain)
        domain.delete()
        profile.save()
        domain_list=[]
        for i in profile.domainIDs.all().values_list('id',flat=True):
            domain_list.append(i)
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":domain_list,"userID":profile.userID_id}
    else:
        return {"status":"FAILURE"}


def get_domains_for_user(request,id):
    if request.user.is_authenticated:
        id = int(id)
        profile = None
        try:
            profile= profile_models.Profiles.objects.get(id=id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        
        domain_list=[]
        for i in profile.domainIDs.all().values_list('id',flat=True):
            domain_list.append(i)
        return {"status":"SUCCESS","id":profile.id, "domainIDs":domain_list}
    else:
        return {"status":"FAILURE"}


def get_profile(request,id):
    if request.user.is_authenticated:
        id = int(id)
        profile = None
        try:
            profile= profile_models.Profiles.objects.get(id=id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        
        domain_list=[]
        for i in profile.domainIDs.all().values_list('id',flat=True):
            domain_list.append(i)
        return {"status":"SUCCESS","id":profile.id,"mode":profile.mode,"profileIcon":profile.profileIcon,"domainIDs":domain_list,"userID":profile.userID_id}
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
        user=None
        try:
            user= User.objects.get(id=id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        
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
    
def get_user_by_id(id):
    user=None
    try:
        user= User.objects.get(id=id)
    except ObjectDoesNotExist:
        return {"status":"FAILURE", "details":"No user exists"}
    return {"status":"SUCCESS","id":user.id, "username":user.username,"email":user.email,"password":user.password}

def check_logged_in(request):
    if request.user.is_authenticated:
        return {"status":"SUCCESS","id":request.user.id}
    else:
        return {"status":"FAILURE"}
    
def add_source_to_domain(request, user_id,domain_id,source_id):
    if request.user.is_authenticated:
        domain = None
        try:
            domain=profile_models.Domains.objects.get(id=domain_id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No domain exists"}
        profile = None
        try:
            user_id = int(user_id)
            profile= profile_models.Profiles.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        if domain_id in profile.domainIDs.all().values_list('id',flat=True):
            domain.sourceIDs.append(source_id)
            domain.save()
            return {"domainID":domain_id,"sourceIDs":domain.sourceIDs}
        else:
            return {"status":"FAILURE","details":"Incorrect UserID"}

def remove_source_from_domain(request,user_id,domain_id,source_id):
     if request.user.is_authenticated:
        domain = None
        try:
            domain=profile_models.Domains.objects.get(id=domain_id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No domain exists"}
        profile = None
        try:
            user_id = int(user_id)
            profile= profile_models.Profiles.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        if domain_id in profile.domainIDs.all().values_list('id',flat=True):
            if source_id in domain.sourceIDs:
                domain.sourceIDs.remove(source_id)
                domain.save()
                return {"domainID":domain_id,"sourceIDs":domain.sourceIDs}
            else:
                return {"status":"FAILURE","details":"No Source ID found"}
        else:
            return {"status":"FAILURE","details":"Incorrect UserID"}
        
def get_sources_for_domain(request,user_id,domain_id):
    if request.user.is_authenticated:
        domain = None
        try:
            domain=profile_models.Domains.objects.get(id=domain_id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No domain exists"}
        profile = None
        try:
            user_id = int(user_id)
            profile= profile_models.Profiles.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return {"status":"FAILURE", "details":"No user exists"}
        if domain_id in profile.domainIDs.all().values_list('id',flat=True):
            return {"id":user_id,"domain_id":domain_id,"source_ids":domain.sourceIDs}
        else:
            return {"status":"FAILURE","details":"Incorrect UserID"}