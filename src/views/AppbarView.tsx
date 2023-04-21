import React from "react";
import { Animated, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { COLORS } from "../constants";

interface IProps {
  style?: ViewStyle;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppbarView: React.FC<IProps> = ({ style, editMode, setEditMode }) => {
  const [rotationPct] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(rotationPct, {
      useNativeDriver: true,
      toValue: editMode ? 1 : 0,
    }).start();
  }, [editMode]);

  const rotationDeg = rotationPct.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <View style={[styles.container, style]}>
      <View>
        <Animated.View style={{ transform: [{ rotate: rotationDeg }] }}>
          <Pressable onPress={() => setEditMode((prev) => !prev)}>
            <EvilIcons name="plus" size={64} color="white" />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.tertiary,
    padding: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default AppbarView;
