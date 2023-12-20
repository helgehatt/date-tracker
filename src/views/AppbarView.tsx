import React from "react";
import { SafeAreaView, StyleSheet, ViewStyle } from "react-native";
import { COLORS } from "../constants";
import { CategoryContext } from "../components/CategoryProvider";
import MyIcon from "../components/MyIcon";

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
      <MyIcon
        style={[styles.button, page === "calendar" && styles.buttonActive]}
        onPress={() => setPage("calendar")}
        disabled={disabled}
        name="calendar"
        size="md"
      />
      <MyIcon
        style={[styles.button, page === "category" && styles.buttonActive]}
        onPress={() => setPage("category")}
        name="tag"
        size="md"
      />
      <MyIcon
        style={[styles.button, page === "limits" && styles.buttonActive]}
        disabled={disabled}
        onPress={() => setPage("limits")}
        name="chart"
        size="md"
      />
      {/* <MyIcon
        style={[styles.button, page === "settings" && styles.buttonActive]}
        onPress={() => setPage("settings")}
        name="gear"
        size="md"
      /> */}
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
