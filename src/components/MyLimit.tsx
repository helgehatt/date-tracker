import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
import { COLORS } from "../constants";
import DateInterval from "../helpers/DateInterval";

interface IProps {
  style?: StyleProp<TextStyle>;
  limit: AppLimit;
  date: number;
  eventDates: number[];
}

const MyLimit: React.FC<IProps> = ({ style, limit, date, eventDates }) => {
  const interval = DateInterval.getInterval(limit, date);
  const count = interval.filter(eventDates).length;
  return (
    <Text style={[styles.base, style]}>
      {count}/{limit.maxDays}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: COLORS.text,
    textAlign: "center",
  },
});

export default MyLimit;
