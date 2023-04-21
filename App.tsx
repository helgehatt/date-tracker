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

export default function App() {
  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() =>
    monthGenerator.init(5, 5)
  );
  const [editMode, setEditMode] = React.useState(false);

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

  const selectDate = React.useCallback((datetime: number) => {
    setSelectedDates((dates) => {
      if (dates.delete(datetime)) {
        setCountProfiles((profiles) =>
          profiles.map((profile) => profile.remove(datetime))
        );
        return new Set(dates);
      } else {
        setCountProfiles((profiles) =>
          profiles.map((profile) => profile.add(datetime))
        );
        return new Set(dates).add(datetime);
      }
    });
  }, []);

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
  appbar: {
    height: 100,
  },
});
