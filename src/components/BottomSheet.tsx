import React from "react";
import {
  Animated,
  StyleSheet,
  PanResponder,
  View,
  ViewStyle,
} from "react-native";

interface IProps {
  visible?: boolean;
  height?: number;
  minClosingHeight?: number;
  openDuration?: number;
  closeDuration?: number;
  closeOnSwipeDown?: boolean;
  closeOnSwipeTrigger?: () => void;
  keyboardAvoidingViewEnabled?: boolean;
  customStyles?: {
    container?: ViewStyle;
    draggableContainer?: ViewStyle;
    draggableIcon?: ViewStyle;
  };
}

const BottomSheet: React.FC<React.PropsWithChildren<IProps>> = ({
  visible = false,
  height = 260,
  minClosingHeight = 0,
  openDuration = 300,
  closeDuration = 200,
  closeOnSwipeDown = false,
  closeOnSwipeTrigger = () => {},
  customStyles = {},
  children,
}) => {
  const [panY] = React.useState(new Animated.Value(height));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => closeOnSwipeDown,
    onPanResponderMove: (e, gestureState) => {
      if (gestureState.dy > 0) {
        Animated.event([null, { dy: panY }], {
          useNativeDriver: false,
        })(e, gestureState);
      }
    },
    onPanResponderRelease: (_e, gestureState) => {
      if (gestureState.dy > height * 0.4 || gestureState.vy > 0.5) {
        Animated.timing(panY, {
          useNativeDriver: false,
          toValue: height,
          duration: closeDuration,
        }).start(closeOnSwipeTrigger);
      } else {
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  React.useEffect(() => {
    if (visible) {
      Animated.timing(panY, {
        useNativeDriver: false,
        toValue: 0,
        duration: openDuration,
      }).start();
    } else {
      Animated.timing(panY, {
        useNativeDriver: false,
        toValue: height,
        duration: closeDuration,
      }).start();
    }
  }, [panY, height, minClosingHeight, visible, closeDuration, openDuration]);

  return (
    <Animated.View
      style={[
        styles.container,
        customStyles.container,
        { height: Animated.subtract(height, panY) },
      ]}
    >
      {closeOnSwipeDown && (
        <View
          {...panResponder.panHandlers}
          style={[styles.draggableContainer, customStyles.draggableContainer]}
        >
          <View
            style={[styles.draggableIcon, customStyles.draggableIcon]}
          ></View>
        </View>
      )}
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {},
  draggableContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  draggableIcon: {
    height: 5,
    width: 40,
    backgroundColor: "white",
    borderRadius: 15,
  },
});

export default BottomSheet;
