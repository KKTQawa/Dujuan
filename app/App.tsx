import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image } from 'react-native';

import ArchiveScreen from './src/screens/ArchiveScreen';
import MapScreen from './src/screens/MapScreen';
import RoamScreen from './src/screens/RoamScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ArchiveDetailScreen from './src/screens/ArchiveDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ArchiveStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#add191' },
      headerTintColor: '#000',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="ArchiveList"
      component={ArchiveScreen}
      options={{ title: '档案' }}
    />
    <Stack.Screen
      name="ArchiveDetail"
      component={ArchiveDetailScreen}
      options={{ title: '档案详情' }}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#add191' },
      headerTintColor: '#000',
      headerTitleStyle: { fontWeight: 'bold' },
      tabBarStyle: { backgroundColor: '#add191' },
      tabBarActiveTintColor: '#d81e06',
      tabBarInactiveTintColor: '#333',
    }}
  >
    <Tab.Screen
      name="Archive"
      component={ArchiveStack}
      options={{
        title: '档案',
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Image
            source={require('./assets/images/archive.png')}
            style={{ width: 24, height: 24, tintColor: focused ? '#d81e06' : '#333' }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Map"
      component={MapScreen}
      options={{
        title: '地图',
        tabBarIcon: ({ focused }) => (
          <Image
            source={require('./assets/images/map.png')}
            style={{ width: 24, height: 24, tintColor: focused ? '#d81e06' : '#333' }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Roam"
      component={RoamScreen}
      options={{
        title: '漫游',
        tabBarIcon: ({ focused }) => (
          <Image
            source={require('./assets/images/roam.png')}
            style={{ width: 24, height: 24, tintColor: focused ? '#d81e06' : '#333' }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: '我的',
        tabBarIcon: ({ focused }) => (
          <Image
            source={require('./assets/images/user.png')}
            style={{ width: 24, height: 24, tintColor: focused ? '#d81e06' : '#333' }}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#add191" />
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;