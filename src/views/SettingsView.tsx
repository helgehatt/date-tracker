import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import * as Application from "expo-application";
import MyText from "../components/MyText";
import MyButton from "../components/MyButton";
import React from "react";
import AppDataContext from "../helpers/AppDataContext";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { COLORS } from "../constants";
import MyIcon from "../components/MyIcon";

interface IProps {
  style?: ViewStyle;
}

const SettingsView: React.FC<IProps> = ({ style }) => {
  const { events } = React.useContext(AppDataContext);

  const handleExport = async () => {
    const filename = `date-tracker-export-${Date.now()}.json`;
    const fileUri = FileSystem.documentDirectory + filename;
    const contents = JSON.stringify(
      events.map(({ eventId, categoryId, ...event }) => event)
    );

    await FileSystem.writeAsStringAsync(fileUri, contents, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Sharing.shareAsync(fileUri, { UTI: "public.item" });

    await FileSystem.deleteAsync(fileUri);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={{ flex: 1 }}>
        <MyButton
          onPress={handleExport}
          title="Export events"
          color={COLORS.dark}
        />
      </View>
      <MyText
        centered
      >{`Version ${Application.nativeApplicationVersion} (Build ${Application.nativeBuildVersion})`}</MyText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default SettingsView;
