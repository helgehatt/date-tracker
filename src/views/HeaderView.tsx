import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, ViewStyle } from "react-native";
import { COLORS } from "../constants";
import { CategoryContext } from "../components/CategoryProvider";

interface IProps {
  style?: ViewStyle;
}

const HeaderView: React.FC<IProps> = ({ style }) => {
  const { selectedCategory } = React.useContext(CategoryContext);

  const name = selectedCategory?.name || "No category selected";
  const color = selectedCategory?.color || COLORS.secondary;

  return (
    <SafeAreaView style={[style, { backgroundColor: color }]}>
      <StatusBar style="light" />
      <Text style={styles.header}>{name}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    fontSize: 20,
    color: COLORS.text,
    textAlign: "center",
  },
});

export default HeaderView;
