import React from "react";
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { COLORS, STYLES } from "../constants";
import AppDataContext from "../helpers/AppDataContext";
import TextInputHeight from "../helpers/TextInputHeight";
import BottomSheet from "../components/BottomSheet";
import MyButton from "../components/MyButton";
import MyIcon from "../components/MyIcon";
import MyText from "../components/MyText";

interface IProps {
  style?: ViewStyle;
}

type State = {
  mode: "view" | "add" | "edit";
  categoryId: number | null;
  name: string;
  color: string;
};

type Action =
  | { type: "SET_MODE"; payload: { mode: State["mode"] } }
  | { type: "SET_NAME"; payload: { name: string } }
  | { type: "SET_COLOR"; payload: { color: string } }
  | { type: "ON_EDIT"; payload: { category: AppCategory } };

const initialState: State = {
  mode: "view",
  categoryId: null,
  name: "",
  color: generateRandomColor(),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_MODE": {
      const { mode } = action.payload;

      if (mode === "add") {
        return {
          ...state,
          mode,
          name: "",
          color: generateRandomColor(),
        };
      }

      if (mode === "view") {
        return { ...state, mode, categoryId: null };
      }

      return { ...state, mode };
    }
    case "SET_NAME": {
      return { ...state, name: action.payload.name };
    }
    case "SET_COLOR": {
      return { ...state, color: action.payload.color };
    }
    case "ON_EDIT": {
      return { ...state, mode: "edit", ...action.payload.category };
    }
    default: {
      return state;
    }
  }
}

function generateRandomColor() {
  // return "#" + ((Math.random() * 0xffffff) << 0);
  return `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
}

const CategoryView: React.FC<IProps> = ({ style }) => {
  const {
    categories,
    activeCategoryId,
    activateCategory,
    addCategory,
    editCategory,
    deleteCategory,
  } = React.useContext(AppDataContext);
  const textInputHeight = React.useContext(TextInputHeight.Context);

  const [state, dispatch] = React.useReducer(reducer, initialState);

  const setMode = React.useCallback((mode: State["mode"]) => {
    dispatch({ type: "SET_MODE", payload: { mode } });
  }, []);

  const setName = React.useCallback((name: string) => {
    dispatch({ type: "SET_NAME", payload: { name } });
  }, []);

  const setColor = React.useCallback((color: string) => {
    dispatch({ type: "SET_COLOR", payload: { color } });
  }, []);

  const isValid = state.name.length > 0;

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    dispatch({ type: "SET_MODE", payload: { mode: "view" } });
  }, []);

  const onPressEdit = React.useCallback((category: AppCategory) => {
    dispatch({ type: "ON_EDIT", payload: { category } });
  }, []);

  const onSubmitAdd = () => {
    if (isValid) {
      addCategory({ name: state.name, color: state.color });
    }
  };

  const onSubmitEdit = () => {
    if (isValid && state.categoryId) {
      editCategory({
        categoryId: state.categoryId,
        name: state.name,
        color: state.color,
      });
    }
  };

  const onSubmitDelete = () => {
    if (state.categoryId) {
      deleteCategory(state.categoryId);
    }
  };

  React.useEffect(() => onClose(), [onClose, categories]);

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
            onPress={() => activateCategory(category.categoryId)}
          >
            <View
              style={[
                styles.flatlistItem,
                category.categoryId === activeCategoryId && {
                  backgroundColor: COLORS.dark,
                },
              ]}
            >
              <View
                style={[
                  styles.categoryColor,
                  { backgroundColor: category.color },
                ]}
              />
              <MyText fontSize="lg">{category.name}</MyText>
              <MyIcon
                style={{ marginLeft: "auto" }}
                onPress={() => onPressEdit(category)}
                name="pencil"
              />
            </View>
          </Pressable>
        )}
      />

      <View style={STYLES.sheet.opener}>
        <MyIcon onPress={() => setMode("add")} name="plus" size="lg" />
      </View>

      <BottomSheet
        visible={state.mode !== "view"}
        height={3 * (textInputHeight + 10) + 8}
        closeOnSwipeDown={true}
        closeOnSwipeTrigger={onClose}
        customStyles={{
          container: { backgroundColor: COLORS.light },
        }}
      >
        <View style={STYLES.sheet.container}>
          <View style={[STYLES.sheet.row, STYLES.sheet.header]}>
            <MyText fontSize="lg">
              {state.mode === "edit" ? "Edit category" : "Add category"}
            </MyText>
            {state.mode === "edit" && (
              <MyIcon
                style={{ marginLeft: "auto" }}
                onPress={onSubmitDelete}
                name="trash"
              />
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
              onPress={state.mode === "edit" ? onSubmitEdit : onSubmitAdd}
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
    borderBottomColor: COLORS.light,
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
});

export default CategoryView;
