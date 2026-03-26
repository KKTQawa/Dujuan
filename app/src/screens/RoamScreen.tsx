import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { markers } from '../utils/map';

export const RoamScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleVrPress = (vr: string) => {
    Alert.alert('敬请期待', 'VR功能即将上线', [{ text: '确定' }]);
  };

  const renderItem = ({ item }: { item: typeof markers[0] }) => (
    <TouchableOpacity style={styles.vrItem} onPress={() => handleVrPress(item.vr)}>
      <Image source={{ uri: item.photo }} style={styles.vrImage} resizeMode="cover" />
      <View style={styles.vrTitleContainer}>
        <Text style={styles.vrTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={markers}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2f0d7',
  },
  listContainer: {
    padding: 10,
  },
  vrItem: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vrImage: {
    width: '100%',
    height: 150,
  },
  vrTitleContainer: {
    padding: 10,
    alignItems: 'center',
  },
  vrTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default RoamScreen;