import React from "react";

type State = {
  editMode: boolean;
  selectedStartDate: number | undefined;
  selectedStopDate: number | undefined;
};

type Action =
  | {
      type: "SELECT_DATE";
      payload: { datetime: number };
    }
  | {
      type: "TOGGLE_EDIT_MODE";
    }
  | {
      type: "SET_SELECTED_DATE";
      payload: { datetime: number; type: "START" | "STOP" };
    };

type Context = State & {
  setSelectedStartDate: (datetime: number) => void;
  setSelectedStopDate: (datetime: number) => void;
  selectDate: (datetime: number) => void;
  toggleEditMode: () => void;
};

const initialState: State = {
  editMode: false,
  selectedStartDate: undefined,
  selectedStopDate: undefined,
};

export const SelectionContext = React.createContext<Context>({
  ...initialState,
  setSelectedStartDate: () => undefined,
  setSelectedStopDate: () => undefined,
  selectDate: () => undefined,
  toggleEditMode: () => undefined,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_DATE":
      if (!state.editMode) {
        return state;
      }
      if (state.selectedStartDate === undefined) {
        return { ...state, selectedStartDate: action.payload.datetime };
      }
      if (state.selectedStartDate > action.payload.datetime) {
        return { ...state, selectedStartDate: action.payload.datetime };
      }
      return { ...state, selectedStopDate: action.payload.datetime };
    case "TOGGLE_EDIT_MODE":
      if (state.editMode) {
        return {
          ...state,
          editMode: false,
          selectedStartDate: undefined,
          selectedStopDate: undefined,
        };
      }
      return { ...state, editMode: true };
    case "SET_SELECTED_DATE":
      if (action.payload.type === "START") {
        return { ...state, selectedStartDate: action.payload.datetime };
      }
      return { ...state, selectedStopDate: action.payload.datetime };
    default:
      return state;
  }
}

const SelectionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const selectDate = React.useCallback((datetime: number) => {
    dispatch({ type: "SELECT_DATE", payload: { datetime } });
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

  const toggleEditMode = React.useCallback(() => {
    dispatch({ type: "TOGGLE_EDIT_MODE" });
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        ...state,
        setSelectedStartDate,
        setSelectedStopDate,
        selectDate,
        toggleEditMode,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export default SelectionProvider;
