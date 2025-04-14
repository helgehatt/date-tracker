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
import AppDataContext from "../helpers/AppDataContext";
import TextInputHeightContext from "../helpers/TextInputHeightContext";
import { COLORS, STYLES } from "../constants";
import BottomSheet from "../components/BottomSheet";
import MyButton from "../components/MyButton";
import MyIcon from "../components/MyIcon";
import MyLimit from "../components/MyLimit";
import MyText from "../components/MyText";
import { initialState, reducer, createActions } from "../reducers/LimitReducer";
import MyModal from "../components/MyModal";

interface IProps {
  style?: ViewStyle;
}

function convertInput(input: (typeof initialState)["input"]) {
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

function isInputValid(input: (typeof initialState)["input"]) {
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
    activeCategoryId,
    eventDates,
    limits,
    limitsById,
    activateLimit,
    addLimit,
    editLimit,
    deleteLimit,
  } = React.useContext(AppDataContext);
  const textInputHeight = React.useContext(TextInputHeightContext);

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const actions = React.useMemo(() => createActions(dispatch), []);

  const isValid = isInputValid(state.input);

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    actions.setMode("none");
  }, [actions]);

  const onSubmitAdd = () => {
    if (isValid && activeCategoryId) {
      addLimit({
        categoryId: activeCategoryId,
        isFavorite: 0,
        ...convertInput(state.input),
      });
      onClose();
    }
  };

  const onSubmitEdit = () => {
    if (isValid && state.limitId) {
      editLimit({
        ...limitsById[state.limitId],
        ...convertInput(state.input),
      });
      onClose();
    }
  };

  const onSubmitDelete = () => {
    if (state.limitId && activeCategoryId) {
      deleteLimit(state.limitId, activeCategoryId);
      actions.setModal("none");
    }
    onClose();
  };

  const onFavorite = () => {
    if (state.limitId) {
      editLimit({
        ...limitsById[state.limitId],
        isFavorite: 1 - limitsById[state.limitId].isFavorite,
      });
    }
  };

  const isFavorite =
    state.limitId !== null && limitsById[state.limitId].isFavorite === 1;

  return (
    <View style={[styles.container, style]}>
      <FlatList
        style={styles.flatlist}
        data={limits}
        ListHeaderComponent={<View style={{ height: 10 }} />}
        ListFooterComponent={<View style={{ height: 10 }} />}
        ItemSeparatorComponent={() => <View style={styles.flatlistSeparator} />}
        renderItem={({ item: limit }) => (
          <Pressable
            key={limit.limitId}
            onPress={() => activateLimit(limit.limitId)}
          >
            <View style={styles.flatlistItem}>
              <View style={styles.flatlistLimit}>
                <MyLimit
                  limit={limit}
                  date={Date.today()}
                  eventDates={eventDates}
                />
              </View>
              <MyText fontSize="lg">{limit.name}</MyText>
              <MyIcon
                style={{ marginLeft: "auto" }}
                onPress={() => actions.selectLimit(limit)}
                name="pencil"
              />
            </View>
          </Pressable>
        )}
      />

      <MyIcon
        style={STYLES.sheet.opener}
        onPress={() => actions.setMode("add")}
        name="plus"
        size="lg"
        outline
      />

      <BottomSheet
        visible={state.mode !== "none"}
        height={5 * (textInputHeight + 10) + 8}
        closeOnSwipeDown={true}
        closeOnSwipeTrigger={onClose}
        customStyles={{
          container: { backgroundColor: COLORS.light },
        }}
      >
        <View style={STYLES.sheet.container}>
          <View style={[STYLES.sheet.row, STYLES.sheet.header]}>
            <MyText fontSize="lg">
              {state.mode === "edit" ? "Edit limit" : "Add limit"}
            </MyText>
            {state.mode === "edit" && (
              <>
                <MyIcon
                  onPress={onFavorite}
                  style={[{ marginLeft: "auto" }]}
                  name="star"
                  color={isFavorite ? "#e2cb16" : undefined}
                  outline={!isFavorite}
                />
                <MyIcon
                  onPress={() => actions.setModal("delete")}
                  name="trash"
                  color={COLORS.red}
                />
              </>
            )}
          </View>
          <View style={STYLES.sheet.row}>
            <TextInput
              style={[STYLES.sheet.input, { flex: 5 }]}
              value={state.input.name}
              onChangeText={actions.onChange("name")}
              placeholder="Name"
            />
            <TextInput
              inputMode="numeric"
              style={[STYLES.sheet.input, { textAlign: "center" }]}
              value={state.input.maxDays}
              onChangeText={actions.onChange("maxDays")}
              placeholder="Limit"
            />
          </View>
          <View style={[STYLES.sheet.row, styles.typeContainer]}>
            <Pressable
              onPress={() => actions.onChange("intervalType")("fixed")}
              style={[
                styles.typePressable,
                { borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
                state.input.intervalType === "fixed" && {
                  backgroundColor: COLORS.dark,
                },
              ]}
            >
              <MyText fontSize="lg">Fixed</MyText>
            </Pressable>
            <Pressable
              onPress={() => actions.onChange("intervalType")("running")}
              style={[
                styles.typePressable,
                state.input.intervalType === "running" && {
                  backgroundColor: COLORS.dark,
                },
              ]}
            >
              <MyText fontSize="lg">Running</MyText>
            </Pressable>
            <Pressable
              onPress={() => actions.onChange("intervalType")("custom")}
              style={[
                styles.typePressable,
                { borderTopRightRadius: 15, borderBottomRightRadius: 15 },
                state.input.intervalType === "custom" && {
                  backgroundColor: COLORS.dark,
                },
              ]}
            >
              <MyText fontSize="lg">Custom</MyText>
            </Pressable>
          </View>
          {state.input.intervalType === "fixed" && (
            <View style={[STYLES.sheet.row, styles.typeContainer]}>
              <Pressable
                onPress={() => actions.onChange("fixedInterval")("yearly")}
                style={[
                  styles.typePressable,
                  { borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
                  state.input.fixedInterval === "yearly" && {
                    backgroundColor: COLORS.dark,
                  },
                ]}
              >
                <MyText fontSize="lg">Yearly</MyText>
              </Pressable>
              <Pressable
                onPress={() => actions.onChange("fixedInterval")("monthly")}
                style={[
                  styles.typePressable,
                  { borderTopRightRadius: 15, borderBottomRightRadius: 15 },
                  state.input.fixedInterval === "monthly" && {
                    backgroundColor: COLORS.dark,
                  },
                ]}
              >
                <MyText fontSize="lg">Monthly</MyText>
              </Pressable>
            </View>
          )}
          {state.input.intervalType === "running" && (
            <View style={STYLES.sheet.row}>
              <TextInput
                inputMode="numeric"
                style={[STYLES.sheet.input, { textAlign: "center" }]}
                value={state.input.runningAmount}
                onChangeText={actions.onChange("runningAmount")}
                placeholder="X"
              />
              <View style={[styles.typeContainer, { flex: 8 }]}>
                <Pressable
                  onPress={() => actions.onChange("runningUnit")("year")}
                  style={[
                    styles.typePressable,
                    { borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
                    state.input.runningUnit === "year" && {
                      backgroundColor: COLORS.dark,
                    },
                  ]}
                >
                  <MyText fontSize="lg">Years</MyText>
                </Pressable>
                <Pressable
                  onPress={() => actions.onChange("runningUnit")("month")}
                  style={[
                    styles.typePressable,
                    state.input.runningUnit === "month" && {
                      backgroundColor: COLORS.dark,
                    },
                  ]}
                >
                  <MyText fontSize="lg">Months</MyText>
                </Pressable>
                <Pressable
                  onPress={() => actions.onChange("runningUnit")("day")}
                  style={[
                    styles.typePressable,
                    { borderTopRightRadius: 15, borderBottomRightRadius: 15 },
                    state.input.runningUnit === "day" && {
                      backgroundColor: COLORS.dark,
                    },
                  ]}
                >
                  <MyText fontSize="lg">Days</MyText>
                </Pressable>
              </View>
            </View>
          )}
          {state.input.intervalType === "custom" && (
            <View style={STYLES.sheet.row}>
              <TextInput
                style={STYLES.sheet.input}
                value={state.input.customStartDate}
                onChangeText={actions.onChange("customStartDate")}
                placeholder="YYYY-MM-DD"
                inputMode="numeric"
              />
              <TextInput
                style={STYLES.sheet.input}
                value={state.input.customStopDate}
                onChangeText={actions.onChange("customStopDate")}
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
      <MyModal
        transparent={true}
        visible={state.modal === "delete"}
        onRequestClose={() => actions.setModal("none")}
        style={{ rowGap: 20 }}
      >
        <View>
          <MyText fontSize="md">
            Are you sure you want to delete this limit?
          </MyText>
        </View>
        <View style={STYLES.sheet.row}>
          <MyButton
            style={STYLES.sheet.button}
            title="Cancel"
            onPress={() => actions.setModal("none")}
          />
          <MyButton
            style={STYLES.sheet.button}
            color={COLORS.red}
            title="Confirm"
            onPress={() => onSubmitDelete()}
          />
        </View>
      </MyModal>
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
    padding: 10,
    columnGap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  flatlistLimit: {
    width: 75,
    justifyContent: "center",
    backgroundColor: COLORS.dark,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 15,
  },
  typeContainer: {
    columnGap: 0,
    flexDirection: "row",
  },
  typePressable: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.base,
    paddingVertical: 15,
  },
});

export default LimitView;
