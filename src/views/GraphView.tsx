import React from "react";
import {
  LayoutChangeEvent,
  SafeAreaView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
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
import { COLORS, DAY_IN_MS, TODAY } from "../constants";
import { AppDataContext } from "../helpers/AppDataProvider";
import DateInterval from "../helpers/DateInterval";
import MyIcon from "../components/MyIcon";
import MyText from "../components/MyText";

interface IProps {
  style?: ViewStyle;
}

function getData(limit: AppLimit, dates: number[], locale = "en-US") {
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
            const label = new Date(date).toISOYearString();
            return { value: count, label };
          });
        }
        case "monthly": {
          const unique = new Set(
            dates.map((date) => Number(new Date(date).ceil()))
          );

          return Array.from(unique).map((date): BarItemType => {
            const interval = DateInterval.getInterval(limit, date);
            const count = interval.filter(dates).length;
            const label = new Date(date).toLocaleDateString(locale, {
              year: "2-digit",
              month: "short",
            });
            return { value: count, label };
          });
        }
        default: {
          return [];
        }
      }
    }
    case "running": {
      const range = Array.from(Date.range(dates[0], dates[dates.length - 1]));
      const start = range?.[0] - DAY_IN_MS || TODAY;
      return [start, ...range].map((date): LineItemType => {
        const interval = DateInterval.getInterval(limit, date);
        const count = interval.filter(dates).length;
        const labeled = new Date(date).getDate() === 1;
        const label = new Date(date).toLocaleDateString(locale, {
          year: new Date(date).getMonth() === 0 ? "numeric" : undefined,
          month: "short",
          day: "numeric",
        });
        return {
          value: count,
          label: labeled ? label : undefined,
          labelTextStyle: { color: "lightgray", width: 100, marginLeft: -50 },
          showVerticalLine: !!labeled,
        };
      });
    }
    default: {
      return [];
    }
  }
}

const GraphView: React.FC<IProps> = ({ style }) => {
  const { activeLimitId, limitsById, eventDates, activateLimit } =
    React.useContext(AppDataContext);

  const [width, setWidth] = React.useState(932);

  const onLayout = React.useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const limit = limitsById[activeLimitId!];
  const data = React.useMemo(
    () => getData(limit, eventDates),
    [limit, eventDates]
  );

  React.useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, style]} onLayout={onLayout}>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={styles.header}>
          <MyText fontSize="lg">{limit.name}</MyText>
          <MyIcon
            style={{ marginLeft: "auto" }}
            onPress={() => activateLimit(null)}
            name="close"
          />
        </View>
        <View style={styles.graph}>
          {limit.intervalType === "fixed" && (
            <BarChart
              {...props}
              data={data}
              width={width * 0.65}
              barWidth={50}
              barBorderRadius={4}
              frontColor="lightgray"
            />
          )}
          {limit.intervalType === "running" && (
            <LineChart
              {...props}
              areaChart
              data={data}
              width={width * 0.65}
              spacing={2.5}
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
      </View>
    </SafeAreaView>
  );
};

const props: BarChartPropsType & LineChartPropsType = {
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
    backgroundColor: COLORS.base,
  },
  header: {
    flexDirection: "row",
    marginTop: 30,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.text,
  },
  graph: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    marginLeft: -50,
  },
});

export default GraphView;
