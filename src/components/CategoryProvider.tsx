import React from "react";
import { AppCategory } from "../helpers/ApplicationStorage";
import { COLORS } from "../constants";

type State = {
  categories: AppCategory[];
  selectedCategory: string;
};

type Action =
  | { type: "SELECT_CATEGORY"; payload: { id: string } }
  | { type: "LOAD_CATEGORIES"; payload: { categories: AppCategory[] } }
  | { type: "ADD_CATEGORY"; payload: { category: AppCategory } }
  | { type: "EDIT_CATEGORY"; payload: { category: AppCategory } }
  | { type: "DELETE_CATEGORY"; payload: { id: string } };

type Context = State & {
  selectCategory(id: string): void;
};

const initialState: State = {
  categories: [
    {
      id: "0164cba7-1dfb-4d6f-a47a-c6920c1b391c",
      title: "Norge",
      color: COLORS.primary,
    },
    {
      id: "4c7606ba-74d1-460e-bdf6-2a3cebcacd67",
      title: "Danmark",
      color: "red",
    },
    {
      id: "68dc19e7-17b1-467f-8e17-96c6a321c433",
      title: "Sverige",
      color: "blue",
    },
  ],
  selectedCategory: "68dc19e7-17b1-467f-8e17-96c6a321c433",
};

export const CategoryContext = React.createContext<Context>({
  ...initialState,
  selectCategory: () => undefined,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_CATEGORY": {
      return { ...state, selectedCategory: action.payload.id };
    }
    default:
      return state;
  }
}

const CategoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const selectCategory = React.useCallback((id: string) => {
    dispatch({ type: "SELECT_CATEGORY", payload: { id } });
  }, []);

  return (
    <CategoryContext.Provider value={{ ...state, selectCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;
