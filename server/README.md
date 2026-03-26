# 后端服务 (FastAPI)

微信小程序后端服务，基于 FastAPI 框架开发。

## 环境要求

- Python 3.8+
- MongoDB

## 安装依赖

```bash
cd server
pip install -r requirements.txt
```

## 配置

在 `config.ini` 中配置以下内容：

- `db`: MongoDB 连接 URI
- `JWT`: JWT 密钥和算法
- `WECHAT`: 微信 App ID 和 Secret

## 运行服务

```bash
uvicorn main:app --host 127.0.0.1 --port 5551 --reload
```

## 项目结构

```
server/
├── main.py           # FastAPI 应用入口
├── dbmanager.py      # MongoDB 操作
├── userManager.py    # 用户管理
├── scanCode.py       # 二维码生成
├── config.ini        # 配置文件
└── requirements.txt # 依赖
```

## 主要 API

- `POST /api/auth/login_or_register` - 微信登录/注册
- `POST /api/auth/verify_token` - Token 验证
- `GET /api/archive/getAllArchives` - 获取档案列表

## 认证流程

1. 用户提供微信 code、encryptedData、iv
2. 请求微信 API 获取 session key
3. 使用 AES-CBC 解密用户信息
4. 生成 JWT token
5. 在 MongoDB 中注册或登录用户