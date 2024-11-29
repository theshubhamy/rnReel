import {ViewabilityConfig, FlatListProps} from 'react-native';
import {ViewStyle} from 'react-native';

export type PaginationProps = {
  /**
   * Scroll to the index
   *
   */
  scrollToIndex: (item: {index: number}) => void;
  /**
   * Size of pagination
   *
   */
  size: number;
  /**
   * Selected pagination index
   * Defaults to '0'
   *
   */
  paginationIndex?: number;
  /**
   * Pagination color
   * Defaults to 'white'
   *
   */
  paginationActiveColor?: string;
  /**
   * Pagination color
   * Defaults to 'gray'
   *
   */
  paginationDefaultColor?: string;
  /**
   * Style object for the container
   * Defaults to '{}'
   *
   */
  paginationStyle?: ViewStyle;
  /**
   * Style object for the item (dot)
   * Defaults to '{}'
   *
   */
  paginationStyleItem?: ViewStyle;
  /**
   * Style object for the active item (dot)
   * Defaults to '{}'
   *
   */
  paginationStyleItemActive?: ViewStyle;
  /**
   * Style object for the inactive item (dot)
   * Defaults to '{}'
   *
   */
  paginationStyleItemInactive?: ViewStyle;
  /**
   * Executed when the user presses the pagination index, similar properties onChangeIndex
   *
   */
  onPaginationSelectedIndex?: () => void;
  /**
   * Prevents tapping pagination dots
   * Defaults to false
   */
  paginationTapDisabled?: boolean;
  /**
   * TestID for automation testing
   *
   */
  e2eID?: string;
  /**
   * Accessibility labels for the pagination items.
   * This is optional and used for screen readers.
   */
  paginationAccessibilityLabels?: string[];
};
type ScrollToIndex = {index: number; animated?: boolean}; // DUPLICATED
export type SwiperFlatListRefProps = {
  getCurrentIndex: () => number;
  getPrevIndex: () => number;
  scrollToIndex: (item: ScrollToIndex) => void;
  goToLastIndex: () => void;
  goToFirstIndex: () => void;
};

export type SwiperFlatListProps<T> = Partial<FlatListProps<T>> & {
  /**
   * Children elements
   *
   */
  children?: React.ReactNode | React.ReactNode[];

  /**
   * Data to use in renderItem
   * not required if children is used
   *
   */
  data?: T[];

  /**
   * Show vertical swiper
   * Defaults to 'false'
   *
   */
  vertical?: boolean;

  /**
   * Index to start
   * Defaults to '0'
   *
   */
  index?: number;

  /**
   * Render all the items before display it
   * Defaults to 'false'
   *
   */
  renderAll?: boolean;

  /**
   * Takes an item from data and renders it into the list
   * not required if children is used
   *
   */
  renderItem?: FlatListProps<T>['renderItem'];

  /**
   * Executed every time the index change, the index change when the user reaches 60% of the next screen
   *
   */
  onChangeIndex?: (item: {index: number; prevIndex: number}) => void;

  /**
   * Disable swipe gesture
   * Defaults to 'false'
   *
   */
  disableGesture?: boolean;

  /**
   * TestID for automation testing
   *
   */
  e2eID?: string;

  //#region Autoplay

  /**
   * Delay between every page in seconds
   * Defaults to '3'
   *
   */
  autoplayDelay?: number;
  height?: number;

  /**
   * Change index automatically
   * Defaults to 'false'
   *
   */
  autoplay?: boolean;

  /**
   * Invert auto play direction
   * Defaults to 'false'
   *
   */
  autoplayInvertDirection?: boolean;

  /**
   * Continue playing after reach end
   * Defaults to 'false'
   *
   */
  autoplayLoop?: boolean;

  /**
   * Show animation when reach the end of the list
   * Defaults to 'false'
   *
   */
  autoplayLoopKeepAnimation?: boolean;

  //#endregion

  //#region RN props
  /**
   * Called after scroll end and the first parameter is the current index
   *
   */
  onMomentumScrollEnd?: (item: {index: number}, event: any) => void;
  // onMomentumScrollEnd: ScrollViewProps['onMomentumScrollEnd'];

  /**
   * See https://github.com/facebook/react-native/blob/master/Libraries/Lists/VirtualizedList.js#L240 for further documentation.
   *
   */
  onViewableItemsChanged?: FlatListProps<T>['onViewableItemsChanged'];

  /**
   * See https://github.com/facebook/react-native/blob/master/Libraries/Lists/VirtualizedList.js#L280 for further documentation.
   */
  viewabilityConfig?: ViewabilityConfig;

  //#endregion

  //#region Pagination

  /**
   * Show pagination
   * Defaults to 'false'
   *
   */
  showPagination?: boolean;

  /**
   * Overwrite Pagination component
   *
   */
  PaginationComponent?: React.FC<PaginationProps>;

  /**
   * Use react-native-gesture-handler FlatList instead of the native FlatList
   *
   * Defaults to 'false'
   */
  useReactNativeGestureHandler?: boolean;
  /**
   * Accessibility labels for the pagination items.
   * This is optional and used for screen readers.
   */
  paginationAccessibilityLabels?: string[];
} & Pick<
    PaginationProps,
    | 'paginationActiveColor'
    | 'paginationDefaultColor'
    | 'paginationStyle'
    | 'paginationStyleItem'
    | 'paginationStyleItemActive'
    | 'paginationStyleItemInactive'
    | 'onPaginationSelectedIndex'
    | 'paginationTapDisabled'
    | 'paginationAccessibilityLabels'
  >;
//#endregion Pagination
