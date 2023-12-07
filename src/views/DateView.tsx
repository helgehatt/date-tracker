import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, TODAY } from "../constants";
import { SelectionContext } from "../components/SelectionProvider";
import { CategoryContext } from "../components/CategoryProvider";

interface IProps {
  year: number;
  month: number;
  day: number;
}

interface IMemoizableProps {
  color?: string;
  day: number;
  isToday: boolean;
  isEvent: boolean;
  isSelected: boolean;
  onPress: () => void;
}

const DateView: React.FC<IProps> = ({ year, month, day }) => {
  const { selectedCategory, eventDates } = React.useContext(CategoryContext);
  const { selectedStartDate, selectedStopDate, selectDate } =
    React.useContext(SelectionContext);
  const datetime = Date.UTC(year, month, day);
  const isVisible = new Date(datetime).getMonth() == month;
  const event = eventDates[datetime];

  const onPress = React.useCallback(
    () => selectDate(datetime, event),
    [selectDate, datetime, event]
  );

  if (!isVisible) {
    return <MemoizedPlaceholder />;
  }

  const isToday = datetime == TODAY;
  const isEvent = datetime in eventDates;
  const isSelected =
    datetime === selectedStartDate ||
    (selectedStartDate !== undefined &&
      selectedStopDate !== undefined &&
      datetime >= selectedStartDate &&
      datetime <= selectedStopDate);

  return (
    <MemoizableDateView
      color={selectedCategory?.color}
      day={day}
      isToday={isToday}
      isEvent={isEvent}
      isSelected={isSelected}
      onPress={onPress}
    />
  );
};

const _MemoizableDateView: React.FC<IMemoizableProps> = ({
  color,
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
          (isSelected || isEvent) && { backgroundColor: color },
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
