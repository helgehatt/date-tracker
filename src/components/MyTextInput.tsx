import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { COLORS } from "../constants";

interface IProps extends TextInputProps {}

const MyTextInput: React.FC<IProps> = ({ style, ...props }) => {
  return (
    <TextInput
      style={[styles.base, !props.editable && styles.disabled, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
    fontSize: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    color: COLORS.text,
  },
  disabled: {
    backgroundColor: COLORS.tertiary,
  },
});

export default MyTextInput;
