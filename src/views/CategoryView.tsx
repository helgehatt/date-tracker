import React from "react";
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { COLORS, STYLES } from "../constants";
import { CategoryContext } from "../components/CategoryProvider";
import { EvilIcons } from "@expo/vector-icons";
import BottomSheet from "../components/BottomSheet";
import MyButton from "../components/MyButton";
import { AppCategory } from "../helpers/AppDatabase";

interface IProps {
  style?: ViewStyle;
}

type Mode = "view" | "add" | "edit";
type State = Optional<AppCategory, "categoryId">;

const initialState: () => State = () => ({
  categoryId: undefined,
  name: "",
  color: generateRandomColor(),
});

function generateRandomColor() {
  // return "#" + ((Math.random() * 0xffffff) << 0);
  return `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
}

const CategoryView: React.FC<IProps> = ({ style }) => {
  const {
    categories,
    selectedCategory,
    selectCategory,
    addCategory,
    editCategory,
    deleteCategory,
  } = React.useContext(CategoryContext);

  const [mode, setMode] = React.useState<Mode>("view");
  const [state, setState] = React.useState<State>(initialState);

  const setName = React.useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }));
  }, []);

  const setColor = React.useCallback((color: string) => {
    setState((prev) => ({ ...prev, color }));
  }, []);

  const isValid = state.name.length > 0;

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    setMode("view");
    setState(initialState);
  }, []);

  const onSubmitAdd = () => {
    if (isValid) {
      addCategory({ name: state.name, color: state.color });
      onClose();
    }
  };

  const onSubmitEdit = () => {
    if (isValid && state.categoryId) {
      editCategory({
        categoryId: state.categoryId,
        name: state.name,
        color: state.color,
      });
      onClose();
    }
  };

  const onSubmitDelete = () => {
    if (state.categoryId) {
      deleteCategory(state.categoryId);
    }
    onClose();
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        style={styles.flatlist}
        data={categories}
        ListHeaderComponent={<View style={{ height: 10 }} />}
        ListFooterComponent={<View style={{ height: 10 }} />}
        ItemSeparatorComponent={() => <View style={styles.flatlistSeparator} />}
        renderItem={({ item: category }) => (
          <Pressable
            key={category.categoryId}
            onPress={() => selectCategory(category.categoryId)}
          >
            <View
              style={[
                styles.flatlistItem,
                category.categoryId === selectedCategory?.categoryId && {
                  backgroundColor: COLORS.secondary,
                },
              ]}
            >
              <View
                style={[
                  styles.categoryColor,
                  { backgroundColor: category.color },
                ]}
              />
              <Text style={styles.categoryText}>{category.name}</Text>
              <Pressable
                style={{ marginLeft: "auto" }}
                onPress={() => {
                  setMode("edit");
                  setState(category);
                }}
              >
                <EvilIcons name="pencil" size={30} color={COLORS.text} />
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      <View style={STYLES.sheet.opener}>
        <Pressable onPress={() => setMode("add")}>
          <EvilIcons name="plus" size={75} color="white" />
        </Pressable>
      </View>

      <BottomSheet
        visible={mode !== "view"}
        height={200}
        closeOnSwipeDown={true}
        closeOnSwipeTrigger={onClose}
        customStyles={{
          container: { backgroundColor: COLORS.tertiary },
        }}
      >
        <View style={STYLES.sheet.container}>
          <View style={[STYLES.sheet.row, STYLES.sheet.header]}>
            <Text style={STYLES.sheet.headerText}>
              {mode === "edit" ? "Edit category" : "Add category"}
            </Text>
            {mode === "edit" && (
              <Pressable onPress={onSubmitDelete}>
                <EvilIcons name="trash" size={30} color={COLORS.text} />
              </Pressable>
            )}
          </View>
          <View style={STYLES.sheet.row}>
            <Pressable onPress={() => setColor(generateRandomColor())}>
              <View
                style={[styles.categoryColor, { backgroundColor: state.color }]}
              />
            </Pressable>
            <TextInput
              style={STYLES.sheet.input}
              value={state.name}
              onChangeText={setName}
              placeholder="Name"
            />
          </View>
          <View style={STYLES.sheet.row}>
            <MyButton
              style={STYLES.sheet.button}
              title="Confirm"
              onPress={mode === "edit" ? onSubmitEdit : onSubmitAdd}
              disabled={!isValid}
            />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  flatlist: {
    paddingHorizontal: 10,
  },
  flatlistSeparator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tertiary,
  },
  flatlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    columnGap: 20,
    borderRadius: 10,
  },
  categoryColor: {
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 20,
    color: COLORS.text,
  },
});

export default CategoryView;
