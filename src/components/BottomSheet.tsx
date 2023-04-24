import React from "react";
import {
  KeyboardAvoidingView,
  Animated,
  Platform,
  StyleSheet,
} from "react-native";

interface IProps {
  visible?: boolean;
  height?: number;
  minClosingHeight?: number;
  openDuration?: number;
  closeDuration?: number;
  keyboardAvoidingViewEnabled?: boolean;
}

const BottomSheet: React.FC<React.PropsWithChildren<IProps>> = ({
  visible = false,
  height = 260,
  minClosingHeight = 0,
  openDuration = 300,
  closeDuration = 200,
  keyboardAvoidingViewEnabled = Platform.OS === "ios",
  children,
}) => {
  const [animatedHeight] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(animatedHeight, {
        useNativeDriver: false,
        toValue: height,
        duration: openDuration,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        useNativeDriver: false,
        toValue: minClosingHeight,
        duration: closeDuration,
      }).start();
    }
  }, [
    animatedHeight,
    height,
    minClosingHeight,
    visible,
    closeDuration,
    openDuration,
  ]);

  return (
    <KeyboardAvoidingView
      enabled={keyboardAvoidingViewEnabled}
      behavior="padding"
    >
      <Animated.View style={[styles.container, { height: animatedHeight }]}>
        {children}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});

export default BottomSheet;
