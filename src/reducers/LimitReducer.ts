import React from "react";

type State = {
  mode: "none" | "add" | "edit";
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

type Action =
  | { type: "SET_MODE"; payload: { mode: State["mode"] } }
  | { type: "ON_CHANGE"; payload: { key: keyof State["input"]; value: string } }
  | { type: "SELECT_LIMIT"; payload: { limit: AppLimit } }
  | { type: "UPDATE_LIMIT"; payload: { limit: AppLimit } };

export const initialState: State = {
  mode: "none",
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

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_MODE": {
      const { mode } = action.payload;

      if (mode === "add") {
        return { ...state, mode, input: initialState.input };
      }

      if (mode === "none") {
        return { ...state, mode, selectedLimit: null };
      }

      return { ...state, mode };
    }
    case "ON_CHANGE": {
      const { key } = action.payload;
      let { value } = action.payload;

      if (key === "customStartDate" || key === "customStopDate") {
        value = Date.onChangeFormat(state.input[key], value);
      }

      return { ...state, input: { ...state.input, [key]: value } };
    }
    case "SELECT_LIMIT": {
      const { limit } = action.payload;
      return {
        ...state,
        mode: "edit",
        selectedLimit: limit,
        input: {
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
        },
      };
    }
    case "UPDATE_LIMIT": {
      return { ...state, selectedLimit: action.payload.limit };
    }
    default: {
      return state;
    }
  }
};

export const createActions = (dispatch: React.Dispatch<Action>) => ({
  setMode: (mode: State["mode"]) => {
    dispatch({ type: "SET_MODE", payload: { mode } });
  },
  onChange: (key: keyof State["input"]) => (value: string) => {
    dispatch({ type: "ON_CHANGE", payload: { key, value } });
  },
  selectLimit: (limit: AppLimit) => {
    dispatch({ type: "SELECT_LIMIT", payload: { limit } });
  },
  updateLimit: (limit: AppLimit) => {
    dispatch({ type: "UPDATE_LIMIT", payload: { limit } });
  },
});

export default {
  initialState,
  reducer,
  createActions,
};
