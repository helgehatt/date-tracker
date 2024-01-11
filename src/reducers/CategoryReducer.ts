import React from "react";

type State = {
  mode: "view" | "add" | "edit";
  categoryId: number | null;
  name: string;
  color: string;
};

type Action =
  | { type: "SET_MODE"; payload: { mode: State["mode"] } }
  | { type: "SET_NAME"; payload: { name: string } }
  | { type: "SET_COLOR"; payload: { color: string } }
  | { type: "SELECT_CATEGORY"; payload: { category: AppCategory } };

const generateRandomColor = () => {
  return `hsla(${Math.random() * 360}, 100%, 50%, 1)`;
};

export const initialState: State = {
  mode: "view",
  categoryId: null,
  name: "",
  color: generateRandomColor(),
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_MODE": {
      const { mode } = action.payload;

      if (mode === "add") {
        return {
          ...state,
          mode,
          name: "",
          color: generateRandomColor(),
        };
      }

      if (mode === "view") {
        return { ...state, mode, categoryId: null };
      }

      return { ...state, mode };
    }
    case "SET_NAME": {
      return { ...state, name: action.payload.name };
    }
    case "SET_COLOR": {
      return { ...state, color: action.payload.color };
    }
    case "SELECT_CATEGORY": {
      const { category } = action.payload;
      return {
        ...state,
        mode: "edit",
        categoryId: category.categoryId,
        name: category.name,
        color: category.color,
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
  setName: (name: string) => {
    dispatch({ type: "SET_NAME", payload: { name } });
  },
  toggleColor: () => {
    dispatch({ type: "SET_COLOR", payload: { color: generateRandomColor() } });
  },
  selectCategory: (category: AppCategory) => {
    dispatch({ type: "SELECT_CATEGORY", payload: { category } });
  },
});

export default {
  initialState,
  reducer,
  createActions,
};
