import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, TODAY } from "../constants";
import SelectionManager from "../helpers/SelectionManager";

interface IProps {
  year: number;
  month: number;
  datetime: number;
  selectionManager: SelectionManager;
  selectDate: (date: Date) => void;
  setReferenceDate: (date: Date) => void;
}

interface IMemoizableProps {
  datetime: number;
  isToday: boolean;
  isSelected: boolean;
  isReference: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const DateView: React.FC<IProps> = ({
  month,
  datetime,
  selectionManager,
  selectDate,
  setReferenceDate,
}) => {
  const date = new Date(datetime);
  const isVisible = date.getMonth() == month;

  const onPress = React.useCallback(() => selectDate(date), []);
  const onLongPress = React.useCallback(() => setReferenceDate(date), []);

  if (!isVisible) {
    return <MemoizedPlaceholder />;
  }

  const referenceDate = selectionManager.getRefrenceDate();
  const isSelected = selectionManager.isSelected(date);
  const isToday = date.getTime() == TODAY.getTime();
  const isReference = date.getTime() == referenceDate.getTime();

  return (
    <MemoizableDateView
      datetime={datetime}
      isToday={isToday}
      isSelected={isSelected}
      isReference={isReference}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
};

const MemoizableDateView = React.memo<IMemoizableProps>(
  ({ datetime, isToday, isSelected, isReference, onPress, onLongPress }) => {
    const date = new Date(datetime);
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
        <Text style={[styles.text, isSelected && styles.isSelected]}>
          {date.getDate()}
        </Text>
      </Pressable>
    );
  }
);
MemoizableDateView.displayName = "MemoizableDateView";

const MemoizedPlaceholder = React.memo(() => {
  return <View style={styles.container} />;
});
MemoizedPlaceholder.displayName = "MemoizedPlaceholder";

const styles = StyleSheet.create({
  container: {
    flex: 111,
    alignItems: "center",
    justifyContent: "center",
  },
  isToday: {
    backgroundColor: COLORS.secondary,
  },
  isReference: {
    borderWidth: 1,
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
