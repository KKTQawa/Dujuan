import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { get } from '../api/api';
import { useArchiveStore } from '../store/archiveStore';

interface Archive {
  id: number;
  name: string;
  create_date: string;
}

export const ArchiveScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchValue, setSearchValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { archiveList, setArchiveList } = useArchiveStore();

  const fetchArchives = async () => {
    try {
      setError(null);
      const res = await get('/archive/getAllArchives');
      console.log('Archive response:', res);
      if (res?.success) {
        setArchiveList(res.archiveList || []);
      } else {
        setError(res?.msg || '获取数据失败');
      }
    } catch (e: any) {
      console.error('Fetch error:', e);
      setError(e.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchArchives();
    setRefreshing(false);
  };

  const filteredList = searchValue
    ? archiveList.filter((item: Archive) =>
        item.name?.toLowerCase().includes(searchValue.toLowerCase())
      )
    : archiveList;

  const renderItem = ({ item }: { item: Archive }) => (
    <TouchableOpacity
      style={styles.archiveItem}
      onPress={() => navigation.navigate('ArchiveDetail', { id: item.id })}
    >
      <Text style={styles.archiveName}>{item.name}</Text>
      <Text style={styles.archiveDate}>{item.create_date || '未知日期'}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="请输入你想要了解的珍品~~~"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#add191" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="请输入你想要了解的珍品~~~"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchArchives}>
            <Text style={styles.retryText}>重试</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="请输入你想要了解的珍品~~~"
          value={searchValue}
          onChangeText={setSearchValue}
        />
      </View>
      {filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无档案数据</Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2f0d7',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#add191',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
  },
  archiveItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  archiveName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  archiveDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d81e06',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#add191',
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default ArchiveScreen;