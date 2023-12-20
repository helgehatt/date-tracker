import "./src/extensions";
import React from "react";
import { KeyboardAvoidingView, Platform, View, ViewStyle } from "react-native";
import HeaderView from "./src/views/HeaderView";
import AppbarView from "./src/views/AppbarView";
import CalendarView from "./src/views/CalendarView";
import CategoryView from "./src/views/CategoryView";
import CategoryProvider, {
  CategoryContext,
} from "./src/components/CategoryProvider";
import LimitView from "./src/views/LimitView";
import GraphView from "./src/views/GraphView";

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
    <CategoryProvider>
      <View style={{ flex: 1 }}>
        <HeaderView />
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
        <AppbarView page={page} setPage={setPage} />
      </View>
      <CategoryContext.Consumer>
        {(value) =>
          value.selectedLimit && <GraphView limit={value.selectedLimit} />
        }
      </CategoryContext.Consumer>
    </CategoryProvider>
  );
}
