import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import BidirectionalFlatList from "../components/BidirectionalFlatList";
import MonthView from "./MonthView";
import MonthGenerator from "../helpers/MonthGenerator";
import { MONTH_VIEW_HEIGHT } from "../constants";

interface IProps {
  style?: ViewStyle;
}

const CalendarView: React.FC<IProps> = ({ style }) => {
  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() =>
    monthGenerator.init(5, 5)
  );

  const showPreviousMonth = React.useCallback(() => {
    setVisibleMonths((months) => [monthGenerator.prev(), ...months]);
  }, [monthGenerator]);

  const showNextMonth = React.useCallback(() => {
    setVisibleMonths((months) => [...months, monthGenerator.next()]);
  }, [monthGenerator]);

  return (
    <View style={[styles.container, style]}>
      <BidirectionalFlatList
        data={visibleMonths}
        renderItem={({ item: { year, month } }) => (
          <MonthView year={year} month={month} />
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
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default CalendarView;
