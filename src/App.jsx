import React, {useRef, useCallback, useState, useMemo} from 'react';
import {FlatList, Dimensions, SafeAreaView} from 'react-native';
import {reels} from './reels';
import Reelcard from './Reelcard';

const App = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const {height: screenHeight} = Dimensions.get('window');

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const handleMomentumScrollEnd = useCallback(
    event => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const newIndex = Math.round(offsetY / screenHeight);
      const currentOffset = newIndex * screenHeight;

      if (Math.abs(offsetY - currentOffset) > 10) {
        flatListRef.current?.scrollToOffset({
          offset: newIndex * screenHeight,
          animated: true,
        });
      }
      setCurrentIndex(newIndex);
    },
    [screenHeight],
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const handleScroll = useCallback(
    event => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const newIndex = Math.round(offsetY / screenHeight);

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    },
    [screenHeight, currentIndex],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <Reelcard item={item} index={index} currentIndex={currentIndex} />
    ),
    [currentIndex],
  );

  const keyExtractor = useCallback(item => item._id.toString(), []);

  const memoizedItem = useMemo(() => renderItem, [currentIndex, reels]);

  return (
    <SafeAreaView style={{height: screenHeight}}>
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={memoizedItem}
        pagingEnabled
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={screenHeight}
        decelerationRate="normal"
        initialScrollIndex={currentIndex}
        disableIntervalMomentum
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged} // Use onViewableItemsChanged directly here
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={5}
        windowSize={1}
        removeClippedSubviews
        onEndReachedThreshold={0.1}
      />
    </SafeAreaView>
  );
};

export default App;
