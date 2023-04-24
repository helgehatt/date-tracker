import "./src/extensions";
import React from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "./src/constants";
import HeaderView from "./src/views/HeaderView";
import AppbarView from "./src/views/AppbarView";
import AddEventView from "./src/views/event/AddEventView";
import SelectionProvider from "./src/components/SelectionProvider";
import CalendarView from "./src/views/CalendarView";
import EventProvider from "./src/components/EventProvider";

export default function App() {
  return (
    <SelectionProvider>
      <EventProvider>
        <View style={styles.container}>
          <HeaderView />
          <CalendarView style={styles.calendar} />
          <AddEventView style={styles.addevent} />
          <AppbarView style={styles.appbar} />
        </View>
      </EventProvider>
    </SelectionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  calendar: {
    flexShrink: 1,
  },
  addevent: {},
  appbar: {
    height: 100,
  },
});
