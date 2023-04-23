import "./src/extensions";
import React from "react";
import { StyleSheet, View } from "react-native";
import { COLORS, TODAY } from "./src/constants";
import ApplicationStorage from "./src/helpers/ApplicationStorage";
import CountProfile from "./src/helpers/CountProfile";
import HeaderView from "./src/views/HeaderView";
import AppbarView from "./src/views/AppbarView";
import AddEventView from "./src/views/event/AddEventView";
import SelectionProvider from "./src/components/SelectionProvider";
import CalendarView from "./src/views/CalendarView";

export default function App() {
  const [selectedDates, setSelectedDates] = React.useState(new Set<number>());
  const [referenceDate, setReferenceDate] = React.useState(TODAY);
  const [countProfiles, setCountProfiles] = React.useState(() =>
    CountProfile.DEFAULT_METADATA.map((metadata) =>
      CountProfile.fromReferenceDate(metadata, referenceDate)
    )
  );

  React.useEffect(() => {
    ApplicationStorage.loadSelectedDates().then((loadedDates) => {
      setSelectedDates((selectedDates) => {
        setCountProfiles((profiles) =>
          profiles.map((profile) => profile.add(...loadedDates))
        );
        return new Set([...selectedDates, ...loadedDates]);
      });
    });
  }, []);

  React.useEffect(() => {
    ApplicationStorage.saveSelectedDates([...selectedDates]);
  }, [selectedDates]);

  const setReferenceDateAndResetCount = React.useCallback(
    (newReferenceDate: number) => {
      setReferenceDate(newReferenceDate);
      setSelectedDates((selectedDates) => {
        setCountProfiles((profiles) => {
          return profiles.map((profile) =>
            CountProfile.fromReferenceDate(
              profile.metadata,
              newReferenceDate
            ).add(...selectedDates)
          );
        });
        return selectedDates;
      });
    },
    []
  );

  return (
    <SelectionProvider>
      <View style={styles.container}>
        <HeaderView countProfiles={countProfiles} />
        <CalendarView style={styles.calendar} />
        <AddEventView style={styles.addevent} />
        <AppbarView style={styles.appbar} />
      </View>
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
