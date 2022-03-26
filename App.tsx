import "./src/extensions";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-bidirectional-infinite-scroll";
import SelectionManager from "./src/helpers/SelectionManager";
import MonthGenerator from "./src/helpers/MonthGenerator";
import MonthView from "./src/views/MonthView";
import HeaderView from "./src/views/HeaderView";
import { COLORS, MONTH_VIEW_HEIGHT } from "./src/constants";

export default function App() {
  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() =>
    monthGenerator.init(5, 5)
  );
  const [selectionManager, setSelectionManager] = React.useState(
    () => new SelectionManager()
  );

  React.useEffect(() => {
    selectionManager.load().then((selected) => {
      setSelectionManager((prevObj) => {
        const newObj = new SelectionManager(prevObj);
        for (const datetime of selected) {
          newObj.select(new Date(datetime));
        }
        return newObj;
      });
    });
  }, []);

  const selectDate = React.useCallback((date: Date) => {
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
      <HeaderView {...selectionManager.getSelectedCount()} />
      <View style={styles.container}>
        <FlatList
          data={visibleMonths}
          renderItem={({ item: { year, month } }) => (
            <MonthView
              year={year}
              month={month}
              selectionManager={selectionManager}
              selectDate={selectDate}
              setReferenceDate={setReferenceDate}
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
