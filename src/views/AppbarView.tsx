import React from "react";
import { SafeAreaView, StyleSheet, View, ViewStyle } from "react-native";
import { COLORS } from "../constants";
import AppDataContext from "../helpers/AppDataContext";
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
          style={styles.button}
          onPress={() => setPage("calendar")}
          disabled={disabled}
          name="calendar"
          size="md"
          outline={page !== "calendar"}
        />
        <MyIcon
          style={styles.button}
          onPress={() => setPage("category")}
          name="tag"
          size="md"
          outline={page !== "category"}
        />
        <MyIcon
          style={styles.button}
          disabled={disabled}
          onPress={() => setPage("limits")}
          name="chart"
          size="md"
          outline={page !== "limits"}
        />
        {/* <MyIcon
        style={styles.button}
        onPress={() => setPage("settings")}
        name="gear"
        size="md"
        outline={page !== "settings"}
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
  },
});

export default AppbarView;
