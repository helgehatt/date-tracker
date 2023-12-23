import React from "react";
import * as SplashScreen from "expo-splash-screen";
import AppDatabase from "./AppDatabase";
import AppSettings from "./AppSettings";
import { TODAY } from "../constants";

// Keep the splash screen visible while the database initializes
SplashScreen.preventAutoHideAsync();
const db = new AppDatabase();

type State = {
  referenceDate: Date;
  activeCategoryId: number | null;
  activeLimitId: number | null;
  categories: AppCategory[];
  categoriesById: Record<number, AppCategory>;
  events: AppEvent[];
  eventsById: Record<number, AppEvent>;
  eventsByDate: Record<number, AppEvent>;
  eventDates: number[];
  limits: AppLimit[];
  limitsById: Record<number, AppLimit>;
};

type Action =
  | {
      type: "INITIAL_LOAD";
      payload: { categories: AppCategory[]; categoryId: number | null };
    }
  | { type: "SET_REFERENCE_DATE"; payload: { date: Date } }
  | { type: "ACTIVATE_CATEGORY"; payload: { categoryId: number | null } }
  | { type: "ACTIVATE_LIMIT"; payload: { limitId: number | null } }
  | { type: "LOAD_CATEGORIES"; payload: { categories: AppCategory[] } }
  | { type: "LOAD_EVENTS"; payload: { events: AppEvent[] } }
  | { type: "LOAD_LIMITS"; payload: { limits: AppLimit[] } };

type Context = State & {
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

const initialState: State = {
  referenceDate: new Date(TODAY).ceil(),
  activeCategoryId: null,
  activeLimitId: null,
  categories: [],
  categoriesById: {},
  events: [],
  eventsById: {},
  eventsByDate: {},
  eventDates: [],
  limits: [],
  limitsById: {},
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

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INITIAL_LOAD": {
      const { categories, categoryId } = action.payload;
      let activeCategoryId = categoryId;
      if (categoryId === undefined && categories.length) {
        activeCategoryId = categories[0].categoryId;
      }
      return {
        ...state,
        categories,
        categoriesById: categories.toObject("categoryId"),
        activeCategoryId,
      };
    }
    case "SET_REFERENCE_DATE": {
      return { ...state, referenceDate: action.payload.date };
    }
    case "ACTIVATE_CATEGORY": {
      const { categoryId } = action.payload;
      if (categoryId) {
        return { ...state, activeCategoryId: categoryId };
      }
      const { categories, categoriesById } = state;
      return { ...initialState, categories, categoriesById };
    }
    case "ACTIVATE_LIMIT": {
      return { ...state, activeLimitId: action.payload.limitId };
    }
    case "LOAD_CATEGORIES": {
      const { categories } = action.payload;
      const categoriesById = categories.toObject("categoryId");
      if (
        state.activeCategoryId &&
        !(state.activeCategoryId in categoriesById)
      ) {
        return { ...state, categories, categoriesById, activeCategoryId: null };
      }
      return { ...state, categories, categoriesById };
    }
    case "LOAD_EVENTS": {
      const { events } = action.payload;
      const eventsById = events.toObject("eventId");

      const eventsByDate: Record<number, AppEvent> = {};
      for (const event of events) {
        for (const date of Date.range(event.startDate, event.stopDate)) {
          eventsByDate[date] = event;
        }
      }
      const eventDates = Object.keys(eventsByDate).map(Number).sort();

      return { ...state, events, eventsById, eventsByDate, eventDates };
    }
    case "LOAD_LIMITS": {
      const { limits } = action.payload;
      const limitsById = limits.toObject("limitId");
      return { ...state, limits, limitsById };
    }
    default:
      return state;
  }
}

const AppDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const setReferenceDate = React.useCallback((date: Date) => {
    dispatch({ type: "SET_REFERENCE_DATE", payload: { date } });
  }, []);

  const activateCategory = React.useCallback((categoryId: number | null) => {
    if (categoryId) {
      AppSettings.setActiveCategory(categoryId);
    } else {
      AppSettings.removeActiveCategory();
    }
    dispatch({ type: "ACTIVATE_CATEGORY", payload: { categoryId } });
  }, []);

  const activateLimit = React.useCallback((limitId: number | null) => {
    dispatch({ type: "ACTIVATE_LIMIT", payload: { limitId } });
  }, []);

  const setCategories = React.useCallback((categories: AppCategory[]) => {
    dispatch({ type: "LOAD_CATEGORIES", payload: { categories } });
  }, []);

  const setEvents = React.useCallback((events: AppEvent[]) => {
    dispatch({ type: "LOAD_EVENTS", payload: { events } });
  }, []);

  const setLimits = React.useCallback((limits: AppLimit[]) => {
    dispatch({ type: "LOAD_LIMITS", payload: { limits } });
  }, []);

  const addCategory = React.useCallback(
    (category: Omit<AppCategory, "categoryId">) => {
      db.insertCategory(category)
        .then(() => db.loadCategories())
        .then(setCategories);
    },
    [setCategories]
  );

  const editCategory = React.useCallback(
    (category: AppCategory) => {
      db.updateCategory(category)
        .then(() => db.loadCategories())
        .then(setCategories);
    },
    [setCategories]
  );

  const deleteCategory = React.useCallback(
    (categoryId: number) => {
      db.deleteCategory(categoryId)
        .then(() => db.loadCategories())
        .then(setCategories);
    },
    [setCategories]
  );

  const addEvent = React.useCallback(
    (event: Omit<AppEvent, "eventId">) => {
      db.insertEvent(event).then(() =>
        db.loadEvents(event.categoryId).then(setEvents)
      );
    },
    [setEvents]
  );

  const editEvent = React.useCallback(
    (event: AppEvent) => {
      db.updateEvent(event).then(() =>
        db.loadEvents(event.categoryId).then(setEvents)
      );
    },
    [setEvents]
  );

  const deleteEvent = React.useCallback(
    (eventId: number, categoryId: number) => {
      db.deleteEvent(eventId).then(() =>
        db.loadEvents(categoryId).then(setEvents)
      );
    },
    [setEvents]
  );

  const addLimit = React.useCallback(
    (limit: Omit<AppLimit, "limitId">) => {
      db.insertLimit(limit).then(() =>
        db.loadLimits(limit.categoryId).then(setLimits)
      );
    },
    [setLimits]
  );

  const editLimit = React.useCallback(
    (limit: AppLimit) => {
      db.updateLimit(limit).then(() =>
        db.loadLimits(limit.categoryId).then(setLimits)
      );
    },
    [setLimits]
  );

  const deleteLimit = React.useCallback(
    (limitId: number, categoryId: number) => {
      db.deleteLimit(limitId).then(() =>
        db.loadLimits(categoryId).then(setLimits)
      );
    },
    [setLimits]
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
      db.loadEvents(state.activeCategoryId).then(setEvents);
      db.loadLimits(state.activeCategoryId).then(setLimits);
    }
  }, [setEvents, setLimits, state.activeCategoryId]);

  return (
    <AppDataContext.Provider
      value={{
        ...state,
        setReferenceDate,
        activateCategory,
        activateLimit,
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
