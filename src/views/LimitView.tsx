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
import { CategoryContext } from "../components/CategoryProvider";
import { COLORS, STYLES } from "../constants";

interface IProps {
  style?: ViewStyle;
}

const LimitView: React.FC<IProps> = ({ style }) => {
  const { limits } = React.useContext(CategoryContext);

  return (
    <View style={[styles.container, style]}>
      <FlatList
        style={styles.flatlist}
        data={limits}
        ItemSeparatorComponent={() => <View style={styles.flatlistSeparator} />}
        renderItem={({ item: limit }) => (
          <Pressable key={limit.limitId}>
            <View style={styles.flatlistItem}>
              <Text>
                {limit.name} {limit.value}
              </Text>
            </View>
          </Pressable>
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
