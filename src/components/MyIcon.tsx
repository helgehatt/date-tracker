import React from "react";
import {
  ColorValue,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { COLORS } from "../constants";

type IconName =
  | "arrow-down"
  | "arrow-up"
  | "calendar"
  | "chart"
  | "chevron-down"
  | "close"
  | "gear"
  | "pencil"
  | "plus"
  | "star"
  | "tag"
  | "trash";

interface IProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<TextStyle>;
  name: IconName;
  size?: number | "sm" | "md" | "lg";
  color?: ColorValue;
}

const MyIcon: React.FC<IProps> = ({
  style,
  iconStyle,
  name,
  size = "sm",
  color = COLORS.text,
  ...props
}) => {
  size = { sm: 30, md: 50, lg: 75 }[size] || (size as number);

  return (
    <Pressable style={[style, props.disabled && styles.disabled]} {...props}>
      <EvilIcons style={iconStyle} name={name} size={size} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

export default MyIcon;
