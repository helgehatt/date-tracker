import React from "react";
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import BidirectionalFlatList from "../components/BidirectionalFlatList";
import MonthView from "./MonthView";
import { COLORS, MONTH_VIEW_HEIGHT, STYLES, TODAY } from "../constants";
import BottomSheet from "../components/BottomSheet";
import MyButton from "../components/MyButton";
import { AppDataContext } from "../helpers/AppDataProvider";
import SelectionContext from "../helpers/SelectionContext";
import MyIcon from "../components/MyIcon";

interface IProps {
  style?: ViewStyle;
}

type State = {
  mode: "view" | "add" | "edit";
  months: Date[];
  thisMonthIndex: number;
  currentMonthIndex: number;
  eventsByDate: Record<number, AppEvent>;
  selectedEvent: AppEvent | null;
  selectedStartDate: number;
  selectedStopDate: number;
  input: {
    startDate: string;
    stopDate: string;
    note: string;
  };
};

type Action =
  | { type: "ON_OPEN" }
  | { type: "ON_CLOSE" }
  | { type: "UPDATE_EVENTS"; payload: { events: AppEvent[] } }
  | { type: "ON_CHANGE"; payload: { key: keyof State["input"]; value: string } }
  | { type: "ON_SCROLL"; payload: { index: number } }
  | { type: "SELECT_DATE"; payload: { datetime: number } }
  | { type: "PREV_MONTH" }
  | { type: "NEXT_MONTH" };

const THIS_MONTH = new Date(TODAY).floor();

const initialState: State = {
  mode: "view",
  months: [
    ...Array.from({ length: 5 }, (v, k) =>
      THIS_MONTH.add({ months: -(k + 1) })
    ).reverse(),
    THIS_MONTH,
    ...Array.from({ length: 5 }, (v, k) => THIS_MONTH.add({ months: k + 1 })),
  ],
  thisMonthIndex: 5,
  currentMonthIndex: 5,
  eventsByDate: {},
  selectedEvent: null,
  selectedStartDate: NaN,
  selectedStopDate: NaN,
  input: {
    startDate: "",
    stopDate: "",
    note: "",
  },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ON_OPEN": {
      return {
        ...state,
        mode: "add",
        input: {
          startDate: "",
          stopDate: "",
          note: "",
        },
      };
    }
    case "ON_CLOSE": {
      return {
        ...state,
        mode: "view",
        selectedEvent: null,
        selectedStartDate: NaN,
        selectedStopDate: NaN,
      };
    }
    case "ON_SCROLL": {
      return { ...state, currentMonthIndex: action.payload.index };
    }
    case "UPDATE_EVENTS": {
      const eventsByDate: Record<number, AppEvent> = {};

      for (const event of action.payload.events) {
        for (const date of Date.range(event.startDate, event.stopDate)) {
          eventsByDate[date] = event;
        }
      }

      return { ...state, eventsByDate };
    }
    case "ON_CHANGE": {
      const { key } = action.payload;
      let { value } = action.payload;

      if (key === "startDate" || key === "stopDate") {
        value = Date.onChangeFormat(state.input[key], value);

        if (value.length == 10) {
          const datetime = Date.parse(value);

          if (datetime) {
            if (key === "startDate") state.selectedStartDate = datetime;
            if (key === "stopDate") state.selectedStopDate = datetime;
          }
        }
      }

      return { ...state, input: { ...state.input, [key]: value } };
    }
    case "SELECT_DATE": {
      const { datetime } = action.payload;

      if (state.mode === "view") {
        if (datetime in state.eventsByDate) {
          const event = state.eventsByDate[datetime];
          return {
            ...state,
            mode: "edit",
            selectedEvent: event,
            selectedStartDate: event.startDate,
            selectedStopDate: event.stopDate,
            input: {
              startDate: new Date(event.startDate).toISODateString(),
              stopDate: new Date(event.stopDate).toISODateString(),
              note: event.note,
            },
          };
        }
        return state;
      }

      // Select stop date if start date is already selected
      // and the selected date is after the start date
      if (
        state.selectedStartDate &&
        !state.selectedStopDate &&
        state.selectedStartDate <= datetime
      ) {
        return {
          ...state,
          selectedStopDate: datetime,
          input: {
            ...state.input,
            stopDate: new Date(datetime).toISODateString(),
          },
        };
      }

      // Otherwise select start date
      return {
        ...state,
        selectedStartDate: datetime,
        selectedStopDate: NaN,
        input: {
          ...state.input,
          startDate: new Date(datetime).toISODateString(),
          stopDate: "",
        },
      };
    }
    case "PREV_MONTH": {
      const thisMonthIndex = state.thisMonthIndex + 1;
      const prev = state.months[0].add({ months: -1 });
      return { ...state, months: [prev, ...state.months], thisMonthIndex };
    }
    case "NEXT_MONTH": {
      const next = state.months[state.months.length - 1].add({ months: 1 });
      return { ...state, months: [...state.months, next] };
    }
    default:
      return state;
  }
}

const CalendarView: React.FC<IProps> = ({ style }) => {
  const {
    selectedCategory,
    events,
    setReferenceDate,
    addEvent,
    editEvent,
    deleteEvent,
  } = React.useContext(AppDataContext);

  const [state, dispatch] = React.useReducer(reducer, initialState);
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

  const onChange = React.useCallback(
    (key: keyof State["input"]) => (value: string) => {
      dispatch({ type: "ON_CHANGE", payload: { key, value } });
    },
    []
  );

  const selectDate = React.useCallback((datetime: number) => {
    dispatch({ type: "SELECT_DATE", payload: { datetime } });
  }, []);

  const showPreviousMonth = React.useCallback(() => {
    dispatch({ type: "PREV_MONTH" });
  }, []);

  const showNextMonth = React.useCallback(() => {
    dispatch({ type: "NEXT_MONTH" });
  }, []);

  const onOpen = React.useCallback(() => {
    dispatch({ type: "ON_OPEN" });
  }, []);

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    dispatch({ type: "ON_CLOSE" });
  }, []);

  const onPressAdd = () => {
    if (isValid && selectedCategory) {
      addEvent({
        categoryId: selectedCategory.categoryId,
        startDate: state.selectedStartDate,
        stopDate: state.selectedStopDate,
        note: state.input.note,
      });
    }
  };

  const onPressEdit = () => {
    if (isValid && state.selectedEvent) {
      editEvent({
        ...state.selectedEvent,
        startDate: state.selectedStartDate,
        stopDate: state.selectedStopDate,
        note: state.input.note,
      });
    }
  };

  const onPressDelete = () => {
    if (state.selectedEvent) {
      deleteEvent(state.selectedEvent.eventId, state.selectedEvent.categoryId);
    }
  };

  const onPressArrow = () => {
    flatlistRef.current?.scrollToIndex({
      animated: true,
      index: state.thisMonthIndex,
    });
  };

  React.useEffect(() => {
    dispatch({ type: "UPDATE_EVENTS", payload: { events } });
    onClose();
  }, [onClose, events]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.dayOfWeekContainer}>
        <Text style={styles.dayOfWeekText}>M</Text>
        <Text style={styles.dayOfWeekText}>T</Text>
        <Text style={styles.dayOfWeekText}>W</Text>
        <Text style={styles.dayOfWeekText}>T</Text>
        <Text style={styles.dayOfWeekText}>F</Text>
        <Text style={styles.dayOfWeekText}>S</Text>
        <Text style={styles.dayOfWeekText}>S</Text>
      </View>
      <SelectionContext.Provider
        value={{
          eventsByDate: state.eventsByDate,
          selectedEvent: state.selectedEvent,
          selectedStartDate: state.selectedStartDate,
          selectedStopDate: state.selectedStopDate,
          selectDate,
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
          onStartReached={showPreviousMonth}
          onStartReachedThreshold={1000}
          onEndReached={showNextMonth}
          onEndReachedThreshold={1000}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          showsVerticalScrollIndicator={false}
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
        onPress={onOpen}
        name="plus"
        size="lg"
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

      <BottomSheet
        visible={state.mode !== "view"}
        height={264}
        closeOnSwipeDown={true}
        closeOnSwipeTrigger={onClose}
        customStyles={{
          container: { backgroundColor: COLORS.tertiary },
        }}
      >
        <View style={[STYLES.sheet.container]}>
          <View style={[STYLES.sheet.row, STYLES.sheet.header]}>
            <Text style={STYLES.sheet.headerText}>
              {state.mode === "edit" ? "Edit event" : "Add event"}
            </Text>
            {state.mode === "edit" && (
              <MyIcon
                style={{ marginLeft: "auto" }}
                onPress={onPressDelete}
                name="trash"
              />
            )}
          </View>
          <View style={STYLES.sheet.row}>
            <TextInput
              style={STYLES.sheet.input}
              value={state.input.startDate}
              onChangeText={onChange("startDate")}
              placeholder="YYYY-MM-DD"
              inputMode="numeric"
            />
            <TextInput
              style={STYLES.sheet.input}
              value={state.input.stopDate}
              onChangeText={onChange("stopDate")}
              placeholder="YYYY-MM-DD"
              inputMode="numeric"
            />
          </View>
          <View style={STYLES.sheet.row}>
            <TextInput
              style={STYLES.sheet.input}
              value={state.input.note}
              onChangeText={onChange("note")}
              placeholder="Write a small note..."
            />
          </View>
          <View style={STYLES.sheet.row}>
            <MyButton
              style={STYLES.sheet.button}
              title="Confirm"
              onPress={state.mode === "edit" ? onPressEdit : onPressAdd}
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
    paddingHorizontal: 5,
  },
  spinner: {
    marginVertical: 50,
  },
  dayOfWeekContainer: {
    padding: 5,
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: "center",
    color: COLORS.text,
  },
  returnArrow: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
});

export default CalendarView;
