import React from "react";

type State = {
  mode: "none" | "add" | "edit";
  modal: "none" | "delete";
  limitId: number | null;
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
  | { type: "SET_MODAL"; payload: { modal: State["modal"] } }
  | { type: "ON_CHANGE"; payload: { key: keyof State["input"]; value: string } }
  | { type: "SELECT_LIMIT"; payload: { limit: AppLimit } };

export const initialState: State = {
  mode: "none",
  modal: "none",
  limitId: null,
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
        return { ...state, mode, limitId: null };
      }

      return { ...state, mode };
    }
    case "SET_MODAL": {
      return { ...state, modal: action.payload.modal };
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
        limitId: limit.limitId,
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
    default: {
      return state;
    }
  }
};

export const createActions = (dispatch: React.Dispatch<Action>) => ({
  setMode: (mode: State["mode"]) => {
    dispatch({ type: "SET_MODE", payload: { mode } });
  },
  setModal: (modal: State["modal"]) => {
    dispatch({ type: "SET_MODAL", payload: { modal } });
  },
  onChange: (key: keyof State["input"]) => (value: string) => {
    dispatch({ type: "ON_CHANGE", payload: { key, value } });
  },
  selectLimit: (limit: AppLimit) => {
    dispatch({ type: "SELECT_LIMIT", payload: { limit } });
  },
});

export default {
  initialState,
  reducer,
  createActions,
};
