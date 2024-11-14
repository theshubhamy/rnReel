import React, {useState, useCallback, useEffect} from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  AppState,
} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {useFocusEffect} from '@react-navigation/native';
import Video from 'react-native-video';

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [lastCursor, setLastCursor] = useState();
  const [loading, setLoading] = useState(true); // Initial loading state

  const fetchMedia = useCallback(async () => {
    if (hasNextPage) {
      setLoading(true);
      try {
        const result = await CameraRoll.getPhotos({
          first: 20,
          assetType: 'All',
          after: lastCursor || undefined,
        });
        const newMedia = result.edges.map(edge => ({
          type: edge.node.type,
          image: {uri: edge.node.image.uri},
        }));
        setMedia(prevMedia => [...prevMedia, ...newMedia]);
        setLastCursor(result.page_info.end_cursor || undefined);
        setHasNextPage(result.page_info.has_next_page);
      } catch (err) {
        console.error('Error fetching media:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [hasNextPage, lastCursor]);

  const fetchAlbums = useCallback(async () => {
    try {
      const albumList = await CameraRoll.getAlbums({assetType: 'All'});
      const albumNames = albumList.map(album => ({
        title: album.title,
        photos: [],
        expanded: false,
      }));
      setAlbums(albumNames);
    } catch (err) {
      console.error('Error fetching albums:', err);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMedia(), fetchAlbums()]);
    setLoading(false);
  }, [fetchMedia, fetchAlbums]);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData]),
  );

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      'change',
      nextAppState => {
        if (nextAppState === 'active') {
          loadInitialData();
        }
      },
    );

    return () => {
      appStateListener.remove();
    };
  }, [loadInitialData]);

  const renderMediaItem = ({item}) => (
    <View style={styles.mediaItem}>
      {item.type.includes('video') ? (
        <Video
          source={{uri: item.image.uri}}
          style={styles.video}
          resizeMode="cover"
          muted
          repeat
        />
      ) : (
        <Image style={styles.image} source={{uri: item.image.uri}} />
      )}
    </View>
  );

  const renderAlbum = ({item}) => (
    <View style={styles.albumContainer}>
      <TouchableOpacity onPress={() => fetchPhotosForAlbum(item.title)}>
        <Text style={styles.albumTitle}>{item.title}</Text>
      </TouchableOpacity>
      {item.expanded && (
        <FlatList
          data={item.photos}
          numColumns={3}
          keyExtractor={(photo, index) => index.toString()}
          renderItem={({item: photo}) => renderMediaItem({item: photo})}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  );

  const fetchPhotosForAlbum = async albumTitle => {
    setLoading(true);
    try {
      const photos = await CameraRoll.getPhotos({
        first: 20,
        assetType: 'All',
        groupName: albumTitle,
      });
      setAlbums(prevAlbums =>
        prevAlbums.map(album =>
          album.title === albumTitle
            ? {
                ...album,
                photos: photos.edges.map(edge => edge.node),
                expanded: !album.expanded,
              }
            : album,
        ),
      );
    } catch (err) {
      console.error('Error fetching photos for album:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recents</Text>
      <FlatList
        data={media}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMediaItem}
        onEndReached={fetchMedia}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#000" /> : null
        }
        columnWrapperStyle={styles.columnWrapper}
      />
      <Text style={styles.header}>Albums</Text>
      <FlatList
        data={albums}
        keyExtractor={item => item.title}
        renderItem={renderAlbum}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 10},
  header: {fontSize: 20, marginBottom: 10},
  mediaItem: {width: '30%', marginBottom: 10},
  video: {width: '100%', height: 100},
  image: {width: '100%', height: 100},
  columnWrapper: {justifyContent: 'space-between', marginBottom: 10},
  albumContainer: {marginBottom: 20},
  albumTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 5},
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});

export default Gallery;
