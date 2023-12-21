import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import BidirectionalFlatList from "../components/BidirectionalFlatList";
import MonthView from "./MonthView";
import MonthGenerator from "../helpers/MonthGenerator";
import { COLORS, MONTH_VIEW_HEIGHT } from "../constants";
import CalendarEventView from "./CalendarEventView";
import { EvilIcons } from "@expo/vector-icons";
import { SelectionContext } from "../components/SelectionProvider";

interface IProps {
  style?: ViewStyle;
}

const CalendarView: React.FC<IProps> = ({ style }) => {
  const { toggleSelectMode } = React.useContext(SelectionContext);
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
    <KeyboardAvoidingView
      enabled={Platform.OS === "ios"}
      behavior="padding"
      style={[styles.container, style]}
    >
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
        ListHeaderComponent={
          <ActivityIndicator
            size="large"
            color={COLORS.text}
            style={{ marginVertical: 50 }}
          />
        }
        ListFooterComponent={
          <ActivityIndicator
            size="large"
            color={COLORS.text}
            style={{ marginVertical: 50 }}
          />
        }
      />
      <View style={styles.selectButtonContainer}>
        <Pressable onPress={toggleSelectMode}>
          <EvilIcons name="plus" size={75} color="white" />
        </Pressable>
      </View>
      <CalendarEventView />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {},
  selectButtonContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
});

export default CalendarView;
