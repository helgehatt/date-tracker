import React from "react";

type State = {
  mode: "none" | "view" | "add" | "edit";
  months: Date[];
  thisMonthIndex: number;
  currentMonthIndex: number;
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
  | { type: "SET_MODE"; payload: { mode: State["mode"] } }
  | { type: "ON_CHANGE"; payload: { key: keyof State["input"]; value: string } }
  | { type: "ON_SCROLL"; payload: { index: number } }
  | { type: "PREV_MONTH" }
  | { type: "NEXT_MONTH" }
  | {
      type: "SELECT_DATE";
      payload: { date: number; eventsByDate: Record<number, AppEvent> };
    };

const THIS_MONTH = new Date(Date.today()).floor();

export const initialState: State = {
  mode: "none",
  months: [
    ...Array.from({ length: 5 }, (v, k) =>
      THIS_MONTH.add({ months: -(k + 1) })
    ).reverse(),
    THIS_MONTH,
    ...Array.from({ length: 5 }, (v, k) => THIS_MONTH.add({ months: k + 1 })),
  ],
  thisMonthIndex: 5,
  currentMonthIndex: 5,
  selectedEvent: null,
  selectedStartDate: NaN,
  selectedStopDate: NaN,
  input: {
    startDate: "",
    stopDate: "",
    note: "",
  },
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_MODE": {
      const { mode } = action.payload;

      if (mode === "add")
        return {
          ...state,
          mode,
          input: {
            startDate: "",
            stopDate: "",
            note: "",
          },
        };

      if (mode === "none") {
        return {
          ...state,
          mode,
          selectedEvent: null,
          selectedStartDate: NaN,
          selectedStopDate: NaN,
        };
      }

      return { ...state, mode };
    }
    case "ON_SCROLL": {
      return { ...state, currentMonthIndex: action.payload.index };
    }
    case "ON_CHANGE": {
      const { key } = action.payload;
      let { value } = action.payload;

      if (key === "startDate" || key === "stopDate") {
        value = Date.onChangeFormat(state.input[key], value);

        if (value.length == 10) {
          const date = Date.parse(value);

          if (date) {
            if (key === "startDate") state.selectedStartDate = date;
            if (key === "stopDate") state.selectedStopDate = date;
          }
        }
      }

      return { ...state, input: { ...state.input, [key]: value } };
    }
    case "SELECT_DATE": {
      const { date, eventsByDate } = action.payload;

      // If mode === "edit" the TouchableOpacity will prevent SELECT_DATE

      if (state.mode === "none") {
        if (date in eventsByDate) {
          const event = eventsByDate[date];
          return {
            ...state,
            mode: "view",
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
        state.selectedStartDate <= date
      ) {
        return {
          ...state,
          selectedStopDate: date,
          input: {
            ...state.input,
            stopDate: new Date(date).toISODateString(),
          },
        };
      }

      // Otherwise select start date
      return {
        ...state,
        selectedStartDate: date,
        selectedStopDate: NaN,
        input: {
          ...state.input,
          startDate: new Date(date).toISODateString(),
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
};

export const createActions = (dispatch: React.Dispatch<Action>) => ({
  onScroll: (index: number) => {
    dispatch({ type: "ON_SCROLL", payload: { index } });
  },
  onChange: (key: keyof State["input"]) => (value: string) => {
    dispatch({ type: "ON_CHANGE", payload: { key, value } });
  },
  selectDate: (date: number, eventsByDate: Record<number, AppEvent>) => {
    dispatch({ type: "SELECT_DATE", payload: { date, eventsByDate } });
  },
  showPreviousMonth: () => {
    dispatch({ type: "PREV_MONTH" });
  },
  showNextMonth: () => {
    dispatch({ type: "NEXT_MONTH" });
  },
  setMode: (mode: State["mode"]) => {
    dispatch({ type: "SET_MODE", payload: { mode } });
  },
});

export default {
  initialState,
  reducer,
  createActions,
};
