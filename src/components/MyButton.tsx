import React from "react";
import {
  ColorValue,
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
  color?: ColorValue;
}

const MyButton: React.FC<IProps> = ({ style, title, color, ...props }) => {
  return (
    <Pressable
      style={[
        styles.container,
        style,
        props.disabled && styles.disabled,
        !!color && { backgroundColor: color },
      ]}
      {...props}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.base,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  text: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: 20,
  },
  disabled: {
    opacity: 0.75,
  },
});

export default MyButton;
