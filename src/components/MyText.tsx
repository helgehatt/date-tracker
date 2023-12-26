import React from "react";
import { ColorValue, Text, TextProps } from "react-native";
import { COLORS } from "../constants";

interface IProps extends TextProps {
  centered?: boolean;
  fontSize?: number | "sm" | "md" | "lg";
  color?: ColorValue;
}

const MyText: React.FC<IProps> = ({
  style,
  centered = false,
  fontSize = "sm",
  color = COLORS.text,
  children,
  ...props
}) => {
  const textAlign = centered ? "center" : undefined;
  fontSize = { sm: 14, md: 16, lg: 20 }[fontSize] || (fontSize as number);
  return (
    <Text style={[{ textAlign, fontSize, color }, style]} {...props}>
      {children}
    </Text>
  );
};

export default MyText;
