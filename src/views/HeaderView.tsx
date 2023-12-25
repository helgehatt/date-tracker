import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { COLORS } from "../constants";
import { AppDataContext } from "../helpers/AppDataProvider";
import MyLimit from "../components/MyLimit";

interface IProps {
  style?: ViewStyle;
}

const HeaderView: React.FC<IProps> = ({ style }) => {
  const {
    activeCategoryId,
    referenceDate,
    categoriesById,
    eventDates,
    limits,
  } = React.useContext(AppDataContext);

  let crumbs: string, title: string, color: string;
  if (activeCategoryId && categoriesById[activeCategoryId]) {
    crumbs = "Starred limits are shown here";
    title = categoriesById[activeCategoryId].name;
    color = categoriesById[activeCategoryId].color;
  } else {
    crumbs = "Select a category from the list below";
    title = "No category selected";
    color = COLORS.dark;
  }

  const favorites = limits.filter((l) => l.isFavorite === 1);

  return (
    <SafeAreaView style={[style, { backgroundColor: color }]}>
      <StatusBar style="light" />
      <ScrollView horizontal style={[styles.favoriteContainer]}>
        {favorites.length === 0 && (
          <View style={styles.favoriteItem}>
            <Text style={[styles.text]}>{crumbs}</Text>
            <Text style={[styles.text, { fontSize: 20 }]}>{title}</Text>
          </View>
        )}
        {favorites.map((limit, index) => (
          <View
            key={limit.limitId}
            style={[
              styles.favoriteItem,
              index === 0 && { marginLeft: 20 },
              index === favorites.length - 1 && { marginRight: 20 },
            ]}
          >
            <Text style={[styles.text]}>{limit.name}</Text>
            <MyLimit
              style={{ fontSize: 20, minWidth: 50 }}
              limit={limit}
              date={Number(referenceDate)}
              eventDates={eventDates}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text: {
    color: COLORS.text,
    textAlign: "center",
  },
  favoriteContainer: {
    paddingVertical: 20,
    alignSelf: "center",
    overflow: "visible",
  },
  favoriteItem: {
    alignItems: "center",
    marginHorizontal: 10,
    rowGap: 10,
  },
});

export default HeaderView;
