import React from "react";
import { StyleProp, TextStyle } from "react-native";
import DateInterval from "../helpers/DateInterval";
import MyText from "./MyText";

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
    <MyText centered style={style}>
      {count}/{limit.maxDays}
    </MyText>
  );
};

export default MyLimit;
