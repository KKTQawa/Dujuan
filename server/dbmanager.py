from pymongo import MongoClient
from typing import Dict, Any, List, Optional
import configparser
config = configparser.ConfigParser()
config.read("config.ini")
uri = config["db"]["uri"]
class dbmanager:
    def __init__(self):
        self.client = MongoClient(uri)
        flag=self.test_connection()
        if flag:
            self.db = self.client["dujuan"]
            self.users = self.db["users"]
            self.archives=self.db["archives"]

    def test_connection(self):
        try:
            self.client.admin.command("ping")
            print("MongoDB connected successfully")
            return True
        except Exception as e:
            print("MongoDB connection failed:", e)
            return False

    # {'_id': ObjectId('697d4fa4c089603d48a0ee92'), 'name': 'wym', 'password': '123'}
    # <class 'dict'>
    # None
    def query_one(self,collection_name: str,query_condition: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        collection = self.db[collection_name]
        res=collection.find_one(query_condition)
        if res is None:
            return None
        res["_id"] = str(res["_id"])
        return res
    #InsertOneResult({}, acknowledged=True)
    #<class 'pymongo.results.InsertOneResult'>
    def insert(self, collection_name:str, data:Dict[str, Any]):
        collection = self.db[collection_name]
        result= collection.insert_one(data)
        return {
            "success": result.acknowledged,
        }
    # UpdateResult({
    #     'n': 1,
    #     'electionId': ObjectId(...),
    #     'opTime': {...},
    #     'nModified': 1,
    #     'ok': 1.0,
    #     '$clusterTime': {...},
    #     'operationTime': ...,
    #     'updatedExisting': True
    # }, acknowledged=True)
    # <class 'pymongo.results.UpdateResult'>
    def update(self, collection_name:str, query_condition:Dict[str, Any], update_data:Dict[str, Any]):
        collection = self.db[collection_name]
        result= collection.update_one(query_condition, {"$set": update_data})
        return {
        "success": result.acknowledged,
        "matched": result.matched_count,
        "modified": result.modified_count
        }
    # DeleteResult({
    #     'n': 1, 
    #     'electionId': ObjectId('7fffffff00000000000000f4'), 
    #     'opTime': {'ts': Timestamp(1769820929, 9), 't': 244}, 
    #     'ok': 1.0, 
    #     '$clusterTime': {
    #         'clusterTime': Timestamp(1769820929, 9), 
    #         'signature': {'hash': b"'\xe5w\xf7\xa1\xfa$\xdd\xbb\xefc\x88\xca.2\\\x99\xcf\x8d\xf5", 
    #         'keyId': 7566635724372443145}}, 
    #         'operationTime': Timestamp(1769820929, 9)
    #         }, 
    #     acknowledged=True)
    # <class 'pymongo.results.DeleteResult'>
    def delete(self, collection_name:str, query_condition:Dict[str, Any]):
        collection = self.db[collection_name]
        result= collection.delete_one(query_condition)
        return {
            "success": result.acknowledged,
            "deleted_count": result.deleted_count 
        }

    def query_All(self, collection_name: str, x: int=40):
        collection = self.db[collection_name]
        result = collection.find().limit(x)
        result_list = []
        if result is None:
            return []
        for item in result:
            item["_id"] = str(item["_id"])
            result_list.append(item)
        return result_list

db = dbmanager()
if __name__ == "__main__":
    db = dbmanager()
    test1=db.insert("users", {
        "name": "wym",
        "password": "123456"
    })
    print(test1)
    print(type(test1))

    test2=db.query_one("users", {"name": "wydm"})
    print(test2)
    print(type(test2))

    user = db.update("users", {"name": "wym1"}, {"password": "123"})
    print(user)
    print(type(user))

    test3=db.delete("users", {"name": "wym"})
    print(test3)
    print(type(test3))

    

