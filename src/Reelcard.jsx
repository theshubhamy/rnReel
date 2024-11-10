import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import VideoPlayer from './CustomVideoPlayer';
const {height: screenHeight, width} = Dimensions.get('window');
const Reelcard = ({item, index, currentIndex}) => {
  return (
    <View style={styles.container}>
      <VideoPlayer
        videoUrl={item.videoUrl}
        paused={currentIndex !== index}
        muted={currentIndex !== index}
        style={styles.videoPlayers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoPlayers: {
    width: width,
    height: screenHeight,
  },
});

export default Reelcard;
