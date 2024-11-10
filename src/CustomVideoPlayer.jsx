import {
  requireNativeComponent,
  Platform,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useState} from 'react';

// Define separate components for iOS and Android
const CustomVideoPlayerIOS =
  Platform.OS === 'ios' ? requireNativeComponent('CustomVideoPlayer') : null;

const CustomVideoPlayerAndroid =
  Platform.OS === 'android'
    ? requireNativeComponent('CustomVideoPlayerAndroid')
    : null;

const VideoPlayer = ({videoUrl, paused = false, muted = false, style}) => {
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('[VideoPlayer] Initializing with URL:', videoUrl);

    // Check URL accessibility
    fetch(videoUrl, {method: 'HEAD'})
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        console.log('[VideoPlayer] URL is accessible:', videoUrl);
        console.log(
          '[VideoPlayer] Content-Type:',
          response.headers.get('content-type'),
        );
      })
      .catch(err => console.error('[VideoPlayer] URL check failed:', err));
  }, [videoUrl]);

  const handleError = event => {
    const errorMessage = event.nativeEvent?.error || 'Unknown error occurred';
    console.error('[VideoPlayer] Error:', errorMessage);
    setError(errorMessage);
    setIsReady(false);
  };

  const handleReady = () => {
    console.log('[VideoPlayer] Ready');
    setIsReady(true);
    setError(null);
  };

  const handleEnd = () => {
    console.log('[VideoPlayer] Playback ended');
  };

  // Common props for both platforms
  const videoProps = {
    style: [styles.video, style],
    paused,
    muted,
  };

  // Platform specific props
  const androidProps = {
    ...videoProps,
    sourceUrl: videoUrl,
    onReady: handleReady,
    onError: handleError,
    onEnd: handleEnd,
  };

  const iosProps = {
    ...videoProps,
    videoUrl: videoUrl, // assuming iOS uses videoUrl prop
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>Error: {error}</Text>}

      {Platform.OS === 'ios' ? (
        <CustomVideoPlayerIOS {...iosProps} />
      ) : (
        <CustomVideoPlayerAndroid {...androidProps} />
      )}

      {!isReady && !error && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      <Text style={styles.platformText}>CustomVideoPlayer {Platform.OS}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  platformText: {
    fontSize: 16,
    color: '#fff',
    position: 'absolute',
    top: 0,
    textAlign: 'center',
    width: '100%',
    zIndex: 2,
  },
});

export default VideoPlayer;
