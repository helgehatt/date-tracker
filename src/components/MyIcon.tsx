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
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";

type IconName =
  | "arrow-down"
  | "arrow-up"
  | "calendar"
  | "chart"
  | "chevron-down"
  | "close"
  | "pencil"
  | "plus"
  | "settings"
  | "star"
  | "tag"
  | "trash";

interface IProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<TextStyle>;
  name: IconName;
  size?: number | "sm" | "md" | "lg";
  color?: ColorValue;
  outline?: boolean;
}

const MyIcon: React.FC<IProps> = ({
  style,
  iconStyle,
  name: inputName,
  size = "sm",
  color = COLORS.text,
  outline = false,
  ...props
}) => {
  size = { sm: 25, md: 40, lg: 60 }[size] || (size as number);
  const name = mapBetweenIconSets(inputName);

  return (
    <Pressable style={[style, props.disabled && styles.disabled]} {...props}>
      <Ionicons
        style={iconStyle}
        name={outline ? `${name}-outline` : name}
        size={size}
        color={color}
      />
    </Pressable>
  );
};

const mapBetweenIconSets = (name: IconName) => {
  switch (name) {
    case "chart":
      return "bar-chart";
    case "plus":
      return "add-circle";
    case "tag":
      return "pricetag";
    default:
      return name;
  }
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

export default MyIcon;
