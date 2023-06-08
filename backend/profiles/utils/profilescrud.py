# from django.contrib.auth.models import User

LIGHT=False
DARK=True
ID_COUNTER = 10

profiles_db = [
    {
        "id":1,
        "mode":LIGHT,
        "profileIcon":"https://www.waterfront.co.za/wp-content/uploads/2018/05/mcdonalds.jpg",
        "domainIDs":["1","2"],
        "user_id":1,
    }, 
    {
        "id":2,
        "mode":DARK,
        "profileIcon":"https://pbs.twimg.com/profile_images/1655865005370163207/o1wfCDc3_400x400.jpg",
        "domainIDs":["3","4"],
        "user_id":2,
    },
    {
        "id":3,
        "mode":LIGHT,
        "profileIcon":"https://logos-world.net/wp-content/uploads/2022/12/Nandos-Logo.jpg",
        "domainIDs":["5"],
        "user_id":3,
    }
]

def next_id():
    global ID_COUNTER
    ID_COUNTER += 1
    return ID_COUNTER

def create_profile(user_id, profileIcon, mode=LIGHT):
    user_id = int(user_id)
    id=next_id()
    profiles_db.append({
        "id":id,
        "mode":mode,
        "profileIcon":profileIcon,
        "domainIDs":[],
        "user_id":user_id,
    })
    return get_profile(id)

def swap_mode(id):
    id = int(id)
    for entry in profiles_db:
        if entry["id"] == id:
            entry["mode"] = not entry["mode"]
    return get_profile(id)

def edit_profile_picture(id,pictureURL):
    id = int(id)
    for entry in profiles_db:
        if entry["id"] == id:
            entry["profileIcon"] = pictureURL
    return get_profile(id)

def edit_profile_mode(id,mode):
    id = int(id)
    for entry in profiles_db:
        if entry["id"] == id:
            entry["mode"] = mode
    
    return get_profile(id)

def add_domain_to_profile(id,domain_id):
    id = int(id)
    domain_id = int(domain_id)
    for entry in profiles_db:
        if int(entry["id"]) == id:
            entry["domainIDs"].append(domain_id)
    return get_profile(id)

def remove_domain_from_profile(id,domain_id):
    id = int(id)
    domain_id = int(domain_id)
    for entry in profiles_db:
        if int(entry["id"]) == id:
            entry["domainIDs"].remove(domain_id)
    return get_profile(id)

def get_domains_for_user(id):
    id = int(id)
    for entry in profiles_db:
        if entry["id"] == id:
            return entry["domainIDs"]
    return []

def get_profile(id):
    id = int(id)
    for entry in profiles_db:
        if entry["id"] == id:
            return entry
    return {}