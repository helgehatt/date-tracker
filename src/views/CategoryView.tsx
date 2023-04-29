import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { COLORS } from "../constants";
import MyButton from "../components/MyButton";

interface IProps {
  style?: ViewStyle;
}

const CategoryView: React.FC<IProps> = ({ style }) => {
  const [categories] = React.useState([
    {
      id: 123123,
      title: "Norge",
      color: COLORS.primary,
      selected: true,
    },
    {
      id: 123124,
      title: "Danmark",
      color: "red",
      selected: false,
    },
    {
      id: 123125,
      title: "Sverige",
      color: "blue",
      selected: false,
    },
  ]);
  return (
    <View style={[styles.container, style]}>
      {categories.map((category) => (
        <View
          key={category.id}
          style={[
            styles.category,
            category.selected && { backgroundColor: COLORS.secondary },
          ]}
        >
          <View
            style={[styles.categoryColor, { backgroundColor: category.color }]}
          />
          <Text style={styles.categoryText}>{category.title}</Text>
        </View>
      ))}
      <MyButton title="+ Add new category" color={COLORS.tertiary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
  },
  category: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    columnGap: 20,
    borderBottomWidth: 1,
    borderColor: COLORS.background,
    borderRadius: 10,
  },
  categoryColor: {
    height: 50,
    width: 50,
    borderRadius: 10,
    margin: 10,
  },
  categoryText: {
    fontSize: 30,
    color: COLORS.text,
  },
});

export default CategoryView;
