import React from "react";
import { Animated, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { SelectionContext } from "../components/SelectionProvider";

interface IProps {
  style?: ViewStyle;
  page: "category" | "calendar" | "settings";
  setPage: React.Dispatch<
    React.SetStateAction<"category" | "calendar" | "settings">
  >;
}

const AppbarView: React.FC<IProps> = ({ style, page, setPage }) => {
  const [rotationPct] = React.useState(new Animated.Value(0));
  const { selectMode, toggleSelectMode } = React.useContext(SelectionContext);

  React.useEffect(() => {
    Animated.timing(rotationPct, {
      useNativeDriver: true,
      toValue: selectMode ? 1 : 0,
    }).start();
  }, [rotationPct, selectMode]);

  const rotationDeg = rotationPct.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={() => setPage("category")}>
        <EvilIcons name="navicon" size={50} color="white" />
      </Pressable>
      {page === "calendar" ? (
        <View>
          <Animated.View style={{ transform: [{ rotate: rotationDeg }] }}>
            <Pressable onPress={toggleSelectMode}>
              <EvilIcons name="plus" size={50} color="white" />
            </Pressable>
          </Animated.View>
        </View>
      ) : (
        <Pressable onPress={() => setPage("calendar")}>
          <EvilIcons name="calendar" size={50} color="white" />
        </Pressable>
      )}
      <Pressable onPress={() => setPage("settings")}>
        <EvilIcons name="gear" size={45} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.tertiary,
    paddingTop: 10,
    paddingBottom: 25,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default AppbarView;
