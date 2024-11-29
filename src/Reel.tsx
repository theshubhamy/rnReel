import React, {useRef, useCallback, useState} from 'react';
import {FlatList, Dimensions, RefreshControl, View} from 'react-native';
import Reelcard from './Reelcard';
import {reels} from './reels';
import {SwiperFlatList} from './SwiperFlatList';
import {useAutoContinue} from './useAutoContinue';
interface Owner {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

interface Comment {
  user: Owner;
  comment: string;
  likes: string[];
  replies: Reply[];
  _id: string;
  createdAt: string;
}

interface Reply {
  user: Owner;
  reply: string;
  likes: string[];
  _id: string;
  createdAt: string;
}

interface MediaItem {
  _id: string;
  owner: Owner;
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl: string;
  likes: {isLikedByMe: false; likeCount: string; recentLike: any};
  downloads: number;
  sharedWith: string[];
  comments: Comment[];
}

interface Pagination {
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface FetchResponse {
  items: MediaItem[];
  pagination: Pagination;
  reels: MediaItem[];
  memes: MediaItem[];
  key: AnyJson;
}

type AnyJson = {
  [key: string]: string;
};

const {height: screenHeight} = Dimensions.get('window');

const Reel: React.FC = () => {
  const [mute, setMute] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList<MediaItem>>(null);

  // Function to handle refreshing
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  const {
    autoContinue,
    toggleAutoContinue,
    handleVideoEnd,
    currentIndex,
    setCurrentIndex,
  } = useAutoContinue(flatListRef, reels.length, screenHeight);
  const handleEndReached = () => {
    const mediaDataLength = reels.length || 0;
    if (currentIndex >= mediaDataLength - 2) {
      console.log('fetchNextPage');
    }
  };
  const preloadVideos = useCallback(() => {
    const preloadUrls: string[] = [];
    for (let i = 1; i <= 2; i++) {
      const preloadIndex = currentIndex + i;
      if (preloadIndex < reels.length) {
        preloadUrls.push(reels[preloadIndex]?.videoUrl);
      }
    }
    return preloadUrls;
  }, [currentIndex]);

  const handleViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: any[]}) => {
      if (viewableItems.length > 0) {
        const nextIndex = viewableItems[0]?.index;
        if (nextIndex !== currentIndex) {
          setCurrentIndex(nextIndex);
        }
      }
    },
    [currentIndex, setCurrentIndex],
  );

  const renderItem = useCallback(
    ({item, index}: {item: MediaItem; index: number}) => (
      <Reelcard
        item={item}
        index={index}
        setMute={setMute}
        mute={mute}
        currentIndex={currentIndex}
        screenHeight={screenHeight}
        preloadUrls={preloadVideos()}
        onVideoEnd={handleVideoEnd}
        handleContinue={toggleAutoContinue}
        autoContinue={autoContinue}
      />
    ),
    [
      autoContinue,
      currentIndex,
      handleVideoEnd,
      mute,
      preloadVideos,
      toggleAutoContinue,
    ],
  );

  const keyExtractor = useCallback(
    (item: MediaItem, index: number) => index?.toString(),
    [],
  );

  return (
    <View style={{height: screenHeight}}>
      <SwiperFlatList
        ref={flatListRef}
        data={reels}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        index={currentIndex}
        initialScrollIndex={currentIndex}
        vertical
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={screenHeight}
        snapToAlignment="start"
        onViewableItemsChanged={handleViewableItemsChanged}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.8}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default Reel;
