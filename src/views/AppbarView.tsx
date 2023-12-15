import React from "react";
import { Pressable, SafeAreaView, StyleSheet, ViewStyle } from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { CategoryContext } from "../components/CategoryProvider";

type Pages = "category" | "calendar" | "limits" | "settings";

interface IProps {
  style?: ViewStyle;
  page: Pages;
  setPage: React.Dispatch<React.SetStateAction<Pages>>;
}

const AppbarView: React.FC<IProps> = ({ style, page, setPage }) => {
  const { selectedCategory } = React.useContext(CategoryContext);

  const disabled = selectedCategory === undefined;

  return (
    <SafeAreaView style={[styles.container, style]}>
      <Pressable
        style={[
          styles.button,
          page === "calendar" && styles.buttonActive,
          disabled && { opacity: 0.5 },
        ]}
        disabled={disabled}
        onPress={() => setPage("calendar")}
      >
        <EvilIcons name="calendar" size={50} color={COLORS.text} />
      </Pressable>
      <Pressable
        style={[styles.button, page === "category" && styles.buttonActive]}
        onPress={() => setPage("category")}
      >
        <EvilIcons name="tag" size={50} color={COLORS.text} />
      </Pressable>
      <Pressable
        style={[
          styles.button,
          page === "limits" && styles.buttonActive,
          disabled && { opacity: 0.5 },
        ]}
        disabled={disabled}
        onPress={() => setPage("limits")}
      >
        <EvilIcons name="chart" size={50} color={COLORS.text} />
      </Pressable>
      {/* <Pressable
        style={[styles.button, page === "settings" && styles.buttonActive]}
        onPress={() => setPage("settings")}
      >
        <EvilIcons name="gear" size={50} color={COLORS.text} />
      </Pressable> */}
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
