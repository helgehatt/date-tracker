import React from "react";
import {
  FlatList,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

interface IProps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends Omit<FlatListProps<any>, "maintainVisibleContentPosition"> {
  onStartReached: () => void;
  onEndReached: () => void;
  onStartReachedThreshold: number;
  onEndReachedThreshold: number;
}

const BidirectionalFlatList: React.FC<IProps> = ({
  onScroll,
  onStartReached,
  onEndReached,
  onStartReachedThreshold,
  onEndReachedThreshold,
  ...props
}) => {
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScroll?.(event);

    const offset = event.nativeEvent.contentOffset.y;
    const visibleLength = event.nativeEvent.layoutMeasurement.height;
    const contentLength = event.nativeEvent.contentSize.height;

    if (offset < onStartReachedThreshold) {
      onStartReached();
    }

    if (contentLength - visibleLength - offset < onEndReachedThreshold) {
      onEndReached();
    }
  };

  return (
    <FlatList
      {...props}
      onScroll={handleScroll}
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
    />
  );
};

export default BidirectionalFlatList;
