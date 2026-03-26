
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from jose import jwt, JWTError
import uvicorn

import json
import httpx
import uuid
from userManager import usermanager
from dbmanager import db
import base64
app = FastAPI()
origins = [
     "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # 允许 GET, POST, OPTIONS 等
    allow_headers=["*"],  # 允许所有请求头
)

import configparser
config = configparser.ConfigParser()
config.read("config.ini")

WECHAT_APPID = config["WECHAT"]["WECHAT_APPID"]
WECHAT_SECRET = config["WECHAT"]["WECHAT_SECRET"]
JWT_SECRET = config["JWT"]["JWT_SECRET"]
JWT_ALGORITHM = config["JWT"]["JWT_ALGORITHM"]

def create_token(data: dict, expires_minutes: int = 120):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

@app.post("/api/auth/verify_token")
async def verify_token(request: Request):
    data = await request.json()
    token = data.get("token",None)

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"success": True, "openId": payload["openId"]}
    except JWTError:
        return {"success": False, "msg": "Invalid or expired token"}

@app.post("/api/auth/login_or_register")
async def login_or_register(request: Request):
    data = await request.json()
    code = data.get("code",None)
    encryptedData = data.get("encryptedData",None)
    iv = data.get("iv",None)

    if not code or not encryptedData or not iv:
        print("code or encryptedData or iv missing")
        return {"success": False, "msg": "code or encryptedData or iv missing"}

    url = "https://api.weixin.qq.com/sns/jscode2session"
    params = {
        "appid": WECHAT_APPID,
        "secret": WECHAT_SECRET,
        "js_code": code,
        "grant_type": "authorization_code"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)

    wx_data = resp.json()
    print("wechat response:", wx_data)
    if "session_key" not in wx_data:
        return {"success": False, "msg": f"wechat api error: {wx_data.get('errmsg', wx_data)}"}
    # {
    #     "success": true,
    #     "wechat": {
    #         "session_key": "W54XzCtb5I3EYjkpCb1j3w==",
    #         "openid": "oUCgG7MVP1qaux1IafdjoaJic26U"
    #     }
    # }

    session_key_bytes = base64.b64decode(wx_data.get("session_key"))
    encryptedData_bytes = base64.b64decode(encryptedData)
    iv_bytes = base64.b64decode(iv)

    cipher = Cipher(
        algorithms.AES(session_key_bytes),
        modes.CBC(iv_bytes),
        backend=default_backend()
    )

    decryptor = cipher.decryptor()
    decrypted_bytes = decryptor.update(encryptedData_bytes) + decryptor.finalize()
    padding_length = decrypted_bytes[-1]
    decrypted_bytes = decrypted_bytes[:-padding_length]
    user_info = json.loads(decrypted_bytes.decode('utf-8'))

    print("user_info:", user_info)

    token = create_token({
        "openId": user_info["openId"]
    })

    usermanager().login_or_register(user_info["openId"])

    return {
        "success": True,
        "user_info": user_info,
        "token": token
    }
@app.get("/api/archive/getAllArchives")
async def getAllArchives(request: Request):
    list=db.query_All("archives")
    return {
        "success": True,
        "archiveList":list
    }

@app.get("/api/archive/getArchive")
async def getArchive(request: Request, id: int = None):
    if id is None:
        return {"success": False, "msg": "Missing id parameter"}
    archive = db.query_by_id("archives", id)
    if archive:
        return {"success": True, "archive": archive}
    return {"success": False, "msg": "Archive not found"}

@app.post("/api/login_or_register_app")
async def login_or_register_app(request: Request):

    data = await request.json()
    openid=data.get("openid")
    #oUCgG7MVP1qaux1IafdjoaJic26U
    if not openid:
        openid = str(uuid.uuid4()).replace("-", "")

    token = create_token({"openId": openid})
    
    usermanager().login_or_register(openid)

    return {
        "success": True,
        "openId": openid,
        "token": token
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=5551,
        reload=True
    )