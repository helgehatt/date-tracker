import React from "react";
import { Pressable, SafeAreaView, StyleSheet, ViewStyle } from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { COLORS } from "../constants";

interface IProps {
  style?: ViewStyle;
  page: "category" | "calendar" | "stats" | "settings";
  setPage: React.Dispatch<
    React.SetStateAction<"category" | "calendar" | "stats" | "settings">
  >;
}

const AppbarView: React.FC<IProps> = ({ style, page, setPage }) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <Pressable
        style={[styles.button, page === "calendar" && styles.buttonActive]}
        onPress={() => setPage("calendar")}
      >
        <EvilIcons name="calendar" size={50} color="white" />
      </Pressable>
      <Pressable
        style={[styles.button, page === "category" && styles.buttonActive]}
        onPress={() => setPage("category")}
      >
        <EvilIcons name="tag" size={50} color="white" />
      </Pressable>
      <Pressable
        style={[styles.button, page === "stats" && styles.buttonActive]}
        onPress={() => setPage("stats")}
      >
        <EvilIcons name="chart" size={50} color="white" />
      </Pressable>
      <Pressable
        style={[styles.button, page === "settings" && styles.buttonActive]}
        onPress={() => setPage("settings")}
      >
        <EvilIcons name="gear" size={50} color="white" />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.tertiary,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  button: {
    padding: 10,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
  },
  buttonActive: {
    backgroundColor: COLORS.background,
  },
});

export default AppbarView;
