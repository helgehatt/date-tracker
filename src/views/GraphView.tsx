import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
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
import { AppDataContext } from "../helpers/AppDataProvider";
import DateInterval from "../helpers/DateInterval";
import MyIcon from "../components/MyIcon";

interface IProps {
  limit: AppLimit;
}

function getData(limit: AppLimit, dates: number[]) {
  switch (limit.intervalType) {
    case "fixed": {
      switch (limit.fixedInterval) {
        case "yearly": {
          const unique = new Set(
            dates.map((date) => Date.UTC(new Date(date).getFullYear(), 0, 1))
          );

          return Array.from(unique).map((date): BarItemType => {
            const interval = DateInterval.getInterval(limit, date);
            const count = interval.filter(dates).length;
            return { value: count, label: new Date(date).toISOYearString() };
          });
        }
        case "monthly": {
          const unique = new Set(
            dates.map((date) => Number(new Date(date).ceil()))
          );

          return Array.from(unique).map((date): BarItemType => {
            const interval = DateInterval.getInterval(limit, date);
            const count = interval.filter(dates).length;
            return { value: count, label: new Date(date).toISOMonthString() };
          });
        }
        default: {
          return [];
        }
      }
    }
    case "running": {
      const range = Array.from(Date.range(dates[0], dates[dates.length - 1]));

      return range.map((date): LineItemType => {
        const interval = DateInterval.getInterval(limit, date);
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
  const { eventDates, selectLimit } = React.useContext(AppDataContext);

  const onClose = React.useCallback(() => {
    selectLimit(undefined);
  }, [selectLimit]);

  React.useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  const data = getData(limit, eventDates);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{limit.name}</Text>
        <MyIcon style={{ marginLeft: "auto" }} onPress={onClose} name="close" />
      </View>
      <View style={styles.graph}>
        {limit.intervalType === "fixed" && (
          <BarChart
            data={data}
            {...props}
            barWidth={50}
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
