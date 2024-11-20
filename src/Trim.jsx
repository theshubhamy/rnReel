/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {openVideoTrimmer} from './VideoTrimmer';
const Trim = () => {
  const [selectedVideos, setSelectedVideos] = useState([]);

  // Open gallery to select multiple videos
  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'video',
        selectionLimit: 0,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled video picker');
        } else if (response.errorMessage) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else {
          const videos = response.assets || [];
          console.log('Selected videos:', videos);

          setSelectedVideos(videos);
        }
      },
    );
  };

  // Render each video item
  const renderVideoItem = ({item}) => (
    <TouchableOpacity onPress={() => openVideoTrimmer(item.uri)}>
      <View style={{marginBottom: 10, alignItems: 'center'}}>
        <Image source={{uri: item.uri}} style={{width: 100, height: 100}} />
        <Text style={{marginTop: 5}}>{item.fileName || 'Video'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, padding: 20}}>
      <Button title="Select Videos from Gallery" onPress={openGallery} />
      {selectedVideos.length > 0 ? (
        <FlatList
          data={selectedVideos}
          keyExtractor={item => item.uri}
          renderItem={renderVideoItem}
          contentContainerStyle={{paddingTop: 20}}
        />
      ) : (
        <Text style={{marginTop: 20, textAlign: 'center'}}>
          No videos selected
        </Text>
      )}
    </SafeAreaView>
  );
};

export default Trim;
