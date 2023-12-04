import React from "react";
import AppDatabase, {
  AppCategory,
  AppEvent,
  AppTracker,
} from "../helpers/AppDatabase";
import AppSettings from "../helpers/AppSettings";
import { SQLStatementCallback } from "expo-sqlite";

const db = new AppDatabase();

type State = {
  categories: AppCategory[];
  events: AppEvent[];
  trackers: AppTracker[];
  selectedCategory: AppCategory | undefined;
};

type Action =
  | { type: "SELECT_CATEGORY"; payload: { id: number } }
  | { type: "LOAD_CATEGORIES"; payload: { categories: AppCategory[] } }
  | { type: "ADD_CATEGORY"; payload: { category: AppCategory } }
  | { type: "EDIT_CATEGORY"; payload: { category: AppCategory } }
  | { type: "DELETE_CATEGORY"; payload: { id: number } }
  | { type: "LOAD_EVENTS"; payload: { events: AppEvent[] } }
  | { type: "LOAD_TRACKERS"; payload: { trackers: AppTracker[] } };

type Context = State & {
  selectCategory(id: number): void;
};

const initialState: State = {
  categories: [],
  events: [],
  trackers: [],
  selectedCategory: undefined,
};

export const CategoryContext = React.createContext<Context>({
  ...initialState,
  selectCategory: () => undefined,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_CATEGORY": {
      const selectedCategory = state.categories.find(
        (category) => category.category_id == action.payload.id
      );
      return { ...state, selectedCategory };
    }
    case "LOAD_CATEGORIES": {
      return { ...state, categories: action.payload.categories };
    }
    case "LOAD_EVENTS": {
      return { ...state, events: action.payload.events };
    }
    case "LOAD_TRACKERS": {
      return { ...state, trackers: action.payload.trackers };
    }
    default:
      return state;
  }
}

const CategoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const setCategories: SQLStatementCallback = React.useCallback(
    (tx, result) => {
      dispatch({
        type: "LOAD_CATEGORIES",
        payload: { categories: result.rows._array },
      });
    },
    []
  );

  const setEvents: SQLStatementCallback = React.useCallback((tx, result) => {
    dispatch({ type: "LOAD_EVENTS", payload: { events: result.rows._array } });
  }, []);

  const setTrackers: SQLStatementCallback = React.useCallback((tx, result) => {
    dispatch({
      type: "LOAD_TRACKERS",
      payload: { trackers: result.rows._array },
    });
  }, []);

  React.useEffect(() => {
    AppSettings.getHasInitialized().then((hasInitialized) => {
      if (!hasInitialized) {
        AppSettings.setHasInitialized(true).then(() => {
          db.init(setCategories);
        });
      } else {
        db.loadCategories(setCategories);
      }
    });
  }, []);

  React.useEffect(() => {
    if (state.selectedCategory === undefined && state.categories.length) {
      AppSettings.getSelectedCategory().then((selectedCategory) => {
        if (selectedCategory) {
          selectCategory(selectedCategory);
        }
      });
    }
  }, [state.selectedCategory, state.categories]);

  React.useEffect(() => {
    if (state.selectedCategory) {
      db.loadEvents(state.selectedCategory.category_id, setEvents);
      db.loadTrackers(state.selectedCategory.category_id, setTrackers);
    }
  }, [state.selectedCategory]);

  const selectCategory = React.useCallback((id: number) => {
    AppSettings.setSelectedCategory(id);
    dispatch({ type: "SELECT_CATEGORY", payload: { id } });
  }, []);

  return (
    <CategoryContext.Provider value={{ ...state, selectCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;
