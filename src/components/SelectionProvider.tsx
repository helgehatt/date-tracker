import React from "react";
import { AppEvent } from "../helpers/ApplicationStorage";

type State = {
  selectMode: "add" | "edit" | undefined;
  selectedStartDate: number | undefined;
  selectedStopDate: number | undefined;
};

type Action =
  | { type: "SELECT_DATE"; payload: { datetime: number } }
  | { type: "SELECT_EVENT"; payload: { event: AppEvent } }
  | { type: "TOGGLE_SELECT_MODE" }
  | {
      type: "SET_SELECTED_DATE";
      payload: { datetime: number; type: "START" | "STOP" };
    };

type Context = State & {
  setSelectedStartDate: (datetime: number) => void;
  setSelectedStopDate: (datetime: number) => void;
  selectDate: (datetime: number) => void;
  selectEvent: (event: AppEvent) => void;
  toggleSelectMode: () => void;
};

const initialState: State = {
  selectMode: undefined,
  selectedStartDate: undefined,
  selectedStopDate: undefined,
};

export const SelectionContext = React.createContext<Context>({
  ...initialState,
  setSelectedStartDate: () => undefined,
  setSelectedStopDate: () => undefined,
  selectDate: () => undefined,
  selectEvent: () => undefined,
  toggleSelectMode: () => undefined,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_DATE": {
      const { datetime } = action.payload;

      if (state.selectMode === "add") {
        // If start date is already selected and before this selection
        if (
          state.selectedStartDate &&
          !state.selectedStopDate &&
          state.selectedStartDate <= datetime
        ) {
          return { ...state, selectedStopDate: datetime };
        }

        // Othewise select start date
        return {
          ...state,
          selectedStartDate: datetime,
          selectedStopDate: undefined,
        };
      }

      return state;
    }
    case "SELECT_EVENT": {
      const { event } = action.payload;

      return {
        ...state,
        selectMode: "edit",
        selectedStartDate: event.start,
        selectedStopDate: event.stop,
      };
    }
    case "TOGGLE_SELECT_MODE": {
      if (!!state.selectMode) {
        return {
          ...state,
          selectMode: undefined,
          selectedStartDate: undefined,
          selectedStopDate: undefined,
        };
      }
      return { ...state, selectMode: "add" };
    }
    case "SET_SELECTED_DATE": {
      const { datetime } = action.payload;

      if (action.payload.type === "START") {
        return { ...state, selectedStartDate: datetime };
      }
      if (state.selectedStartDate && state.selectedStartDate > datetime) {
        return {
          ...state,
          selectedStartDate: datetime,
          selectedStopDate: datetime,
        };
      }
      return { ...state, selectedStopDate: action.payload.datetime };
    }
    default:
      return state;
  }
}

const SelectionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const selectDate = React.useCallback((datetime: number) => {
    dispatch({ type: "SELECT_DATE", payload: { datetime } });
  }, []);

  const selectEvent = React.useCallback((event: AppEvent) => {
    dispatch({ type: "SELECT_EVENT", payload: { event } });
  }, []);

  const setSelectedStartDate = React.useCallback((datetime: number) => {
    dispatch({
      type: "SET_SELECTED_DATE",
      payload: { datetime, type: "START" },
    });
  }, []);

  const setSelectedStopDate = React.useCallback((datetime: number) => {
    dispatch({
      type: "SET_SELECTED_DATE",
      payload: { datetime, type: "STOP" },
    });
  }, []);

  const toggleSelectMode = React.useCallback(() => {
    dispatch({ type: "TOGGLE_SELECT_MODE" });
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        ...state,
        setSelectedStartDate,
        setSelectedStopDate,
        selectDate,
        selectEvent,
        toggleSelectMode,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export default SelectionProvider;
