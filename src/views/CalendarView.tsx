import React from "react";
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import BidirectionalFlatList from "../components/BidirectionalFlatList";
import MonthView from "./MonthView";
import { COLORS, MONTH_VIEW_HEIGHT, STYLES } from "../constants";
import BottomSheet from "../components/BottomSheet";
import MyButton from "../components/MyButton";
import AppDataContext from "../helpers/AppDataContext";
import SelectionContext from "../helpers/SelectionContext";
import TextInputHeightContext from "../helpers/TextInputHeightContext";
import MyIcon from "../components/MyIcon";
import MyTextInput from "../components/MyTextInput";
import MyText from "../components/MyText";
import {
  initialState,
  reducer,
  createActions,
} from "../reducers/CalendarReducer";
import MyModal from "../components/MyModal";

interface IProps {
  style?: ViewStyle;
}

const CalendarView: React.FC<IProps> = ({ style }) => {
  const {
    activeCategoryId,
    events,
    setReferenceDate,
    addEvent,
    editEvent,
    deleteEvent,
  } = React.useContext(AppDataContext);
  const textInputHeight = React.useContext(TextInputHeightContext);

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const actions = React.useMemo(() => createActions(dispatch), []);
  const flatlistRef = React.useRef<FlatList>(null);

  type ItemChange = NonNullable<FlatListProps<Date>["onViewableItemsChanged"]>;
  const onViewableItemsChanged = React.useRef<ItemChange>(
    ({ viewableItems }) => {
      if (viewableItems.length && viewableItems[0].index) {
        const { index, item } = viewableItems[0];
        dispatch({ type: "ON_SCROLL", payload: { index } });
        setReferenceDate(new Date(item).ceil());
      }
    }
  );

  const isValid =
    state.selectedStartDate > 0 &&
    state.selectedStopDate > 0 &&
    state.selectedStartDate <= state.selectedStopDate;

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    actions.setMode("none");
  }, [actions]);

  const onPressArrow = () => {
    flatlistRef.current?.scrollToIndex({
      animated: true,
      index: state.thisMonthIndex,
    });
  };

  const onSubmitAdd = () => {
    if (isValid && activeCategoryId) {
      addEvent({
        categoryId: activeCategoryId,
        startDate: state.selectedStartDate,
        stopDate: state.selectedStopDate,
        note: state.input.note,
      });
    }
  };

  const onSubmitEdit = () => {
    if (isValid && state.selectedEvent) {
      editEvent({
        ...state.selectedEvent,
        startDate: state.selectedStartDate,
        stopDate: state.selectedStopDate,
        note: state.input.note,
      });
    }
  };

  const onSubmitDelete = () => {
    if (state.selectedEvent) {
      deleteEvent(state.selectedEvent.eventId, state.selectedEvent.categoryId);
      actions.setModal("none");
    }
  };

  // Close open event when events change
  React.useEffect(() => onClose(), [onClose, events]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.dayOfWeekContainer}>
        <MyText style={{ flex: 1, textAlign: "center" }}>M</MyText>
        <MyText style={{ flex: 1, textAlign: "center" }}>T</MyText>
        <MyText style={{ flex: 1, textAlign: "center" }}>W</MyText>
        <MyText style={{ flex: 1, textAlign: "center" }}>T</MyText>
        <MyText style={{ flex: 1, textAlign: "center" }}>F</MyText>
        <MyText style={{ flex: 1, textAlign: "center" }}>S</MyText>
        <MyText style={{ flex: 1, textAlign: "center" }}>S</MyText>
      </View>
      <SelectionContext.Provider
        value={{
          selectedEvent: state.selectedEvent,
          selectedStartDate: state.selectedStartDate,
          selectedStopDate: state.selectedStopDate,
          selectDate: actions.selectDate,
        }}
      >
        <BidirectionalFlatList
          ref={flatlistRef}
          style={styles.flatlist}
          data={state.months}
          renderItem={({ item }: { item: Date }) => (
            <MonthView {...item.getComponents()} />
          )}
          getItemLayout={(_, index) => ({
            length: MONTH_VIEW_HEIGHT,
            offset: MONTH_VIEW_HEIGHT * index,
            index,
          })}
          initialScrollIndex={state.thisMonthIndex}
          keyExtractor={(item: Date) => item.toISODateString()}
          onStartReached={actions.showPreviousMonth}
          onStartReachedThreshold={1000}
          onEndReached={actions.showNextMonth}
          onEndReachedThreshold={1000}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          showsVerticalScrollIndicator={false}
          scrollsToTop={false}
          ListHeaderComponent={
            <ActivityIndicator
              size="large"
              color={COLORS.text}
              style={styles.spinner}
            />
          }
          ListFooterComponent={
            <ActivityIndicator
              size="large"
              color={COLORS.text}
              style={styles.spinner}
            />
          }
        />
      </SelectionContext.Provider>

      <MyIcon
        style={STYLES.sheet.opener}
        onPress={() => actions.setMode("add")}
        name="plus"
        size="lg"
        outline
      />

      {state.currentMonthIndex > state.thisMonthIndex + 2 && (
        <MyIcon
          style={styles.returnArrow}
          onPress={onPressArrow}
          name="arrow-up"
          size="lg"
        />
      )}

      {state.currentMonthIndex < state.thisMonthIndex - 2 && (
        <MyIcon
          style={styles.returnArrow}
          onPress={onPressArrow}
          name="arrow-down"
          size="lg"
        />
      )}

      {state.mode === "view" && (
        <TouchableOpacity style={styles.overlay} onPress={onClose} />
      )}

      <BottomSheet
        visible={state.mode !== "none"}
        height={4 * (textInputHeight + 10) + 8}
        closeOnSwipeDown={true}
        closeOnSwipeTrigger={onClose}
        customStyles={{
          container: { backgroundColor: COLORS.light },
        }}
      >
        <View style={[STYLES.sheet.container]}>
          <View style={[STYLES.sheet.row, STYLES.sheet.header]}>
            <MyText fontSize="lg">
              {state.mode === "view"
                ? "Event details"
                : state.mode === "edit"
                ? "Edit event"
                : "Add event"}
            </MyText>
            {state.mode === "view" && (
              <MyIcon
                style={{ marginLeft: "auto" }}
                onPress={() => actions.setMode("edit")}
                name="pencil"
              />
            )}
            {state.mode === "edit" && (
              <MyIcon
                style={{ marginLeft: "auto" }}
                onPress={() => actions.setModal("delete")}
                name="trash"
                color={COLORS.red}
              />
            )}
          </View>
          <View style={STYLES.sheet.row}>
            <MyTextInput
              editable={state.mode !== "view"}
              value={state.input.startDate}
              onChangeText={actions.onChange("startDate")}
              placeholder="YYYY-MM-DD"
              inputMode="numeric"
            />
            <MyTextInput
              editable={state.mode !== "view"}
              value={state.input.stopDate}
              onChangeText={actions.onChange("stopDate")}
              placeholder="YYYY-MM-DD"
              inputMode="numeric"
            />
          </View>
          <View style={STYLES.sheet.row}>
            <MyTextInput
              editable={state.mode !== "view"}
              value={state.input.note}
              onChangeText={actions.onChange("note")}
              placeholder="Write a small note..."
            />
          </View>
          {state.mode !== "view" && (
            <View style={STYLES.sheet.row}>
              <MyButton
                style={STYLES.sheet.button}
                title="Confirm"
                onPress={state.mode === "edit" ? onSubmitEdit : onSubmitAdd}
                disabled={!isValid}
              />
            </View>
          )}
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
            Are you sure you want to delete this event?
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
    paddingHorizontal: 5,
  },
  spinner: {
    marginVertical: 50,
  },
  dayOfWeekContainer: {
    padding: 5,
    flexDirection: "row",
    backgroundColor: COLORS.dark,
  },
  returnArrow: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  overlay: {
    position: "absolute",
    ...{ top: 0, bottom: 0, right: 0, left: 0 },
  },
});

export default CalendarView;
