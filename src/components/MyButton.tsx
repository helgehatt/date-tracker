import React from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { COLORS } from "../constants";

interface IProps extends PressableProps {
  style?: ViewStyle;
  title?: string;
}

const MyButton: React.FC<IProps> = ({ style, title, ...props }) => {
  return (
    <Pressable style={[styles.container, style]} {...props}>
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
