import React from "react";
import { StyleSheet, View } from "react-native";
import { MONTH_VIEW_HEIGHT } from "../constants";
import DateView from "./DateView";
import MyText from "../components/MyText";

function getMonthTitle(year: number, month: number) {
  const date = new Date(Date.UTC(year, month));
  const options = { year: "numeric", month: "long" } as const;
  return date.toLocaleDateString("en-US", options);
}

interface IProps {
  year: number;
  month: number;
}

const MonthView: React.FC<IProps> = ({ year, month }) => {
  const title = getMonthTitle(year, month);
  const offset = new Date(Date.UTC(year, month, 1)).getISODay() - 1;

  return (
    <View style={styles.container}>
      <MyText fontSize="md" style={{ padding: 20 }}>
        {title}
      </MyText>
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={styles.row}>
          {Array.from({ length: 7 }, (_, j) => (
            <DateView
              key={j}
              year={year}
              month={month}
              day={1 - offset + 7 * i + j}
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
  row: {
    flex: 111,
    flexDirection: "row",
  },
});

export default MonthView;
