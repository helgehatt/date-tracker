import "./src/extensions";
import React from "react";
import { StyleSheet, View } from "react-native";
import { COLORS, MONTH_VIEW_HEIGHT, TODAY } from "./src/constants";
import ApplicationStorage from "./src/helpers/ApplicationStorage";
import BidirectionalFlatList from "./src/components/BidirectionalFlatList";
import CountProfile from "./src/helpers/CountProfile";
import HeaderView from "./src/views/HeaderView";
import MonthGenerator from "./src/helpers/MonthGenerator";
import MonthView from "./src/views/MonthView";
import AppbarView from "./src/views/AppbarView";
import AddEventView from "./src/views/event/AddEventView";

export default function App() {
  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() =>
    monthGenerator.init(5, 5)
  );
  const [editMode, setEditMode] = React.useState(false);
  const [selectedStartDate, setSelectedStartDate] = React.useState<number>();
  const [selectedStopDate, setSelectedStopDate] = React.useState<number>();

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

  React.useEffect(() => {
    if (!editMode) {
      setSelectedStartDate(undefined);
      setSelectedStopDate(undefined);
    }
  }, [editMode]);

  const selectDate = React.useCallback(
    (datetime: number) => {
      if (editMode) {
        if (selectedStartDate === undefined) {
          setSelectedStartDate(datetime);
        } else if (datetime < selectedStartDate) {
          setSelectedStartDate(datetime);
        } else {
          setSelectedStopDate(datetime);
        }
      }
    },
    [editMode, selectedStartDate]
  );

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

  const showPreviousMonth = React.useCallback(() => {
    setVisibleMonths((months) => [monthGenerator.prev(), ...months]);
  }, [monthGenerator]);

  const showNextMonth = React.useCallback(() => {
    setVisibleMonths((months) => [...months, monthGenerator.next()]);
  }, [monthGenerator]);

  return (
    <View style={styles.container}>
      <HeaderView countProfiles={countProfiles} />
      <View style={styles.calendar}>
        <BidirectionalFlatList
          data={visibleMonths}
          renderItem={({ item: { year, month } }) => (
            <MonthView
              year={year}
              month={month}
              selectedDates={selectedDates}
              selectDate={selectDate}
              selectedStartDate={selectedStartDate}
              selectedStopDate={selectedStopDate}
              referenceDate={referenceDate}
              setReferenceDate={setReferenceDateAndResetCount}
            />
          )}
          getItemLayout={(_, index) => ({
            length: MONTH_VIEW_HEIGHT,
            offset: MONTH_VIEW_HEIGHT * index,
            index,
          })}
          initialScrollIndex={5}
          keyExtractor={({ year, month }) => `${year}.${month}`}
          onStartReached={showPreviousMonth}
          onStartReachedThreshold={1000}
          onEndReached={showNextMonth}
          onEndReachedThreshold={1000}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <AddEventView
        style={styles.addevent}
        editMode={editMode}
        setEditMode={setEditMode}
        selectedStartDate={selectedStartDate}
        setSelectedStartDate={setSelectedStartDate}
        selectedStopDate={selectedStopDate}
        setSelectedStopDate={setSelectedStopDate}
      />
      <AppbarView
        style={styles.appbar}
        editMode={editMode}
        setEditMode={setEditMode}
      />
    </View>
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
