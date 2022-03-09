import "./src/extensions";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-bidirectional-infinite-scroll";
import SelectionManager from "./src/helpers/SelectionManager";
import MonthGenerator from "./src/helpers/MonthGenerator";
import SelectedDatesContext from "./src/helpers/SelectedDatesContext";
import MonthView from "./src/views/MonthView";
import HeaderView from "./src/views/HeaderView";
import { COLORS } from "./src/constants";

export default function App() {
  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() => [
    monthGenerator.prev(),
    monthGenerator.current,
    monthGenerator.next(),
    monthGenerator.next(),
  ]);
  const [selectionManager, setSelectionManager] = React.useState(
    () => new SelectionManager()
  );
  const [selectedCount, setSelectedCount] = React.useState(() =>
    selectionManager.getSelectedCount()
  );

  React.useEffect(() => {
    // Adding months must be slightly delayed to
    // keep current month in center
    const handle = setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        showNextMonth();
        showPreviousMonth();
      }
    }, 1);
    return () => clearTimeout(handle);
  }, []);

  React.useEffect(() => {
    setSelectedCount(selectionManager.getSelectedCount());
  }, [selectionManager]);

  React.useEffect(() => {
    selectionManager.load().then((selected) => {
      setSelectionManager((prevObj) => {
        const newObj = new SelectionManager(prevObj);
        selected
          .map((value) => new Date(value))
          .forEach((value) => newObj.dates.add(value));
        return newObj;
      });
    });
  }, []);

  const toggleDate = React.useCallback((date: Date) => {
    setSelectionManager((prevObj) => {
      const newObj = new SelectionManager(prevObj);
      newObj.select(date);
      return newObj;
    });
  }, []);

  const setReferenceDate = React.useCallback((date: Date) => {
    setSelectionManager((prevObj) => {
      const newObj = new SelectionManager(prevObj);
      newObj.setReferenceDate(date);
      return newObj;
    });
  }, []);

  const showPreviousMonth = React.useCallback(() => {
    setVisibleMonths((prevMonths) => [monthGenerator.prev(), ...prevMonths]);
    return Promise.resolve();
  }, []);

  const showNextMonth = React.useCallback(() => {
    setVisibleMonths((prevMonths) => [...prevMonths, monthGenerator.next()]);
    return Promise.resolve();
  }, []);

  return (
    <View>
      <HeaderView {...selectedCount} />
      <View style={styles.container}>
        <SelectedDatesContext.Provider
          value={{
            selectionManager,
            toggleDate,
            setReferenceDate,
          }}
        >
          <FlatList
            data={visibleMonths}
            renderItem={({ item: { year, month } }) => (
              <MonthView year={year} month={month} />
            )}
            keyExtractor={({ year, month }) => `${year}.${month}`}
            onStartReached={showPreviousMonth}
            onStartReachedThreshold={1000}
            onEndReached={showNextMonth}
            onEndReachedThreshold={1000}
            showsVerticalScrollIndicator={false}
          />
        </SelectedDatesContext.Provider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
});
