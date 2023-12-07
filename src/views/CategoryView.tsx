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

interface IProps {
  style?: ViewStyle;
}

type Mode = "view" | "add" | "edit";

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
  const [categoryId, setCategoryId] = React.useState<number>();
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(generateRandomColor);

  const isValid = name.length > 0;

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    setMode("view");
    setCategoryId(undefined);
    setName("");
  }, []);

  const onSubmitAdd = () => {
    if (isValid) {
      addCategory(name, color);
      onClose();
      setColor(generateRandomColor);
    }
  };

  const onSubmitEdit = () => {
    if (isValid && categoryId) {
      editCategory({
        categoryId,
        name,
        color,
      });
      onClose();
      setColor(generateRandomColor);
    }
  };

  const onSubmitDelete = () => {
    if (categoryId) {
      deleteCategory(categoryId);
    }
    onClose();
    setColor(generateRandomColor);
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        style={{ margin: 10, marginBottom: 15 }}
        data={categories}
        ItemSeparatorComponent={() => <View style={styles.flatlistSeparator} />}
        renderItem={({ item: { categoryId, name, color } }) => (
          <Pressable
            key={categoryId}
            onPress={() => selectCategory(categoryId)}
          >
            <View
              style={[
                styles.flatlistItem,
                categoryId === selectedCategory?.categoryId && {
                  backgroundColor: COLORS.secondary,
                },
              ]}
            >
              <View
                style={[styles.categoryColor, { backgroundColor: color }]}
              />
              <Text style={styles.categoryText}>{name}</Text>
              <Pressable
                style={{ marginLeft: "auto" }}
                onPress={() => {
                  setMode("edit");
                  setCategoryId(categoryId);
                  setName(name);
                  setColor(color);
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
                style={[styles.categoryColor, { backgroundColor: color }]}
              />
            </Pressable>
            <TextInput
              style={STYLES.sheet.input}
              value={name}
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
    margin: 10,
  },
  flatlistSeparator: {
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
