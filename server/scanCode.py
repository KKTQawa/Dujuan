import requests
import secrets
import configparser
from datetime import date
config = configparser.ConfigParser()
config.read("config.ini")
WECHAT_APPID = config["WECHAT"]["WECHAT_APPID"]
WECHAT_SECRET = config["WECHAT"]["WECHAT_SECRET"]
def getQRCode(id:str,access_token:str):
    if id is None or access_token is None:
        return "err"
    url = f"https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token={access_token}"

    data = {
        "path": f"pages/archive/archiveDetail?id={id}",
    }

    resp = requests.post(url, json=data)
    return resp.content  # 二进制图片
def getQRCode2(id:str,access_token:str):
    if id is None or access_token is None:
        return "err"
    url = f"https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token={access_token}"

    data = {
        "page":"pages/archiveDetail/archiveDetail",
        "scene": f"?id={id}",
        "check_path":False,
        "env_version":"trial"
    }

    resp = requests.post(url, json=data)
    return resp.content  # 二进制图片
def random_scene(length=16):
    chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    return ''.join(secrets.choice(chars) for _ in range(length))
def get_access_token(appid, appsecret):
    url = "https://api.weixin.qq.com/cgi-bin/token"
    params = {
        "grant_type": "client_credential",
        "appid": appid,
        "secret": appsecret
    }

    resp = requests.get(url, params=params)
    data = resp.json()

    return data["access_token"]

if __name__ == "__main__":
    access_token=get_access_token(WECHAT_APPID,WECHAT_SECRET)
    print("access_token",access_token)
    id=random_scene()
    print("id:",id)
    qr_bytes=getQRCode2(id,access_token)
    print("QR:",qr_bytes)
    date_str = date.today().strftime("%Y%m%d")
    print("data:",date_str)
    with open(f"{id}.jpg", "wb") as f:
        f.write(qr_bytes)