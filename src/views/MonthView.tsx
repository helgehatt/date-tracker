import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, DAY_IN_MS, MONTH_VIEW_HEIGHT } from "../constants";
import WeekView from "./WeekView";

function getWeeksInMonth(year: number, month: number) {
  const from = new Date(Date.UTC(year, month, 1)).getWeekNumber();
  //const to = new Date(Date.UTC(year, month + 1, 0)).getWeekNumber();
  return Array.from({ length: 6 }, (_, i) => i + from);
}

function getMonthTitle(year: number, month: number) {
  const date = new Date(Date.UTC(year, month));
  const options = { year: "numeric", month: "long" } as const;
  return date.toLocaleDateString("en-US", options);
}

interface IProps {
  year: number;
  month: number;
}

const MonthView = ({ year, month }: IProps) => {
  const weeks = getWeeksInMonth(year, month);
  const title = getMonthTitle(year, month);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      {weeks.map((week) => (
        <WeekView key={week} year={year} month={month} week={week} />
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
});

export default MonthView;
