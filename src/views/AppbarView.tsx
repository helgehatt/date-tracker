import React from "react";
import { SafeAreaView, StyleSheet, View, ViewStyle } from "react-native";
import { COLORS } from "../constants";
import { AppDataContext } from "../helpers/AppDataProvider";
import MyIcon from "../components/MyIcon";

interface IProps {
  style?: ViewStyle;
  page: AppPage;
  setPage: React.Dispatch<React.SetStateAction<AppPage>>;
}

const AppbarView: React.FC<IProps> = ({ style, page, setPage }) => {
  const { activeCategoryId } = React.useContext(AppDataContext);

  const disabled = activeCategoryId === null;

  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.buttonContainer}>
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: 10,
  },
  button: {
    padding: 10,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
  },
  buttonActive: {
    backgroundColor: COLORS.base,
  },
});

export default AppbarView;
