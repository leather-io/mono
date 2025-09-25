import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import VideoThumbnailGenerator from './collectible-video-thumbnail-generator.native';

export function VideoThumbnailItem({ video, onPress }: { video: any; onPress: () => void }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);

  return (
    <>
      {isGenerating && !thumbnail && (
        <VideoThumbnailGenerator
          videoUrl={video.url}
          timestamp={video.thumbnailTimestamp || 1}
          onThumbnailGenerated={thumbnailData => {
            setThumbnail(thumbnailData as any);
            setIsGenerating(false);
            // Optionally cache the thumbnail
            video.cachedThumbnail = thumbnailData;
          }}
        />
      )}

      <TouchableOpacity
        style={styles.thumbnailContainer}
        onPress={thumbnail ? onPress : undefined}
        activeOpacity={0.9}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} />
        ) : (
          <View style={styles.placeholder}>
            {isGenerating ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.placeholderText}>📹</Text>
            )}
          </View>
        )}

        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶️</Text>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  thumbnailContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 30,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  playIcon: {
    fontSize: 16,
    marginLeft: 2,
  },
});
