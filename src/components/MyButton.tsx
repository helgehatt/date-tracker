import React from "react";
import {
  ColorValue,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { COLORS } from "../constants";
import MyText from "./MyText";

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
        props.disabled && { opacity: 0.75 },
        !!color && { backgroundColor: color },
      ]}
      {...props}
    >
      <MyText centered fontSize="lg">
        {title}
      </MyText>
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
});

export default MyButton;
