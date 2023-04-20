import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { COLORS } from "../constants";

interface IProps {
  style?: ViewStyle;
  title?: string;
}

const MyButton: React.FC<IProps> = ({ style, title }) => {
  return (
    <Pressable style={[styles.container, style]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  text: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: 20,
  },
});

export default MyButton;
