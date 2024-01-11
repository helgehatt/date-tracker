import "./src/extensions";
import React from "react";
import { KeyboardAvoidingView, Platform, View, ViewStyle } from "react-native";
import * as SystemUI from "expo-system-ui";
import TextInputHeight from "./src/helpers/TextInputHeight";
import HeaderView from "./src/views/HeaderView";
import AppbarView from "./src/views/AppbarView";
import CalendarView from "./src/views/CalendarView";
import CategoryView from "./src/views/CategoryView";
import AppDataProvider, { AppDataContext } from "./src/helpers/AppDataProvider";
import LimitView from "./src/views/LimitView";
import GraphView from "./src/views/GraphView";
import { COLORS } from "./src/constants";

SystemUI.setBackgroundColorAsync(COLORS.base);

export default function App() {
  const [page, setPage] = React.useState<AppPage>("calendar");

  const pageStyle: Record<AppPage, ViewStyle> = {
    calendar: { display: "none" },
    category: { display: "none" },
    limits: { display: "none" },
    settings: { display: "none" },
  };
  pageStyle[page] = { flex: 1 };

  return (
    <AppDataProvider>
      <View style={{ flex: 1 }}>
        <HeaderView />
        <TextInputHeight.Provider>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            enabled={Platform.OS === "ios"}
            behavior="padding"
          >
            <CalendarView style={pageStyle["calendar"]} />
            <CategoryView style={pageStyle["category"]} />
            <LimitView style={pageStyle["limits"]} />
            <View style={pageStyle["settings"]} />
          </KeyboardAvoidingView>
        </TextInputHeight.Provider>
        <AppbarView page={page} setPage={setPage} />
      </View>
      <AppDataContext.Consumer>
        {(ctx) => ctx.activeLimitId !== null && <GraphView />}
      </AppDataContext.Consumer>
    </AppDataProvider>
  );
}
