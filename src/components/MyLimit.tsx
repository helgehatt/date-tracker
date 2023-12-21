import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants";
import DateInterval from "../helpers/DateInterval";

interface IProps {
  limit: AppLimit;
  date: number;
  eventDates: number[];
}

const MyLimit: React.FC<IProps> = ({ limit, date, eventDates }) => {
  const interval = DateInterval.getInterval(limit, date);
  const count = interval.filter(eventDates).length;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {count}/{limit.maxDays}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 75,
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 15,
  },
  text: {
    color: COLORS.text,
    textAlign: "center",
  },
});

export default React.memo(MyLimit);
