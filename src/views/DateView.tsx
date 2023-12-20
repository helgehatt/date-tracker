import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, TODAY } from "../constants";
import SelectionContext from "../helpers/SelectionContext";
import { AppDataContext } from "../helpers/AppDataProvider";

interface IProps {
  year: number;
  month: number;
  day: number;
}

interface IMemoizableProps {
  color?: string;
  day: number;
  isToday: boolean;
  isSelected: boolean;
  onPress: () => void;
}

const DateView: React.FC<IProps> = ({ year, month, day }) => {
  const { selectedCategory } = React.useContext(AppDataContext);
  const {
    eventsByDate,
    selectedEvent,
    selectedStartDate,
    selectedStopDate,
    selectDate,
  } = React.useContext(SelectionContext);
  const datetime = Date.UTC(year, month, day);
  const isVisible = new Date(datetime).getMonth() == month;

  const onPress = React.useCallback(
    () => selectDate(datetime),
    [selectDate, datetime]
  );

  if (!isVisible) {
    return <MemoizedPlaceholder />;
  }

  const isToday = datetime == TODAY;
  const isEvent = datetime in eventsByDate;
  const isSelectedEvent =
    selectedEvent != null &&
    datetime >= selectedEvent.startDate &&
    datetime <= selectedEvent.stopDate;
  const isSelected =
    datetime === selectedStartDate ||
    (selectedStartDate !== undefined &&
      selectedStopDate !== undefined &&
      datetime >= selectedStartDate &&
      datetime <= selectedStopDate);
  const color = isSelected
    ? selectedCategory?.color
    : isSelectedEvent
    ? COLORS.tertiary
    : isEvent
    ? selectedCategory?.color
    : undefined;

  return (
    <MemoizableDateView
      color={color}
      day={day}
      isToday={isToday}
      isSelected={isSelected}
      onPress={onPress}
    />
  );
};

const _MemoizableDateView: React.FC<IMemoizableProps> = ({
  color,
  day,
  isToday,
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
          color !== undefined && { backgroundColor: color },
          isSelected && { opacity: 0.75 },
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
    borderRadius: 14,
  },
  text: {
    width: "70%",
    padding: 5,
    textAlign: "center",
    color: COLORS.text,
    borderRadius: 14,
    overflow: "hidden",
  },
});

export default DateView;
