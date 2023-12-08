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
import { LineChart, yAxisSides } from "react-native-gifted-charts";
import { CategoryContext } from "../components/CategoryProvider";
import { COLORS, STYLES } from "../constants";

interface IProps {
  style?: ViewStyle;
}

type DataPoint = {
  value: number;
  date: string;
  label?: string;
  labelTextStyle?: {
    color?: string;
    width?: number;
  };
};

const LimitView: React.FC<IProps> = ({ style }) => {
  const { limits, eventCountsByLimit } = React.useContext(CategoryContext);

  return (
    <View style={[styles.container, style]}>
      <FlatList
        style={styles.flatlist}
        data={limits}
        ItemSeparatorComponent={() => <View style={styles.flatlistSeparator} />}
        renderItem={({ item: limit }) => (
          <View
            style={{
              paddingVertical: 100,
              paddingLeft: 20,
            }}
          >
            <LineChart
              areaChart
              data={eventCountsByLimit[limit.limitId]}
              rotateLabel
              width={300}
              hideDataPoints
              spacing={10}
              color="#00ff83"
              thickness={2}
              startFillColor="rgba(20,105,81,0.3)"
              endFillColor="rgba(20,85,81,0.01)"
              startOpacity={0.9}
              endOpacity={0.2}
              initialSpacing={0}
              noOfSections={6}
              maxValue={limit.value * 1.2}
              yAxisColor="white"
              yAxisThickness={0}
              showReferenceLine1
              referenceLine1Position={limit.value}
              referenceLine1Config={{
                color: COLORS.text,
                dashWidth: 2,
                dashGap: 3,
              }}
              rulesType="solid"
              rulesColor="gray"
              yAxisTextStyle={{ color: "gray" }}
              yAxisSide={yAxisSides.RIGHT}
              xAxisColor="lightgray"
              pointerConfig={{
                pointerStripHeight: 160,
                pointerStripColor: "lightgray",
                pointerStripWidth: 2,
                pointerColor: "lightgray",
                radius: 6,
                pointerLabelWidth: 100,
                pointerLabelHeight: 90,
                activatePointersOnLongPress: true,
                autoAdjustPointerLabelPosition: false,
                pointerLabelComponent: (items: DataPoint[]) => {
                  return (
                    <View
                      style={{
                        height: 90,
                        width: 100,
                        justifyContent: "center",
                        marginTop: -30,
                        marginLeft: -40,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 14,
                          marginBottom: 6,
                          textAlign: "center",
                        }}
                      >
                        {items[0].date}
                      </Text>

                      <View
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                          borderRadius: 16,
                          backgroundColor: "white",
                        }}
                      >
                        <Text
                          style={{ fontWeight: "bold", textAlign: "center" }}
                        >
                          {"$" + items[0].value + ".0"}
                        </Text>
                      </View>
                    </View>
                  );
                },
              }}
            />
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
  flatlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    columnGap: 20,
    borderRadius: 10,
  },
});

export default LimitView;
