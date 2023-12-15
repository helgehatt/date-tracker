import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { EvilIcons } from "@expo/vector-icons";
import { BarChart, LineChart } from "react-native-gifted-charts";
import {
  BarChartPropsType,
  itemType as BarItemType,
} from "react-native-gifted-charts/src/BarChart/types";
import {
  LineChartPropsType,
  itemType as LineItemType,
} from "react-native-gifted-charts/src/LineChart/types";
import { COLORS } from "../constants";
import { CategoryContext } from "../components/CategoryProvider";
import { AppEvent, AppLimit, getInterval } from "../helpers/AppDatabase";

interface IProps {
  limit: AppLimit;
}

function getUniqueDates(events: AppEvent[]) {
  const dates = new Set<number>();

  for (const event of events) {
    for (const date of Date.range(event.startDate, event.stopDate)) {
      dates.add(date);
    }
  }

  return Array.from(dates);
}

function getData(limit: AppLimit, events: AppEvent[]) {
  const dates = getUniqueDates(events).sort();

  switch (limit.intervalType) {
    case "fixed": {
      const years = new Set(dates.map((date) => new Date(date).getFullYear()));

      return Array.from(years).map((year): BarItemType => {
        const interval = getInterval(limit, Date.UTC(year, 0, 1));
        const count = interval.filter(dates).length;
        return { value: count, label: String(year) };
      });
    }
    case "running": {
      const range = Array.from(Date.range(dates[0], dates[dates.length - 1]));

      return range.map((date, index): LineItemType => {
        const interval = getInterval(limit, date);
        const count = interval.filter(dates).length;
        const labeled = new Date(date).getDate() === 1;
        return {
          value: count,
          labelComponent: labeled
            ? () => <LabelComponent date={date} />
            : undefined,
          showVerticalLine: !!labeled,
        };
      });
    }
    default: {
      return [];
    }
  }
}

const LabelComponent: React.FC<{ date: number }> = ({ date }) => {
  const label = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <View style={{ width: 50, marginLeft: -15 }}>
      <Text style={{ color: "lightgray" }}>{label}</Text>
    </View>
  );
};

const GraphView: React.FC<IProps> = ({ limit }) => {
  const { events, selectLimit } = React.useContext(CategoryContext);

  const onClose = React.useCallback(() => {
    selectLimit(undefined);
  }, []);

  React.useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  const data = getData(limit, events);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{limit.name}</Text>
        <Pressable style={{ marginLeft: "auto" }} onPress={onClose}>
          <EvilIcons name="close" size={30} color={COLORS.text} />
        </Pressable>
      </View>
      <View style={styles.graph}>
        {limit.intervalType === "fixed" && (
          <BarChart
            data={data}
            {...props}
            barWidth={22}
            barBorderRadius={4}
            frontColor="lightgray"
          />
        )}
        {limit.intervalType === "running" && (
          <LineChart
            areaChart
            data={data}
            {...props}
            adjustToWidth
            disableScroll
            hideDataPoints
            color="#00ff83"
            thickness={2}
            startFillColor="rgba(20,105,81,0.3)"
            endFillColor="rgba(20,85,81,0.01)"
            startOpacity={0.9}
            endOpacity={0.2}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const props: BarChartPropsType & LineChartPropsType = {
  width: 650,
  noOfSections: 3,
  rulesType: "solid",
  rulesColor: "gray",
  yAxisThickness: 0,
  xAxisThickness: 1,
  xAxisColor: "gray",
  yAxisTextStyle: { color: "lightgray" },
  xAxisLabelTextStyle: { color: "lightgray" },
  verticalLinesColor: "gray",
  verticalLinesThickness: 1,
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    ...{ top: 0, bottom: 0, left: 0, right: 0 },
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    marginTop: 30,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.text,
  },
  headerText: {
    color: COLORS.text,
    fontSize: 20,
  },
  graph: {
    flex: 1,
    paddingLeft: 30,
    justifyContent: "center",
  },
});

export default GraphView;
