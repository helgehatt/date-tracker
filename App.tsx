import "./src/extensions";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { COLORS } from "./src/constants";
import HeaderView from "./src/views/HeaderView";
import AppbarView from "./src/views/AppbarView";
import SelectionProvider from "./src/components/SelectionProvider";
import CalendarView from "./src/views/CalendarView";
import EventProvider from "./src/components/EventProvider";
import CategoryView from "./src/views/CategoryView";
import CategoryProvider from "./src/components/CategoryProvider";

export default function App() {
  const [page, setPage] = React.useState<"category" | "calendar" | "settings">(
    "calendar"
  );
  const pageStyle = {
    calendar: { display: "none" } as ViewStyle,
    category: { display: "none" } as ViewStyle,
    settings: { display: "none" } as ViewStyle,
  };
  pageStyle[page] = { flex: 1 };

  return (
    <CategoryProvider>
      <SelectionProvider>
        <EventProvider>
          <View style={styles.container}>
            <HeaderView />
            <CalendarView style={pageStyle["calendar"]} />
            <CategoryView style={pageStyle["category"]} />
            <View style={pageStyle["settings"]} />
            <AppbarView page={page} setPage={setPage} />
          </View>
        </EventProvider>
      </SelectionProvider>
    </CategoryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
