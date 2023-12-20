import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import BidirectionalFlatList from "../components/BidirectionalFlatList";
import MonthView from "./MonthView";
import MonthGenerator from "../helpers/MonthGenerator";
import { COLORS, MONTH_VIEW_HEIGHT, STYLES } from "../constants";
import BottomSheet from "../components/BottomSheet";
import MyButton from "../components/MyButton";
import { CategoryContext } from "../components/CategoryProvider";
import SelectionContext from "../helpers/SelectionContext";
import MyIcon from "../components/MyIcon";

interface IProps {
  style?: ViewStyle;
}

type State = {
  mode: "view" | "add" | "edit";
  eventsByDate: Record<number, AppEvent>;
  selectedEvent: AppEvent | null;
  selectedStartDate: number;
  selectedStopDate: number;
  noteInput: string;
  startDateInput: string;
  stopDateInput: string;
};

type Action =
  | { type: "RESET" }
  | { type: "UPDATE_EVENTS"; payload: { events: AppEvent[] } }
  | { type: "ON_CHANGE"; payload: { key: keyof State; value: string } }
  | { type: "SELECT_DATE"; payload: { datetime: number } };

const initialState: State = {
  mode: "view",
  eventsByDate: {},
  selectedEvent: null,
  selectedStartDate: NaN,
  selectedStopDate: NaN,
  noteInput: "",
  startDateInput: "",
  stopDateInput: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET": {
      return { ...initialState, eventsByDate: state.eventsByDate };
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

      if (key === "startDateInput" || key === "stopDateInput") {
        value = Date.onChangeFormat(state[key], value);

        if (value.length == 10) {
          const datetime = Date.parse(value);

          if (datetime) {
            if (key === "startDateInput") state.selectedStartDate = datetime;
            if (key === "stopDateInput") state.selectedStopDate = datetime;
          }
        }
      }

      return { ...state, [key]: value };
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
            noteInput: event.note,
            startDateInput: new Date(event.startDate).toISODateString(),
            stopDateInput: new Date(event.stopDate).toISODateString(),
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
          stopDateInput: new Date(datetime).toISODateString(),
        };
      }

      // Otherwise select start date
      return {
        ...state,
        selectedStartDate: datetime,
        selectedStopDate: NaN,
        startDateInput: new Date(datetime).toISODateString(),
        stopDateInput: "",
      };
    }
    default:
      return state;
  }
}

const CalendarView: React.FC<IProps> = ({ style }) => {
  const { selectedCategory, events, addEvent, editEvent, deleteEvent } =
    React.useContext(CategoryContext);

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() =>
    monthGenerator.init(5, 5)
  );

  const isValid =
    state.selectedStartDate > 0 &&
    state.selectedStopDate > 0 &&
    state.selectedStartDate <= state.selectedStopDate;

  const onChange = React.useCallback(
    (key: keyof State) => (value: string) => {
      dispatch({ type: "ON_CHANGE", payload: { key, value } });
    },
    []
  );

  const selectDate = React.useCallback((datetime: number) => {
    dispatch({ type: "SELECT_DATE", payload: { datetime } });
  }, []);

  const showPreviousMonth = React.useCallback(() => {
    setVisibleMonths((months) => [monthGenerator.prev(), ...months]);
  }, [monthGenerator]);

  const showNextMonth = React.useCallback(() => {
    setVisibleMonths((months) => [...months, monthGenerator.next()]);
  }, [monthGenerator]);

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    dispatch({ type: "RESET" });
  }, []);

  const onPressAdd = () => {
    if (isValid && selectedCategory) {
      addEvent({
        categoryId: selectedCategory.categoryId,
        startDate: state.selectedStartDate,
        stopDate: state.selectedStopDate,
        note: state.noteInput,
      });
    }
  };

  const onPressEdit = () => {
    if (isValid && state.selectedEvent) {
      editEvent({
        ...state.selectedEvent,
        startDate: state.selectedStartDate,
        stopDate: state.selectedStopDate,
        note: state.noteInput,
      });
    }
  };

  const onPressDelete = () => {
    if (state.selectedEvent) {
      deleteEvent(state.selectedEvent.eventId, state.selectedEvent.categoryId);
    }
  };

  React.useEffect(() => {
    dispatch({ type: "UPDATE_EVENTS", payload: { events } });
    onClose();
  }, [onClose, events]);

  return (
    <View style={[styles.container, style]}>
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
          style={styles.flatlist}
          data={visibleMonths}
          renderItem={({ item: { year, month } }) => (
            <MonthView year={year} month={month} />
          )}
          getItemLayout={(_, index) => ({
            length: MONTH_VIEW_HEIGHT,
            offset: MONTH_VIEW_HEIGHT * index,
            index,
          })}
          initialScrollIndex={5}
          keyExtractor={({ year, month }) => `${year}.${month}`}
          onStartReached={showPreviousMonth}
          onStartReachedThreshold={1000}
          onEndReached={showNextMonth}
          onEndReachedThreshold={1000}
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

      <View style={STYLES.sheet.opener}>
        <MyIcon onPress={() => onChange("mode")("add")} name="plus" size="lg" />
      </View>

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
              value={state.startDateInput}
              onChangeText={onChange("startDateInput")}
              placeholder="YYYY-MM-DD"
              inputMode="numeric"
            />
            <TextInput
              style={STYLES.sheet.input}
              value={state.stopDateInput}
              onChangeText={onChange("stopDateInput")}
              placeholder="YYYY-MM-DD"
              inputMode="numeric"
            />
          </View>
          <View style={STYLES.sheet.row}>
            <TextInput
              style={STYLES.sheet.input}
              value={state.noteInput}
              onChangeText={onChange("noteInput")}
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
  flatlist: { paddingHorizontal: 5 },
  spinner: { marginVertical: 50 },
});

export default CalendarView;
