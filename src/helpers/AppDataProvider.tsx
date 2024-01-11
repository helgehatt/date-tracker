import React from "react";
import * as SplashScreen from "expo-splash-screen";
import AppDatabase from "./AppDatabase";
import AppSettings from "./AppSettings";
import {
  initialState,
  reducer,
  createActions,
} from "../reducers/AppDataReducer";

// Keep the splash screen visible while the database initializes
SplashScreen.preventAutoHideAsync();
const db = new AppDatabase();

type Context = typeof initialState & {
  setReferenceDate(date: Date): void;
  activateCategory(categoryId: number | null): void;
  activateLimit(limitId: number | null): void;
  addCategory(category: Omit<AppCategory, "categoryId">): void;
  editCategory(category: AppCategory): void;
  deleteCategory(categoryId: number): void;
  addEvent(event: Omit<AppEvent, "eventId">): void;
  editEvent(event: AppEvent): void;
  deleteEvent(eventId: number, categoryId: number): void;
  addLimit(limit: Omit<AppLimit, "limitId">): void;
  editLimit(limit: AppLimit): void;
  deleteLimit(limitId: number, categoryId: number): void;
};

export const AppDataContext = React.createContext<Context>({
  ...initialState,
  setReferenceDate: () => undefined,
  activateCategory: () => undefined,
  activateLimit: () => undefined,
  addCategory: () => undefined,
  editCategory: () => undefined,
  deleteCategory: () => undefined,
  addEvent: () => undefined,
  editEvent: () => undefined,
  deleteEvent: () => undefined,
  addLimit: () => undefined,
  editLimit: () => undefined,
  deleteLimit: () => undefined,
});

const AppDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const actions = React.useMemo(() => createActions(dispatch), []);

  const addCategory = React.useCallback(
    (category: Omit<AppCategory, "categoryId">) => {
      db.insertCategory(category)
        .then(() => db.loadCategories())
        .then(actions.setCategories);
    },
    [actions.setCategories]
  );

  const editCategory = React.useCallback(
    (category: AppCategory) => {
      db.updateCategory(category)
        .then(() => db.loadCategories())
        .then(actions.setCategories);
    },
    [actions.setCategories]
  );

  const deleteCategory = React.useCallback(
    (categoryId: number) => {
      db.deleteCategory(categoryId)
        .then(() => db.loadCategories())
        .then(actions.setCategories);
    },
    [actions.setCategories]
  );

  const addEvent = React.useCallback(
    (event: Omit<AppEvent, "eventId">) => {
      db.insertEvent(event).then(() =>
        db.loadEvents(event.categoryId).then(actions.setEvents)
      );
    },
    [actions.setEvents]
  );

  const editEvent = React.useCallback(
    (event: AppEvent) => {
      db.updateEvent(event).then(() =>
        db.loadEvents(event.categoryId).then(actions.setEvents)
      );
    },
    [actions.setEvents]
  );

  const deleteEvent = React.useCallback(
    (eventId: number, categoryId: number) => {
      db.deleteEvent(eventId).then(() =>
        db.loadEvents(categoryId).then(actions.setEvents)
      );
    },
    [actions.setEvents]
  );

  const addLimit = React.useCallback(
    (limit: Omit<AppLimit, "limitId">) => {
      db.insertLimit(limit).then(() =>
        db.loadLimits(limit.categoryId).then(actions.setLimits)
      );
    },
    [actions.setLimits]
  );

  const editLimit = React.useCallback(
    (limit: AppLimit) => {
      db.updateLimit(limit).then(() =>
        db.loadLimits(limit.categoryId).then(actions.setLimits)
      );
    },
    [actions.setLimits]
  );

  const deleteLimit = React.useCallback(
    (limitId: number, categoryId: number) => {
      db.deleteLimit(limitId).then(() =>
        db.loadLimits(categoryId).then(actions.setLimits)
      );
    },
    [actions.setLimits]
  );

  React.useEffect(() => {
    db.init()
      .then(() => db.loadCategories())
      .then(async (categories) => {
        const categoryId = await AppSettings.getActiveCategory();
        dispatch({ type: "INITIAL_LOAD", payload: { categories, categoryId } });
      })
      .catch((error) => console.error(error.message))
      .then(() => SplashScreen.hideAsync());
  }, []);

  React.useEffect(() => {
    if (state.activeCategoryId) {
      db.loadEvents(state.activeCategoryId).then(actions.setEvents);
      db.loadLimits(state.activeCategoryId).then(actions.setLimits);
    }
  }, [actions.setEvents, actions.setLimits, state.activeCategoryId]);

  return (
    <AppDataContext.Provider
      value={{
        ...state,
        setReferenceDate: actions.setReferenceDate,
        activateCategory: actions.activateCategory,
        activateLimit: actions.activateLimit,
        addCategory,
        editCategory,
        deleteCategory,
        addEvent,
        editEvent,
        deleteEvent,
        addLimit,
        editLimit,
        deleteLimit,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataProvider;
