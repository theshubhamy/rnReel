/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, forwardRef} from 'react';
import {
  requireNativeComponent,
  Platform,
  View,
  ViewStyle,
  StyleSheet,
  Image,
} from 'react-native';

// Define separate components for iOS and Android
const CustomVideoPlayerIOS =
  Platform.OS === 'ios' ? requireNativeComponent('CustomVideoPlayer') : null;

const CustomVideoPlayerAndroid =
  Platform.OS === 'android'
    ? requireNativeComponent('CustomVideoPlayerAndroid')
    : null;

interface VideoPlayerProps {
  videoUrl?: string;
  paused?: boolean;
  muted?: boolean;
  style?: ViewStyle;
  poster?: string;
  onVideoLoad?: () => void;
  onLoadStart?: () => void;
  onLoadProgress?: (progress: {
    currentTime: number;
    playableDuration: number;
    seekableDuration: number;
    currentPlaybackTime: number;
  }) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

const VideoPlayer = forwardRef<any, VideoPlayerProps>(
  (
    {
      videoUrl,
      paused,
      muted,
      style,
      poster,
      onVideoLoad,
      onLoadStart,
      onLoadProgress,
      onError,
      onEnd,
    },
    ref,
  ) => {
    const handleError = useCallback(
      (event: {nativeEvent: {error: string}}) => {
        const errorMessage =
          event.nativeEvent?.error || 'Unknown error occurred';
        console.error('[VideoPlayer] Error:', errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      },
      [onError],
    );

    const handleReady = useCallback(() => {
      if (onVideoLoad) {
        onVideoLoad();
      }
    }, [onVideoLoad]);

    const handleLoadStart = useCallback(() => {
      if (onLoadStart) {
        onLoadStart();
      }
    }, [onLoadStart]);

    const handleLoadProgress = useCallback(
      (event: {
        nativeEvent: {
          currentTime: number;
          playableDuration: number;
          seekableDuration: number;
          currentPlaybackTime: number;
        };
      }) => {
        if (onLoadProgress) {
          const {
            currentTime,
            playableDuration,
            seekableDuration,
            currentPlaybackTime,
          } = event.nativeEvent;

          onLoadProgress({
            currentTime,
            playableDuration,
            seekableDuration,
            currentPlaybackTime,
          });
        }
      },
      [onLoadProgress],
    );

    const handleEnd = useCallback(() => {
      if (onEnd) {
        onEnd();
      }
    }, [onEnd]);

    const videoProps = {
      style: [style, {width: '100%', height: '100%'}],
      paused,
      muted,
      videoUrl,
      onReady: handleReady,
      onLoadStart: handleLoadStart,
      onLoadProgress: handleLoadProgress,
      onEnd: handleEnd,
      onError: handleError,
    };

    return (
      <View style={[style, StyleSheet.absoluteFillObject]}>
        {poster && (paused || !videoUrl) && (
          <Image
            source={{uri: poster}}
            resizeMode="cover"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          />
        )}
        {Platform.OS === 'ios' && CustomVideoPlayerIOS ? (
          <CustomVideoPlayerIOS {...videoProps} ref={ref} />
        ) : Platform.OS === 'android' && CustomVideoPlayerAndroid ? (
          <CustomVideoPlayerAndroid {...videoProps} ref={ref} />
        ) : null}
      </View>
    );
  },
);

export default VideoPlayer;
