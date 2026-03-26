
from dbmanager import db

class usermanager:
    def __init__(self):
        pass
    def login_or_register(self, userID):
        is_exist=db.query_one("users",{"id":userID})
        if is_exist is None:
            db.insert("users",{"id":userID,"username":"微信用户"+userID})
            return {"id":userID,"username":"微信用户"+userID}
        else:
            return is_exist
