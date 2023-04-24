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
  isEvent: boolean;
  isSelected: boolean;
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

  const isToday = datetime == TODAY;
  const isEvent = eventDates.has(datetime);
  const isSelected =
    datetime === selectedStartDate ||
    (selectedStartDate !== undefined &&
      selectedStopDate !== undefined &&
      datetime >= selectedStartDate &&
      datetime <= selectedStopDate);

  return (
    <MemoizableDateView
      day={day}
      isToday={isToday}
      isEvent={isEvent}
      isSelected={isSelected}
      onPress={onPress}
    />
  );
};

const _MemoizableDateView: React.FC<IMemoizableProps> = ({
  day,
  isToday,
  isEvent,
  isSelected,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, isToday && styles.isToday]}
    >
      <Text
        style={[
          styles.text,
          isEvent && styles.isEvent,
          isSelected && styles.isEvent,
          isSelected && styles.isSelected,
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
  },
  isToday: {
    backgroundColor: COLORS.secondary,
  },
  text: {
    width: "70%",
    padding: 5,
    textAlign: "center",
    color: COLORS.text,
  },
  isEvent: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    overflow: "hidden",
  },
  isSelected: {
    opacity: 0.75,
  },
});

export default DateView;
