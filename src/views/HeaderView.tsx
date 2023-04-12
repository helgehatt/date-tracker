import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants";
import CountProfile from "../helpers/CountProfile";

interface IProps {
  countProfiles: CountProfile[];
}

const HeaderView: React.FC<IProps> = ({ countProfiles }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <StatusBar style="light" />
      </SafeAreaView>
      <View style={styles.content}>
        {countProfiles.map((profile) => (
          <View key={profile.metadata.title}>
            <Text style={[styles.text, styles.textTop]}>
              {profile.metadata.title}
            </Text>
            <Text style={[styles.text, styles.textBottom]}>
              {profile.count} / {profile.metadata.limit}
            </Text>
          </View>
        ))}
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
