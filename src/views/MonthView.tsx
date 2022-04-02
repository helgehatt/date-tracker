import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, MONTH_VIEW_HEIGHT } from "../constants";
import SelectionManager from "../helpers/SelectionManager";
import DateView from "./DateView";

function getMonthTitle(year: number, month: number) {
  const date = new Date(Date.UTC(year, month));
  const options = { year: "numeric", month: "long" } as const;
  return date.toLocaleDateString("en-US", options);
}

interface IProps {
  year: number;
  month: number;
  selectionManager: SelectionManager;
  setReferenceDate: (date: Date) => void;
  selectDate: (date: Date) => void;
}

const MonthView: React.FC<IProps> = ({ year, month, ...props }) => {
  const title = getMonthTitle(year, month);
  const offset = new Date(Date.UTC(year, month, 1)).getISODay() - 1;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={styles.row}>
          {Array.from({ length: 7 }, (_, j) => (
            <DateView
              key={j}
              year={year}
              month={month}
              datetime={Date.UTC(year, month, 1 - offset + 7 * i + j)}
              {...props}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: MONTH_VIEW_HEIGHT,
  },
  text: {
    color: COLORS.text,
    padding: 20,
    fontSize: 16,
  },
  row: {
    flex: 111,
    flexDirection: "row",
  },
});

export default MonthView;
