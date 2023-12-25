import { StyleSheet } from "react-native";

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const TODAY = Math.floor(Date.now() / DAY_IN_MS) * DAY_IN_MS;

export const MONTH_VIEW_HEIGHT = 350;

// https://colorhunt.co/palette/0820322c394b334756ff4c29
export const COLORS = {
  base: "#2C394B",
  dark: "#082032",
  light: "#334756",
  text: "#FFFFFF",
  placeholderText: "#656E7D",
};

export const STYLES = {
  sheet: StyleSheet.create({
    opener: {
      alignSelf: "center",
      position: "absolute",
      bottom: 20,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      rowGap: 10,
    },
    row: {
      flexDirection: "row",
      columnGap: 10,
    },
    header: {
      paddingBottom: 10,
      borderBottomColor: COLORS.base,
      borderBottomWidth: 1,
    },
    input: {
      flex: 1,
      fontSize: 20,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 15,
      backgroundColor: COLORS.base,
      color: COLORS.text,
    },
    button: {
      flex: 1,
    },
  }),
};
