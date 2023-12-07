import "./src/extensions";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { COLORS } from "./src/constants";
import HeaderView from "./src/views/HeaderView";
import AppbarView from "./src/views/AppbarView";
import SelectionProvider from "./src/components/SelectionProvider";
import CalendarView from "./src/views/CalendarView";
import CategoryView from "./src/views/CategoryView";
import CategoryProvider from "./src/components/CategoryProvider";

export default function App() {
  const [page, setPage] = React.useState<
    "category" | "calendar" | "stats" | "settings"
  >("calendar");

  const pageStyle = {
    calendar: { display: "none" } as ViewStyle,
    category: { display: "none" } as ViewStyle,
    stats: { display: "none" } as ViewStyle,
    settings: { display: "none" } as ViewStyle,
  };
  pageStyle[page] = { flex: 1 };

  return (
    <CategoryProvider>
      <SelectionProvider>
        <View style={styles.container}>
          <HeaderView />
          <KeyboardAvoidingView
            style={styles.content}
            enabled={Platform.OS === "ios"}
            behavior="padding"
          >
            <CalendarView style={pageStyle["calendar"]} />
            <CategoryView style={pageStyle["category"]} />
            <View style={pageStyle["stats"]} />
            <View style={pageStyle["settings"]} />
          </KeyboardAvoidingView>
          <AppbarView page={page} setPage={setPage} />
        </View>
      </SelectionProvider>
    </CategoryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});
