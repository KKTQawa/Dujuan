import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { markers, map_url, mark_url } from '../utils/map';
import Sound from 'react-native-sound';
import ImageZoom from 'react-native-image-pan-zoom';
import { PixelRatio } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

export const MapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentMarker, setCurrentMarker] = useState<any>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const soundRef = useRef<Sound | null>(null);
  const [mapSize, setMapSize] = useState({ width: 3000, height: 2308 });
  const [containerSize, setContainerSize] = useState({
    width: W,
    height: H,
  });

  useEffect(() => {
    console.log('MapScreen mounted');
    // Image.getSize(
    //   map_url,
    //   (width, height) => {
    //     console.log('map size:', width, height);
    //     console.log('cotainerSize:', containerSize.width, containerSize.height);
    //     setMapSize({ width, height });
    //   },
    //   error => {
    //     console.log('get map size error', error);
    //   },
    // );
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
      }
    };
  }, []);

  const playAudio = (audioUrl: string) => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
    }

    const sound = new Sound(audioUrl, '', error => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      soundRef.current = sound;
      sound.setVolume(1);
      sound.play(success => {
        if (!success) {
          console.log('Sound playback failed');
        }
      });
    });
  };

  const handleMarkerPress = (marker: any) => {
    console.log('[Map] Marker pressed:', marker.title);
    setCurrentMarker(marker);
    setShowOverlay(true);
    if (marker.audio) {
      console.log('[Map] Playing audio:', marker.audio);
      playAudio(marker.audio);
    }
    setCurrentImageIndex(0);
  };

  const closeOverlay = () => {
    console.log('[Map] Closing overlay');
    setShowOverlay(false);
    if (soundRef.current) {
      soundRef.current.stop();
    }
  };

  const renderImageItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setCurrentImageIndex(index)}
    >
      <Image
        source={{ uri: item }}
        style={styles.overlayImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View
      style={styles.container}
      onLayout={e => {
        const { height, width } = e.nativeEvent.layout;
        setContainerSize({ width, height });
      }}
    >
      <ImageZoom
        cropWidth={containerSize.width}
        cropHeight={containerSize.height}
        imageWidth={mapSize.width}
        imageHeight={mapSize.height}
        minScale={0.1}
        maxScale={1.5}
        enableCenterFocus={false}
        useNativeDriver={true}
        scale={1}
        positionX={0}  
        positionY={0}  
          onMove={({ positionX, positionY, scale }) => {
    //console.log('onMove', positionX, positionY, scale);
  }}
      >
        <View
          style={[
            styles.mapContainer,
            { width: mapSize.width, height: mapSize.height },
          ]}
        >
          <Image
            source={{ uri: map_url }}
            style={[
              styles.mapImage,
              { width: mapSize.width, height: mapSize.height },
            ]}
          />

          {markers.map(marker => (
            <TouchableOpacity
              key={marker.id}
              style={[
                styles.markerContainer,
                {   left: marker.left,top: marker.top  },
              ]}
              onPress={() => handleMarkerPress(marker)}
            >
              <Image source={{ uri: mark_url }} style={styles.marker} />
            </TouchableOpacity>
          ))}
        </View>
      </ImageZoom>

      <Modal visible={showOverlay} animationType="slide" transparent>
        <View style={styles.overlayContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeOverlay}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <View style={styles.markerInfo}>
            <View style={styles.markerInfoHeader}>
              <Text style={styles.markerTitle}>{currentMarker?.title}</Text>
              {currentMarker?.audio && (
                <View style={styles.audioBadge}>
                  <Text style={styles.audioBadgeText}>🔊 音频</Text>
                </View>
              )}
            </View>
            <Text style={styles.markerDetail}>{currentMarker?.detail}</Text>
          </View>

          {currentMarker &&
            currentMarker.pics &&
            currentMarker.pics.length > 0 && (
              <>
                <FlatList
                  data={currentMarker.pics}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  initialScrollIndex={currentImageIndex}
                  getItemLayout={(data, index) => ({
                    length: W,
                    offset: W * index,
                    index,
                  })}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  renderItem={renderImageItem}
                  style={styles.imageList}
                  onMomentumScrollEnd={e => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / W);
                    setCurrentImageIndex(index);
                  }}
                />
                <View style={styles.pagination}>
                  <Text style={styles.paginationText}>
                    {currentImageIndex + 1} / {currentMarker.pics.length}
                  </Text>
                </View>
              </>
            )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2f0d7',
    overflow: 'hidden',
  },
  mapContainer: {},
  mapImage: {
    position: 'absolute',
  },
  markerContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  marker: {
    width: 40,
    height: 40,
  },
  hint: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  closeText: {
    color: '#e60909',
    fontSize: 30,
    lineHeight: 36,
  },
  imageList: {
    flex: 1,
    marginTop: 40,
  },
  overlayImage: {
    width: W,
    height: H * 0.5,
  },
  pagination: {
    position: 'absolute',
    bottom: H * 0.15,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  paginationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  markerInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  markerInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  markerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  audioBadge: {
    backgroundColor: '#d81e06',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  audioBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markerDetail: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
});

export default MapScreen;
