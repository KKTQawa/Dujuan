import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { get } from '../api/api';
import { useArchiveStore } from '../store/archiveStore';
import Video from 'react-native-video';
const { width: screenWidth } = Dimensions.get('window');

interface ArchiveItem {
  id: number;
  name: string;
  create_date: string;
  video_url?: string;
  show_pic_list?: Array<{ url: string; detail: string }>;
  QR?: string;
}

export const ArchiveDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { id } = route.params || {};
  const [archiveItem, setArchiveItem] = useState<ArchiveItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const { archiveList, setArchiveList } = useArchiveStore();
  useEffect(() => {
    if (!id) return;
    console.log('id:', id);
    console.log('archiveList:', archiveList);

    const item = archiveList.find(i => i.id === id);
    setArchiveItem(item);
    console.log('archiveItem', item);
  }, [archiveList, id]);

  const handlePreview = (index: number, images: string[]) => {
    setPreviewIndex(index);
    setPreviewImages(images);
    setPreviewVisible(true);
  };

  if (!archiveItem) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>档案不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {archiveItem.video_url ? (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: archiveItem.video_url }}
            style={styles.video}
            controls
            resizeMode="contain"
            paused={false}
          />
        </View>
      ) : null}

      <View style={styles.info}>
        <Text style={styles.name}>{archiveItem.name}</Text>

        {archiveItem.show_pic_list && archiveItem.show_pic_list.length > 0 ? (
          <View style={styles.picList}>
            {archiveItem.show_pic_list.map((pic, index) => (
              <View key={index} style={styles.picCard}>
                <TouchableOpacity
                  onPress={() =>
                    handlePreview(
                      index,
                      archiveItem.show_pic_list?.map(p => p.url) || [],
                    )
                  }
                >
                  <Image
                    source={{ uri: pic.url }}
                    style={styles.picItem}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                {pic.detail ? (
                  <Text style={styles.picDetail}>{pic.detail}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.label}>创建时间：</Text>
        <Text>{archiveItem.create_date}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.label}>档案编号：</Text>
        <Text>{archiveItem.id}</Text>
      </View>

      {archiveItem.QR ? (
        <View style={styles.qrContainer}>
          <Image
            source={{ uri: archiveItem.QR }}
            style={styles.qrImage}
            resizeMode="contain"
          />
        </View>
      ) : null}

      <Modal visible={previewVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setPreviewVisible(false)}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <FlatList
            data={previewImages}
            horizontal
            pagingEnabled
            initialScrollIndex={previewIndex}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2f0d7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  videoContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },

  video: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d81e06',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
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
    fontSize: 16,
    color: '#999',
  },
  videoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    color: '#fff',
    fontSize: 14,
  },
  info: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  picList: {
    marginTop: 10,
  },
  picCard: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  picItem: {
    width: '100%',
    height: 200,
  },
  picDetail: {
    padding: 10,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  qrContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 20,
  },
  qrImage: {
    width: 150,
    height: 150,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 30,
  },
  previewImage: {
    width: screenWidth,
    height: screenWidth,
  },
});

export default ArchiveDetailScreen;
