# React Native App

移动端应用，基于 React Native 开发。

## 环境要求

- Node.js >= 18
- React Native CLI
- Android Studio (Android 开发)
- Xcode (iOS 开发)

## 安装依赖

```bash
cd app
npm install
```

## 运行项目

### Android

```bash
npm run android
```

### iOS

```bash
bundle install
bundle exec pod install
npm run ios
```

## 项目结构

```
app/
├── src/           # 源代码
├── android/       # Android 原生项目
├── ios/           # iOS 原生项目
├── assets/        # 静态资源
└── node_modules/ # 依赖包
```

## 构建 APK

```bash
npm run build:android
```