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
import { EvilIcons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import { CategoryContext } from "../components/CategoryProvider";
import { COLORS, STYLES } from "../constants";
import BottomSheet from "../components/BottomSheet";
import { AppLimit } from "../helpers/AppDatabase";
import MyButton from "../components/MyButton";

interface IProps {
  style?: ViewStyle;
}

type DataPoint = {
  value: number;
  date: string;
  label?: string;
};

type Mode = "view" | "add" | "edit";
type State = Omit<AppLimit, "categoryId" | "limitId" | "value"> & {
  limitId?: number;
  categoryId?: number;
  value: string;
};
type Modifiers =
  | "startOfYear"
  | "startOfMonth"
  | "yearOffset"
  | "monthOffset"
  | "dayOffset";

const initialState: State = {
  name: "",
  value: "",
  startOfYear: 0,
  startOfMonth: 0,
  yearOffset: 0,
  monthOffset: 0,
  dayOffset: 0,
};

const numericModifiers = new Set(["yearOffset", "monthOffset", "dayOffset"]);

function getLabelFromDate(date: number | string) {
  const options = { month: "short", day: "numeric" } as const;
  return new Date(date).toLocaleDateString("en-gb", options);
}

const LimitView: React.FC<IProps> = ({ style }) => {
  const {
    selectedCategory,
    limits,
    eventCountsByLimit,
    addLimit,
    editLimit,
    deleteLimit,
  } = React.useContext(CategoryContext);

  const [mode, setMode] = React.useState<Mode>("view");
  const [state, setState] = React.useState<State>(initialState);
  const [selectedModifier, setSelectedModifier] = React.useState<Modifiers>();

  const setName = React.useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }));
  }, []);

  const setValue = React.useCallback((value: string) => {
    setState((prev) => ({ ...prev, value }));
  }, []);

  const reset = React.useCallback((key: keyof State) => {
    setState((prev) => ({ ...prev, [key]: 0 }));
  }, []);

  const isValid = state.name.length > 0 && Number(state.value) > 0;

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    setMode("view");
    setState(initialState);
  }, []);

  const onSubmitAdd = () => {
    if (isValid && selectedCategory) {
      addLimit({
        categoryId: selectedCategory.categoryId,
        name: state.name,
        value: Number(state.value),
        startOfYear: Number(state.startOfYear),
        startOfMonth: Number(state.startOfMonth),
        yearOffset: Number(state.yearOffset),
        monthOffset: Number(state.monthOffset),
        dayOffset: Number(state.dayOffset),
      });
      onClose();
    }
  };

  const onSubmitEdit = () => {
    if (isValid && state.limitId && state.categoryId) {
      editLimit({
        limitId: state.limitId,
        categoryId: state.categoryId,
        name: state.name,
        value: Number(state.value),
        startOfYear: Number(state.startOfYear),
        startOfMonth: Number(state.startOfMonth),
        yearOffset: Number(state.yearOffset),
        monthOffset: Number(state.monthOffset),
        dayOffset: Number(state.dayOffset),
      });
      onClose();
    }
  };

  const onSubmitDelete = () => {
    if (state.limitId && state.categoryId) {
      const { limitId, categoryId } = state;
      deleteLimit(limitId, categoryId);
    }
    onClose();
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        style={styles.flatlist}
        data={limits}
        ItemSeparatorComponent={() => <View style={styles.flatlistSeparator} />}
        renderItem={({ item: limit }) => (
          <View style={styles.flatlistItem}>
            <View style={{ width: 75 }}>
              <View style={styles.flatlistLimit}>
                <Text style={styles.flatlistLimitText}>
                  {Math.max(
                    0,
                    ...eventCountsByLimit[limit.limitId].map((x) => x.value)
                  )}
                  /{limit.value}
                </Text>
              </View>
            </View>
            <Text style={styles.flatlistHeaderText}>{limit.name}</Text>
            <Pressable
              style={{ marginLeft: "auto" }}
              onPress={() => {
                setMode("edit");
                setState({
                  limitId: limit.limitId,
                  categoryId: limit.categoryId,
                  name: limit.name,
                  value: String(limit.value),
                  startOfYear: limit.startOfYear,
                  startOfMonth: limit.startOfMonth,
                  yearOffset: limit.yearOffset,
                  monthOffset: limit.monthOffset,
                  dayOffset: limit.dayOffset,
                });
              }}
            >
              <EvilIcons name="pencil" size={30} color={COLORS.text} />
            </Pressable>
          </View>
        )}
      />

      <View style={STYLES.sheet.opener}>
        <Pressable onPress={() => setMode("add")}>
          <EvilIcons name="plus" size={75} color="white" />
        </Pressable>
      </View>

      <BottomSheet
        visible={mode !== "view"}
        height={400}
        closeOnSwipeDown={true}
        closeOnSwipeTrigger={onClose}
        customStyles={{
          container: { backgroundColor: COLORS.tertiary },
        }}
      >
        <View style={STYLES.sheet.container}>
          <View style={[STYLES.sheet.row, STYLES.sheet.header]}>
            <Text style={STYLES.sheet.headerText}>
              {mode === "edit" ? "Edit limit" : "Add limit"}
            </Text>
            {mode === "edit" && (
              <Pressable onPress={onSubmitDelete}>
                <EvilIcons name="trash" size={30} color={COLORS.text} />
              </Pressable>
            )}
          </View>
          <View style={STYLES.sheet.row}>
            <TextInput
              style={[STYLES.sheet.input, { flex: 5 }]}
              value={state.name}
              onChangeText={setName}
              placeholder="Name"
            />
            <TextInput
              inputMode="numeric"
              style={STYLES.sheet.input}
              value={String(state.value)}
              onChangeText={setValue}
              placeholder="Limit"
            />
          </View>
          <View style={[STYLES.sheet.row, styles.tagContainer]}>
            {state.startOfYear > 0 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Start of year</Text>
                <Pressable
                  style={styles.tagClose}
                  onPress={() => reset("startOfYear")}
                >
                  <EvilIcons name="close" size={20} color={COLORS.text} />
                </Pressable>
              </View>
            )}
            {state.startOfMonth > 0 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Start of month</Text>
                <Pressable
                  style={styles.tagClose}
                  onPress={() => reset("startOfMonth")}
                >
                  <EvilIcons name="close" size={20} color={COLORS.text} />
                </Pressable>
              </View>
            )}
            {state.yearOffset > 0 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{state.yearOffset} years</Text>
                <Pressable
                  style={styles.tagClose}
                  onPress={() => reset("yearOffset")}
                >
                  <EvilIcons name="close" size={20} color={COLORS.text} />
                </Pressable>
              </View>
            )}
            {state.monthOffset > 0 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{state.monthOffset} months</Text>
                <Pressable
                  style={styles.tagClose}
                  onPress={() => reset("monthOffset")}
                >
                  <EvilIcons name="close" size={20} color={COLORS.text} />
                </Pressable>
              </View>
            )}
            {state.dayOffset > 0 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{state.dayOffset} days</Text>
                <Pressable
                  style={styles.tagClose}
                  onPress={() => reset("dayOffset")}
                >
                  <EvilIcons name="close" size={20} color={COLORS.text} />
                </Pressable>
              </View>
            )}
          </View>
          <View style={STYLES.sheet.row}>
            <RNPickerSelect
              darkTheme
              style={{
                viewContainer: {
                  flex: 5,
                },
                inputIOSContainer: {
                  backgroundColor: COLORS.background,
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                  borderRadius: 15,
                },
                inputIOS: {
                  fontSize: 20,
                  color: COLORS.text,
                },
              }}
              // selectedValue={selectedModifier}
              onValueChange={(x) => setSelectedModifier(x)}
              items={[
                ...(state.startOfYear === 0
                  ? [{ label: "Start of year", value: "startOfYear" }]
                  : []),
                ...(state.startOfMonth === 0
                  ? [{ label: "Start of month", value: "startOfMonth" }]
                  : []),
                ...(state.yearOffset === 0
                  ? [{ label: "Year offset", value: "yearOffset" }]
                  : []),
                ...(state.monthOffset === 0
                  ? [{ label: "Month offset", value: "monthOffset" }]
                  : []),
                ...(state.dayOffset === 0
                  ? [{ label: "Day offset", value: "dayOffset" }]
                  : []),
              ]}
            />
            {numericModifiers.has(selectedModifier || "") && (
              <TextInput
                inputMode="numeric"
                style={STYLES.sheet.input}
                value={String(state.value)}
                onChangeText={setValue}
                placeholder="Limit"
              />
            )}
            <Pressable style={{ justifyContent: "center" }}>
              <EvilIcons name="plus" size={60} color={COLORS.text} />
            </Pressable>
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
    marginBottom: 15,
  },
  flatlistSeparator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tertiary,
  },
  flatlistItem: {
    padding: 10,
    columnGap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  flatlistHeaderText: {
    fontSize: 20,
    color: COLORS.text,
  },
  flatlistLimit: {
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 15,
  },
  flatlistLimitText: {
    color: COLORS.text,
  },
  tagContainer: {
    justifyContent: "flex-start",
    flexWrap: "wrap",
    rowGap: 10,
  },
  tag: {
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 15,
  },
  tagText: {
    color: COLORS.text,
  },
  tagClose: {
    backgroundColor: COLORS.background,
    margin: -10,
    marginLeft: 10,
    padding: 10,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
});

export default LimitView;
