import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { COLORS } from "../constants";
import { CategoryContext } from "../components/CategoryProvider";
import { EvilIcons } from "@expo/vector-icons";

interface IProps {
  style?: ViewStyle;
}

const CategoryView: React.FC<IProps> = ({ style }) => {
  const { categories, selectedCategory, selectCategory } =
    React.useContext(CategoryContext);

  return (
    <View style={[styles.container, style]}>
      {categories.map((category) => (
        <Pressable
          key={category.id}
          onPress={() => selectCategory(category.id)}
        >
          <View
            style={[
              styles.category,
              category.id === selectedCategory && {
                backgroundColor: COLORS.secondary,
              },
            ]}
          >
            <View
              style={[
                styles.categoryColor,
                { backgroundColor: category.color },
              ]}
            />
            <Text style={styles.categoryText}>{category.title}</Text>
          </View>
        </Pressable>
      ))}
      <View style={styles.category}>
        <View style={styles.categoryColor}>
          <EvilIcons name="plus" size={55} color="white" />
        </View>
        <Text style={styles.categoryText}>Add category</Text>
      </View>
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
    borderRadius: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.tertiary,
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
