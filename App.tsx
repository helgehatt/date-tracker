import "./src/extensions";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-bidirectional-infinite-scroll";
import { COLORS, MONTH_VIEW_HEIGHT, TODAY } from "./src/constants";
import ApplicationStorage from "./src/helpers/ApplicationStorage";
import CountProfile from "./src/helpers/CountProfile";
import HeaderView from "./src/views/HeaderView";
import MonthGenerator from "./src/helpers/MonthGenerator";
import MonthView from "./src/views/MonthView";

export default function App() {
  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() =>
    monthGenerator.init(5, 5)
  );

  const [selectedDates, setSelectedDates] = React.useState(new Set<number>());
  const [referenceDate, setReferenceDate] = React.useState(TODAY);
  const [countProfiles, setCountProfiles] = React.useState(() =>
    CountProfile.getDefaultProfiles(referenceDate)
  );

  React.useEffect(() => {
    ApplicationStorage.loadSelectedDates().then((loadedDates) => {
      setSelectedDates((selectedDates) => {
        const datetimes = [...selectedDates, ...loadedDates];
        setCountProfiles((profiles) => [
          ...profiles.map((profile) => profile.reset(datetimes)),
        ]);
        return new Set(datetimes);
      });
    });
  }, []);

  React.useEffect(() => {
    ApplicationStorage.saveSelectedDates([...selectedDates]);
  }, [selectedDates]);

  const selectDate = React.useCallback((datetime: number) => {
    setSelectedDates((dates) => {
      if (dates.delete(datetime)) {
        setCountProfiles((profiles) => [
          ...profiles.map((profile) => profile.remove(datetime)),
        ]);
        return new Set(dates);
      } else {
        setCountProfiles((profiles) => [
          ...profiles.map((profile) => profile.add(datetime)),
        ]);
        return new Set(dates).add(datetime);
      }
    });
  }, []);

  const setReferenceDateAndResetCount = React.useCallback(
    (datetime: number) => {
      setReferenceDate(datetime);
      setSelectedDates((selectedDates) => {
        setCountProfiles((profiles) => {
          for (const profile of profiles) {
            profile.setInterval(datetime);
            profile.reset(Array.from(selectedDates));
          }
          return [...profiles];
        });
        return selectedDates;
      });
    },
    []
  );

  const showPreviousMonth = React.useCallback(() => {
    setVisibleMonths((months) => [monthGenerator.prev(), ...months]);
    return Promise.resolve();
  }, [monthGenerator]);

  const showNextMonth = React.useCallback(() => {
    setVisibleMonths((months) => [...months, monthGenerator.next()]);
    return Promise.resolve();
  }, [monthGenerator]);

  return (
    <View>
      <HeaderView countProfiles={countProfiles} />
      <View style={styles.container}>
        <FlatList
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
});
