/* eslint-disable react-native/no-inline-styles */
import {requireNativeComponent} from 'react-native';
import React from 'react';
import {View, Text, Platform} from 'react-native';
// const CustomVideoPlayer = requireNativeComponent('CustomVideoPlayer');
const CustomVideoPlayer = Platform.select({
  ios: requireNativeComponent('CustomVideoPlayer'), // iOS version
  android: requireNativeComponent('CustomVideoPlayerAndroid'), // Android version
});

const VideoPlayer = ({videoUrl, paused, muted, style}) => {
  return (
    <View>
      <Text
        style={{
          fontSize: 20,
          color: '#fff',
          position: 'absolute',
          top: 0,
          textAlign: 'center',
        }}>
        CustomVideoPlayer
      </Text>
      {Platform.OS === 'ios' ? (
        <CustomVideoPlayer
          videoUrl={videoUrl}
          paused={paused}
          muted={muted}
          style={style}
        />
      ) : (
        <CustomVideoPlayer
          videoUrl={videoUrl}
          paused={paused}
          muted={muted}
          style={style}
          onReady={() => console.log('Video ready')}
          onError={event =>
            console.error('Video error:', event.nativeEvent.error)
          }
          onEnd={() => console.log('Video finished')}
        />
      )}
    </View>
  );
};

export default VideoPlayer;
