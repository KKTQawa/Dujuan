import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useUserStore } from '../store/userStore';
import { post } from '../api/api';
import { NavigationProp } from '@react-navigation/native';

import {MMKVLoader} from "react-native-mmkv-storage"
const storage = new MMKVLoader().initialize();

const STORAGE_OPENID_KEY = 'myapp_user_openid';
const STORAGE_TOKEN_KEY = 'myapp_user_token';
const PROFILE_DEFAULT = 'https://yanjiaomuguo.oss-cn-chengdu.aliyuncs.com/logo2.png';
const LOCAL_URL='http://10.0.2.2:5551/api/';
const CLOUD_URL='https://jiuljiul.com/api'
interface ProfileScreenProps {
  navigation: NavigationProp<any>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { hasLogin, nickname, avatarUrl, user, login, logout, setUserInfo } = useUserStore();
  const [version] = useState('1.0.0');
  const [loggingIn, setLoggingIn] = useState(false);

const handleProfileClick = async () => {
  if (hasLogin || loggingIn) return;

  setLoggingIn(true);

  try {
    let openid = await storage.getString(STORAGE_OPENID_KEY);

    const res = await fetch(`${CLOUD_URL}/login_or_register_app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openid }), 
    });
    const data = await res.json();

    if (data?.success) {
      openid = data.openId;
      if(!openid){
        console.log('openid is null')
        return;
      }
      const token = data.token;

      await storage.setString(STORAGE_OPENID_KEY, openid);
        await storage.setString(STORAGE_TOKEN_KEY, token);

      setUserInfo({
        nickname: openid.substring(0, 12), 
        avatarUrl: PROFILE_DEFAULT,
        user: openid,
        token,
      });
      login();

      Alert.alert('登录成功', `欢迎 ${'用户'}!`);
    } else {
      Alert.alert('登录失败', data?.msg || '请重试');
    }
  } catch (e: any) {
    console.error('[Profile] Login error:', e);
    Alert.alert('登录失败', e.message || '网络错误');
  } finally {
    setLoggingIn(false);
  }
};

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress:async () => {
            logout();
          },
        },
      ]
    );
  };

  const zippedName = (rawName: string | null) => {
    if (!rawName) return '';
    if (rawName.length > 15) {
      return rawName.substring(0, 16);
    }
    return rawName;
  };

  const displayName =  user || '';

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleProfileClick} disabled={loggingIn}>
          <Image
            source={{ uri: PROFILE_DEFAULT }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        {hasLogin ? (
          <View style={styles.nameContainer}>
            <Text style={styles.nickname}>{zippedName(displayName)}</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>退出</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleProfileClick} disabled={loggingIn}>
            <Text style={styles.nickname}>
              {loggingIn ? '登录中...' : '登录/注册'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.profileItem}>
          <Text style={styles.itemLabel}>版本</Text>
          <Text style={styles.itemValue}>v{version}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2f0d7',
  },
  profileHeader: {
    backgroundColor: '#add191',
    padding: 30,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#fff',
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  nickname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 12,
    color: '#666',
  },
  profileContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 15,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  itemValue: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;