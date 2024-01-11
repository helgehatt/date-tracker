import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { COLORS } from "../constants";
import AppDataContext from "../helpers/AppDataContext";
import MyLimit from "../components/MyLimit";
import MyText from "../components/MyText";

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
            <MyText centered>{crumbs}</MyText>
            <MyText centered fontSize="lg">
              {title}
            </MyText>
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
            <MyText centered>{limit.name}</MyText>
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
