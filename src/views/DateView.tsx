import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SelectedDatesContext from "../helpers/SelectedDatesContext";
import { COLORS, TODAY } from "../constants";

interface IProps {
  year: number;
  month: number;
  date: Date;
}

const DateView = ({ year, month, date }: IProps) => {
  const { selectionManager, toggleDate, setReferenceDate } =
    React.useContext(SelectedDatesContext);
  const isSelected = selectionManager.isSelected(date);
  const isVisible = date.getMonth() == month;
  const isToday = date.getTime() == TODAY.getTime();
  const isReference =
    date.getTime() == selectionManager.referenceDate.getTime();

  return (
    <View
      style={[
        styles.container,
        isVisible && isToday && styles.isToday,
        isVisible && isReference && styles.isReference,
      ]}
    >
      {isVisible && (
        <Text
          onPress={() => toggleDate(date)}
          onLongPress={() => setReferenceDate(date)}
          style={[styles.text, isSelected && styles.isSelected]}
        >
          {date.getDate()}
        </Text>
      )}
    </View>
  );
};

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
