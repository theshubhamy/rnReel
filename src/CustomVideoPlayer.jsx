import {requireNativeComponent, Platform, View, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';

// Define separate components for iOS and Android
const CustomVideoPlayerIOS =
  Platform.OS === 'ios' ? requireNativeComponent('CustomVideoPlayer') : null;

const CustomVideoPlayerAndroid =
  Platform.OS === 'android'
    ? requireNativeComponent('CustomVideoPlayerAndroid')
    : null;

const VideoPlayer = ({videoUrl, paused = false, muted = false, style}) => {
  useEffect(() => {
    // Check URL accessibility
    fetch(videoUrl, {method: 'HEAD'})
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        console.log('[VideoPlayer] URL is accessible');
      })
      .catch(err => console.error('[VideoPlayer] URL check failed:', err));
  }, [videoUrl]);

  const handleError = event => {
    const errorMessage = event.nativeEvent?.error || 'Unknown error occurred';
    console.error('[VideoPlayer] Error:', errorMessage);
  };

  const handleReady = () => {
    console.log('[VideoPlayer] Ready');
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
      {Platform.OS === 'ios' ? (
        <CustomVideoPlayerIOS {...iosProps} />
      ) : (
        <CustomVideoPlayerAndroid {...androidProps} />
      )}
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
