import { StyleSheet, View } from "react-native";
import DateView from "./DateView";

interface IProps {
  year: number;
  month: number;
  week: number;
}

const WeekView = ({ year, month, week }: IProps) => {
  const offset = new Date(Date.UTC(year, 0, 1)).getISODay() - 1;
  const dates = Array.from(
    { length: 7 },
    (_, i) => new Date(Date.UTC(year, 0, week * 7 + (i + 1) - offset))
  );
  return (
    <View style={styles.container}>
      {dates.map((date, index) => (
        <DateView key={index} year={year} month={month} date={date} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 111,
    flexDirection: "row",
  },
});

export default WeekView;
