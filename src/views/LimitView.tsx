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
import { CategoryContext } from "../components/CategoryProvider";
import { COLORS, STYLES } from "../constants";
import BottomSheet from "../components/BottomSheet";
import { AppLimit } from "../helpers/AppDatabase";
import MyButton from "../components/MyButton";

interface IProps {
  style?: ViewStyle;
}

type State = {
  mode: "view" | "add" | "edit";
  selectedLimit: AppLimit | null;
  input: {
    name: string;
    maxDays: string;
    intervalType: "fixed" | "running" | "custom";
    fixedInterval: "yearly" | "monthly" | null;
    runningAmount: string;
    runningUnit: "year" | "month" | "day" | null;
    customStartDate: string;
    customStopDate: string;
  };
};

const initialState: State = {
  mode: "view",
  selectedLimit: null,
  input: {
    name: "",
    maxDays: "",
    intervalType: "fixed",
    fixedInterval: null,
    runningAmount: "",
    runningUnit: null,
    customStartDate: "",
    customStopDate: "",
  },
};

function convertLimit(limit: AppLimit): State["input"] {
  return {
    name: limit.name,
    maxDays: String(limit.maxDays),
    intervalType: limit.intervalType,
    fixedInterval: limit.fixedInterval,
    runningAmount: limit.runningAmount ? String(limit.runningAmount) : "",
    runningUnit: limit.runningUnit,
    customStartDate: limit.customStartDate
      ? new Date(limit.customStartDate).toISODateString()
      : "",
    customStopDate: limit.customStopDate
      ? new Date(limit.customStopDate).toISODateString()
      : "",
  };
}

function convertInput(input: State["input"]) {
  return {
    name: input.name,
    maxDays: Number(input.maxDays),
    intervalType: input.intervalType,
    fixedInterval: input.fixedInterval,
    runningAmount: input.runningAmount ? Number(input.runningAmount) : null,
    runningUnit: input.runningUnit,
    customStartDate: input.customStartDate
      ? Date.parse(input.customStartDate)
      : null,
    customStopDate: input.customStopDate
      ? Date.parse(input.customStopDate)
      : null,
  };
}

function isInputValid(input: State["input"]) {
  return (
    input.name.length > 0 &&
    Number(input.maxDays) > 0 &&
    (input.intervalType !== "fixed" || input.fixedInterval !== null) &&
    (input.intervalType !== "running" ||
      (Number(input.runningAmount) > 0 && input.runningUnit !== null)) &&
    (input.intervalType !== "custom" ||
      (Date.parse(input.customStartDate) > 0 &&
        Date.parse(input.customStopDate) > 0))
  );
}

const LimitView: React.FC<IProps> = ({ style }) => {
  const {
    selectedCategory,
    limits,
    limitCounts,
    addLimit,
    editLimit,
    deleteLimit,
  } = React.useContext(CategoryContext);

  const [state, setState] = React.useState<State>(initialState);

  const onChange = React.useCallback(
    (key: keyof State["input"]) => (value: State["input"][typeof key]) => {
      setState((prev) => {
        if (key === "customStartDate" || key === "customStopDate") {
          value = Date.onChangeFormat(prev["input"][key], value as string);
        }
        return { ...prev, input: { ...prev.input, [key]: value } };
      });
    },
    []
  );

  const isValid = isInputValid(state.input);

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    setState(initialState);
  }, []);

  const onSubmitAdd = () => {
    if (isValid && selectedCategory) {
      addLimit({
        categoryId: selectedCategory.categoryId,
        ...convertInput(state.input),
      });
      onClose();
    }
  };

  const onSubmitEdit = () => {
    if (isValid && state.selectedLimit) {
      editLimit({
        limitId: state.selectedLimit.limitId,
        categoryId: state.selectedLimit.categoryId,
        ...convertInput(state.input),
      } as AppLimit);
      onClose();
    }
  };

  const onSubmitDelete = () => {
    if (state.selectedLimit) {
      deleteLimit(state.selectedLimit.limitId, state.selectedLimit.categoryId);
    }
    onClose();
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        style={styles.flatlist}
        data={limits}
        ListHeaderComponent={<View style={{ height: 10 }} />}
        ListFooterComponent={<View style={{ height: 10 }} />}
        ItemSeparatorComponent={() => <View style={styles.flatlistSeparator} />}
        renderItem={({ item: limit }) => (
          <View style={styles.flatlistItem}>
            <View style={styles.flatlistLimit}>
              <Text style={styles.flatlistLimitText}>
                {limitCounts[limit.limitId]}/{limit.maxDays}
              </Text>
            </View>
            <Text style={styles.flatlistHeaderText}>{limit.name}</Text>
            <Pressable
              style={{ marginLeft: "auto" }}
              onPress={() =>
                setState({
                  mode: "edit",
                  selectedLimit: limit,
                  input: convertLimit(limit),
                })
              }
            >
              <EvilIcons name="pencil" size={30} color={COLORS.text} />
            </Pressable>
          </View>
        )}
      />

      <View style={STYLES.sheet.opener}>
        <Pressable
          onPress={() => setState((prev) => ({ ...prev, mode: "add" }))}
        >
          <EvilIcons name="plus" size={75} color="white" />
        </Pressable>
      </View>

      <BottomSheet
        visible={state.mode !== "view"}
        height={328}
        closeOnSwipeDown={true}
        closeOnSwipeTrigger={onClose}
        customStyles={{
          container: { backgroundColor: COLORS.tertiary },
        }}
      >
        <View style={STYLES.sheet.container}>
          <View style={[STYLES.sheet.row, STYLES.sheet.header]}>
            <Text style={STYLES.sheet.headerText}>
              {state.mode === "edit" ? "Edit limit" : "Add limit"}
            </Text>
            {state.mode === "edit" && (
              <Pressable onPress={onSubmitDelete}>
                <EvilIcons name="trash" size={30} color={COLORS.text} />
              </Pressable>
            )}
          </View>
          <View style={STYLES.sheet.row}>
            <TextInput
              style={[STYLES.sheet.input, { flex: 5 }]}
              value={state.input.name}
              onChangeText={onChange("name")}
              placeholder="Name"
            />
            <TextInput
              inputMode="numeric"
              style={[STYLES.sheet.input, { textAlign: "center" }]}
              value={state.input.maxDays}
              onChangeText={onChange("maxDays")}
              placeholder="Limit"
            />
          </View>
          <View style={[STYLES.sheet.row, styles.typeContainer]}>
            <Pressable
              onPress={() => onChange("intervalType")("fixed")}
              style={[
                styles.typePressable,
                { borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
                state.input.intervalType === "fixed" && {
                  backgroundColor: COLORS.secondary,
                },
              ]}
            >
              <Text style={styles.typeText}>Fixed</Text>
            </Pressable>
            <Pressable
              onPress={() => onChange("intervalType")("running")}
              style={[
                styles.typePressable,
                state.input.intervalType === "running" && {
                  backgroundColor: COLORS.secondary,
                },
              ]}
            >
              <Text style={styles.typeText}>Running</Text>
            </Pressable>
            <Pressable
              onPress={() => onChange("intervalType")("custom")}
              style={[
                styles.typePressable,
                { borderTopRightRadius: 15, borderBottomRightRadius: 15 },
                state.input.intervalType === "custom" && {
                  backgroundColor: COLORS.secondary,
                },
              ]}
            >
              <Text style={styles.typeText}>Custom</Text>
            </Pressable>
          </View>
          {state.input.intervalType === "fixed" && (
            <View style={[STYLES.sheet.row, styles.typeContainer]}>
              <Pressable
                onPress={() => onChange("fixedInterval")("yearly")}
                style={[
                  styles.typePressable,
                  { borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
                  state.input.fixedInterval === "yearly" && {
                    backgroundColor: COLORS.secondary,
                  },
                ]}
              >
                <Text style={styles.typeText}>Yearly</Text>
              </Pressable>
              <Pressable
                onPress={() => onChange("fixedInterval")("monthly")}
                style={[
                  styles.typePressable,
                  { borderTopRightRadius: 15, borderBottomRightRadius: 15 },
                  state.input.fixedInterval === "monthly" && {
                    backgroundColor: COLORS.secondary,
                  },
                ]}
              >
                <Text style={styles.typeText}>Monthly</Text>
              </Pressable>
            </View>
          )}
          {state.input.intervalType === "running" && (
            <View style={STYLES.sheet.row}>
              <TextInput
                inputMode="numeric"
                style={[STYLES.sheet.input, { textAlign: "center" }]}
                value={state.input.runningAmount}
                onChangeText={onChange("runningAmount")}
                placeholder="X"
              />
              <View style={[styles.typeContainer, { flex: 8 }]}>
                <Pressable
                  onPress={() => onChange("runningUnit")("year")}
                  style={[
                    styles.typePressable,
                    { borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
                    state.input.runningUnit === "year" && {
                      backgroundColor: COLORS.secondary,
                    },
                  ]}
                >
                  <Text style={styles.typeText}>Years</Text>
                </Pressable>
                <Pressable
                  onPress={() => onChange("runningUnit")("month")}
                  style={[
                    styles.typePressable,
                    state.input.runningUnit === "month" && {
                      backgroundColor: COLORS.secondary,
                    },
                  ]}
                >
                  <Text style={styles.typeText}>Months</Text>
                </Pressable>
                <Pressable
                  onPress={() => onChange("runningUnit")("day")}
                  style={[
                    styles.typePressable,
                    { borderTopRightRadius: 15, borderBottomRightRadius: 15 },
                    state.input.runningUnit === "day" && {
                      backgroundColor: COLORS.secondary,
                    },
                  ]}
                >
                  <Text style={styles.typeText}>Days</Text>
                </Pressable>
              </View>
            </View>
          )}
          {state.input.intervalType === "custom" && (
            <View style={STYLES.sheet.row}>
              <TextInput
                style={STYLES.sheet.input}
                value={state.input.customStartDate}
                onChangeText={onChange("customStartDate")}
                placeholder="YYYY-MM-DD"
                inputMode="numeric"
              />
              <TextInput
                style={STYLES.sheet.input}
                value={state.input.customStopDate}
                onChangeText={onChange("customStopDate")}
                placeholder="YYYY-MM-DD"
                inputMode="numeric"
              />
            </View>
          )}
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
    width: 75,
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 15,
  },
  flatlistLimitText: {
    color: COLORS.text,
    textAlign: "center",
  },
  typeContainer: {
    columnGap: 0,
    flexDirection: "row",
  },
  typePressable: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 15,
  },
  typeText: {
    fontSize: 20,
    color: COLORS.text,
  },
});

export default LimitView;
