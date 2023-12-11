import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import { CategoryContext } from "../components/CategoryProvider";
import { COLORS, STYLES } from "../constants";

interface IProps {
  style?: ViewStyle;
}

type DataPoint = {
  value: number;
  date: string;
  label?: string;
};

function getLabelFromDate(date: number | string) {
  const options = { month: "short", day: "numeric" } as const;
  return new Date(date).toLocaleDateString("en-gb", options);
}

const LimitView: React.FC<IProps> = ({ style }) => {
  const { limits, eventCountsByLimit } = React.useContext(CategoryContext);

  return (
    <View style={[styles.container, style]}>
      <FlatList
        style={styles.flatlist}
        data={limits}
        ItemSeparatorComponent={() => <View style={styles.flatlistSeparator} />}
        renderItem={({ item: limit }) => (
          <View style={styles.flatlistChart}>
            <View style={styles.flatlistHeader}>
              <Text style={styles.flatlistHeaderText}>{limit.name}</Text>
            </View>
            <View>
              <LineChart
                areaChart
                data={eventCountsByLimit[limit.limitId]}
                width={350}
                height={250}
                adjustToWidth
                disableScroll
                hideDataPoints
                // Color
                color="#00ff83"
                thickness={2}
                startFillColor="rgba(20,105,81,0.3)"
                endFillColor="rgba(20,85,81,0.01)"
                startOpacity={0.9}
                endOpacity={0.2}
                // Axis
                initialSpacing={0}
                endSpacing={0}
                noOfSections={4}
                rulesType="solid"
                rulesColor="gray"
                yAxisColor="lightgray"
                yAxisTextStyle={{ color: "gray" }}
                rotateLabel
                xAxisColor="lightgray"
                xAxisLabelTextStyle={{ color: "gray", width: 50 }}
                showVerticalLines
                verticalLinesColor="gray"
                noOfVerticalLines={5}
                verticalLinesSpacing={60}
                // Reference line
                showReferenceLine1
                referenceLine1Position={limit.value}
                // @ts-ignore
                referenceLine1Config={{
                  type: "dashed",
                  color: COLORS.text,
                  dashWidth: 10,
                  dashGap: 5,
                }}
                // Pointer
                pointerConfig={{
                  showPointerStrip: false,
                  pointerStripHeight: 250,
                  pointerStripColor: "lightgray",
                  pointerStripWidth: 2,
                  pointerColor: "lightgray",
                  pointerLabelWidth: 100,
                  pointerLabelHeight: 90,
                  autoAdjustPointerLabelPosition: true,
                  pointerLabelComponent: (items: DataPoint[]) => {
                    return (
                      <View style={styles.pointerContainer}>
                        <Text style={styles.pointerDate}>{items[0].date}</Text>
                        <View style={styles.pointerValueContainer}>
                          <Text style={styles.pointerValueText}>
                            {items[0].value}/{limit.value}
                          </Text>
                        </View>
                      </View>
                    );
                  },
                }}
              />
            </View>
          </View>
        )}
      />
      <View style={STYLES.sheet.opener}>
        <Pressable>
          <EvilIcons name="plus" size={75} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  flatlist: {
    margin: 10,
    marginBottom: 15,
  },
  flatlistSeparator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tertiary,
  },
  flatlistChart: {
    // paddingLeft: 10,
    // marginRight: 10,
    // marginLeft: 10,
    paddingTop: 20,
    paddingBottom: 50,
  },
  flatlistHeader: {},
  flatlistHeaderText: {
    color: COLORS.text,
    fontSize: 20,
    textAlign: "center",
  },
  pointerContainer: {
    height: 90,
    width: 100,
    justifyContent: "center",
    // marginTop: -30,
    // marginLeft: -40,
  },
  pointerDate: {
    color: "white",
    fontSize: 14,
    marginBottom: 6,
    textAlign: "center",
  },
  pointerValueContainer: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "white",
  },
  pointerValueText: {
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default LimitView;
