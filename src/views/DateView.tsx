import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, TODAY } from "../constants";

interface IProps {
  year: number;
  month: number;
  date: number;
  selectedDates: Set<number>;
  selectDate: (datetime: number) => void;
  referenceDate: number;
  setReferenceDate: (datetime: number) => void;
}

interface IMemoizableProps {
  date: number;
  isToday: boolean;
  isSelected: boolean;
  isReference: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const DateView: React.FC<IProps> = ({
  year,
  month,
  date,
  selectedDates,
  selectDate,
  referenceDate,
  setReferenceDate,
}) => {
  const datetime = Date.UTC(year, month, date);
  const isVisible = new Date(datetime).getMonth() == month;

  const onPress = React.useCallback(
    () => selectDate(datetime),
    [datetime, selectDate]
  );
  const onLongPress = React.useCallback(
    () => setReferenceDate(datetime),
    [datetime, setReferenceDate]
  );

  if (!isVisible) {
    return <MemoizedPlaceholder />;
  }

  const isSelected = selectedDates.has(datetime);
  const isToday = datetime == TODAY;
  const isReference = datetime == referenceDate;

  return (
    <MemoizableDateView
      date={date}
      isToday={isToday}
      isSelected={isSelected}
      isReference={isReference}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
};

const _MemoizableDateView: React.FC<IMemoizableProps> = ({
  date,
  isToday,
  isSelected,
  isReference,
  onPress,
  onLongPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        isToday && styles.isToday,
        isReference && styles.isReference,
      ]}
    >
      <Text style={[styles.text, isSelected && styles.isSelected]}>{date}</Text>
    </Pressable>
  );
};
const MemoizableDateView = React.memo(_MemoizableDateView);

const _MemoizedPlaceholder: React.FC = () => {
  return <View style={styles.container} />;
};
const MemoizedPlaceholder = React.memo(_MemoizedPlaceholder);

const styles = StyleSheet.create({
  container: {
    flex: 111,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  isToday: {
    backgroundColor: COLORS.secondary,
  },
  isReference: {
    borderColor: COLORS.primary,
  },
  text: {
    width: "70%",
    padding: 5,
    textAlign: "center",
    color: COLORS.text,
  },
  isSelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    overflow: "hidden",
  },
});

export default DateView;
