import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SelectionContext } from "../components/SelectionProvider";
import { COLORS, TODAY } from "../constants";
import { EventContext } from "../components/EventProvider";

interface IProps {
  year: number;
  month: number;
  day: number;
}

interface IMemoizableProps {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isStartDate: boolean;
  isStopDate: boolean;
  isReference: boolean;
  onPress: () => void;
}

const DateView: React.FC<IProps> = ({ year, month, day }) => {
  const { eventDates } = React.useContext(EventContext);
  const { selectedStartDate, selectedStopDate, selectDate } =
    React.useContext(SelectionContext);
  const datetime = Date.UTC(year, month, day);
  const isVisible = new Date(datetime).getMonth() == month;

  const onPress = React.useCallback(
    () => selectDate(datetime),
    [datetime, selectDate]
  );

  if (!isVisible) {
    return <MemoizedPlaceholder />;
  }

  const isSelected = eventDates.has(datetime);
  const isToday = datetime == TODAY;
  const isStartDate = datetime == selectedStartDate;
  const isStopDate = datetime == selectedStopDate;
  const isReference = false;

  return (
    <MemoizableDateView
      day={day}
      isToday={isToday}
      isSelected={isSelected}
      isStartDate={isStartDate}
      isStopDate={isStopDate}
      isReference={isReference}
      onPress={onPress}
    />
  );
};

const _MemoizableDateView: React.FC<IMemoizableProps> = ({
  day,
  isToday,
  isSelected,
  isStartDate,
  isStopDate,
  isReference,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        isToday && styles.isToday,
        isReference && styles.isReference,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSelected && styles.isSelected,
          isStartDate && styles.isStartDate,
          isStopDate && styles.isStopDate,
        ]}
      >
        {day}
      </Text>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  isToday: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
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
    borderRadius: 14,
    overflow: "hidden",
  },
  isStartDate: {
    backgroundColor: "red",
  },
  isStopDate: {
    color: "blue",
  },
});

export default DateView;
