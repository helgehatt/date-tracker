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
  limitId?: number;
  categoryId?: number;
  name: string;
  maxDays: string;
  intervalType: "fixed" | "running" | "custom";
  fixedInterval: "yearly" | "monthly" | null;
  runningAmount: string;
  runningUnit: "year" | "month" | "day" | null;
  customStartDate: string;
  customStopDate: string;
};

const initialState: State = {
  mode: "view",
  name: "",
  maxDays: "",
  intervalType: "fixed",
  fixedInterval: null,
  runningAmount: "",
  runningUnit: null,
  customStartDate: "",
  customStopDate: "",
};

const LimitView: React.FC<IProps> = ({ style }) => {
  const {
    selectedCategory,
    limits,
    eventCountsByLimit,
    addLimit,
    editLimit,
    deleteLimit,
  } = React.useContext(CategoryContext);

  const [state, setState] = React.useState<State>(initialState);

  const onChange = React.useCallback(
    (key: keyof State) => (value: State[typeof key]) => {
      setState((prev) => {
        if (key === "customStartDate" || key === "customStopDate") {
          value = Date.onChangeFormat(prev[key], value as string);
        }
        return { ...prev, [key]: value };
      });
    },
    []
  );

  const isValid =
    state.name.length > 0 &&
    Number(state.maxDays) > 0 &&
    (state.intervalType !== "fixed" || state.fixedInterval !== null) &&
    (state.intervalType !== "running" ||
      (Number(state.runningAmount) > 0 && state.runningUnit !== null)) &&
    (state.intervalType !== "custom" ||
      (Date.parse(state.customStartDate) > 0 &&
        Date.parse(state.customStopDate) > 0));

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    setState(initialState);
  }, []);

  const onSubmitAdd = () => {
    if (isValid && selectedCategory) {
      addLimit({
        categoryId: selectedCategory.categoryId,
        name: state.name,
        maxDays: Number(state.maxDays),
        intervalType: state.intervalType,
        fixedInterval: state.fixedInterval,
        runningAmount: state.runningAmount ? Number(state.runningAmount) : null,
        runningUnit: state.runningUnit,
        customStartDate: state.customStartDate
          ? Date.parse(state.customStartDate)
          : null,
        customStopDate: state.customStopDate
          ? Date.parse(state.customStopDate)
          : null,
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
        maxDays: Number(state.maxDays),
        intervalType: state.intervalType,
        fixedInterval: state.fixedInterval,
        runningAmount: state.runningAmount ? Number(state.runningAmount) : null,
        runningUnit: state.runningUnit,
        customStartDate: state.customStartDate
          ? Date.parse(state.customStartDate)
          : null,
        customStopDate: state.customStopDate
          ? Date.parse(state.customStopDate)
          : null,
      } as AppLimit);
      onClose();
    }
  };

  const onSubmitDelete = () => {
    if (state.limitId && state.categoryId) {
      deleteLimit(state.limitId, state.categoryId);
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
                {Math.max(
                  0,
                  ...eventCountsByLimit[limit.limitId].map((x) => x.value)
                )}
                /{limit.maxDays}
              </Text>
            </View>
            <Text style={styles.flatlistHeaderText}>{limit.name}</Text>
            <Pressable
              style={{ marginLeft: "auto" }}
              onPress={() => {
                setState({
                  mode: "edit",
                  limitId: limit.limitId,
                  categoryId: limit.categoryId,
                  name: limit.name,
                  maxDays: String(limit.maxDays),
                  intervalType: limit.intervalType,
                  fixedInterval: limit.fixedInterval,
                  runningAmount: limit.runningAmount
                    ? String(limit.runningAmount)
                    : "",
                  runningUnit: limit.runningUnit,
                  customStartDate: limit.customStartDate
                    ? new Date(limit.customStartDate).toISODateString()
                    : "",
                  customStopDate: limit.customStopDate
                    ? new Date(limit.customStopDate).toISODateString()
                    : "",
                });
              }}
            >
              <EvilIcons name="pencil" size={30} color={COLORS.text} />
            </Pressable>
          </View>
        )}
      />

      <View style={STYLES.sheet.opener}>
        <Pressable onPress={() => onChange("mode")("add")}>
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
              value={state.name}
              onChangeText={onChange("name")}
              placeholder="Name"
            />
            <TextInput
              inputMode="numeric"
              style={[STYLES.sheet.input, { textAlign: "center" }]}
              value={state.maxDays}
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
                state.intervalType === "fixed" && {
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
                state.intervalType === "running" && {
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
                state.intervalType === "custom" && {
                  backgroundColor: COLORS.secondary,
                },
              ]}
            >
              <Text style={styles.typeText}>Custom</Text>
            </Pressable>
          </View>
          {state.intervalType === "fixed" && (
            <View style={[STYLES.sheet.row, styles.typeContainer]}>
              <Pressable
                onPress={() => onChange("fixedInterval")("yearly")}
                style={[
                  styles.typePressable,
                  { borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
                  state.fixedInterval === "yearly" && {
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
                  state.fixedInterval === "monthly" && {
                    backgroundColor: COLORS.secondary,
                  },
                ]}
              >
                <Text style={styles.typeText}>Monthly</Text>
              </Pressable>
            </View>
          )}
          {state.intervalType === "running" && (
            <View style={STYLES.sheet.row}>
              <TextInput
                inputMode="numeric"
                style={[STYLES.sheet.input, { textAlign: "center" }]}
                value={state.runningAmount}
                onChangeText={onChange("runningAmount")}
                placeholder="X"
              />
              <View style={[styles.typeContainer, { flex: 8 }]}>
                <Pressable
                  onPress={() => onChange("runningUnit")("year")}
                  style={[
                    styles.typePressable,
                    { borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
                    state.runningUnit === "year" && {
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
                    state.runningUnit === "month" && {
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
                    state.runningUnit === "day" && {
                      backgroundColor: COLORS.secondary,
                    },
                  ]}
                >
                  <Text style={styles.typeText}>Days</Text>
                </Pressable>
              </View>
            </View>
          )}
          {state.intervalType === "custom" && (
            <View style={STYLES.sheet.row}>
              <TextInput
                style={STYLES.sheet.input}
                value={state.customStartDate}
                onChangeText={onChange("customStartDate")}
                placeholder="YYYY-MM-DD"
                inputMode="numeric"
              />
              <TextInput
                style={STYLES.sheet.input}
                value={state.customStopDate}
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
