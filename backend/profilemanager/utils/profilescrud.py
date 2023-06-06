

LIGHT=False
DARK=True

profiles_db = [
    {
        "user_id":1,
        "mode":LIGHT,
        "profileIcon":"https://www.waterfront.co.za/wp-content/uploads/2018/05/mcdonalds.jpg",
        "domainIDs":["1","2"],
    },
]

def edit_profile_picture(user_id,pictureURL):
    user_id = int(user_id)
    user = get_profile(user_id)
    if user == {}:
        return {}
    else:
        user["profileIcon"] = pictureURL
    for entry in profile_db:
        if entry["user_id"] == user_id:
            entry["profileIcon"] = pictureURL
    return get_profile(user_id)

def get_profile(user_id):
    user_id = int(user_id)
    for entry in profile_db:
        if entry["user_id"] == user_id:
            return entry
    return {}