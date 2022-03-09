import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants";

interface IProps {
  oneYear: number;
  twelveMonths: number;
  thirtySixMonths: number;
}

const HeaderView = (props: IProps) => {
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <StatusBar style="light" />
      </SafeAreaView>
      <View style={styles.content}>
        <View>
          <Text style={[styles.text, styles.textTop]}>1 Y</Text>
          <Text style={[styles.text, styles.textBottom]}>
            {props.oneYear} / 61
          </Text>
        </View>
        <View>
          <Text style={[styles.text, styles.textTop]}>12 M</Text>
          <Text style={[styles.text, styles.textBottom]}>
            {props.twelveMonths} / 183
          </Text>
        </View>
        <View>
          <Text style={[styles.text, styles.textTop]}>36 M</Text>
          <Text style={[styles.text, styles.textBottom]}>
            {props.thirtySixMonths} / 270
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
  },
  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  text: {
    color: COLORS.text,
    textAlign: "center",
  },
  textTop: {
    fontSize: 20,
  },
  textBottom: {
    marginTop: 10,
  },
});

export default HeaderView;
