import React from "react";
import AppDatabase, {
  AppCategory,
  AppEvent,
  AppLimit,
  AppLimitWithoutId,
  getInterval,
} from "../helpers/AppDatabase";
import AppSettings from "../helpers/AppSettings";
import { TODAY } from "../constants";

const db = new AppDatabase();

type State = {
  selectedCategory: AppCategory | undefined;
  categories: AppCategory[];
  events: AppEvent[];
  limits: AppLimit[];
  limitCounts: Record<number, number>;
};

type Action =
  | {
      type: "INITIAL_LOAD";
      payload: { categories: AppCategory[]; categoryId: number | undefined };
    }
  | { type: "SELECT_CATEGORY"; payload: { categoryId: number | undefined } }
  | { type: "EDIT_CATEGORY"; payload: { categoryId: number } }
  | { type: "DELETE_CATEGORY"; payload: { categoryId: number } }
  | { type: "LOAD_CATEGORIES"; payload: { categories: AppCategory[] } }
  | { type: "LOAD_EVENTS"; payload: { events: AppEvent[] } }
  | { type: "LOAD_LIMITS"; payload: { limits: AppLimit[] } };

type Context = State & {
  selectCategory(id: number | undefined): void;
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
  categories: [],
  selectedCategory: undefined,
  events: [],
  limits: [],
  limitCounts: {},
};

export const CategoryContext = React.createContext<Context>({
  ...initialState,
  selectCategory: () => undefined,
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

function getLimitCounts(events: AppEvent[], limits: AppLimit[]) {
  const dates = new Set<number>();

  for (const event of events) {
    for (const date of Date.range(event.startDate, event.stopDate)) {
      dates.add(date);
    }
  }

  const counts: Record<number, number> = {};

  for (const limit of limits) {
    const interval = getInterval(limit, TODAY);

    counts[limit.limitId] = interval.filter([...dates]).length;
  }

  return counts;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INITIAL_LOAD": {
      const { categories, categoryId } = action.payload;
      if (categoryId === undefined && categories.length) {
        return { ...state, categories, selectedCategory: categories[0] };
      }
      const selectedCategory = categories.find(
        (category) => category.categoryId == categoryId
      );
      return { ...state, categories, selectedCategory };
    }
    case "SELECT_CATEGORY": {
      const { categoryId } = action.payload;
      if (categoryId === undefined) {
        return { ...initialState, categories: state.categories };
      }
      const selectedCategory = state.categories.find(
        (category) => category.categoryId == categoryId
      );
      return { ...state, selectedCategory };
    }
    case "EDIT_CATEGORY": {
      const { categoryId } = action.payload;
      // Force state update if the selected category has changed
      if (state.selectedCategory?.categoryId === categoryId) {
        return { ...state };
      }
      return state;
    }
    case "DELETE_CATEGORY": {
      const { categoryId } = action.payload;
      if (state.selectedCategory?.categoryId === categoryId) {
        return { ...initialState, categories: state.categories };
      }
      return state;
    }
    case "LOAD_CATEGORIES": {
      const { categories } = action.payload;
      return { ...state, categories };
    }
    case "LOAD_EVENTS": {
      const { events } = action.payload;
      const limitCounts = getLimitCounts(events, state.limits);
      return { ...state, events, limitCounts };
    }
    case "LOAD_LIMITS": {
      const { limits } = action.payload;
      const limitCounts = getLimitCounts(state.events, limits);
      return { ...state, limits, limitCounts };
    }
    default:
      return state;
  }
}

const CategoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const selectCategory = React.useCallback((categoryId: number | undefined) => {
    AppSettings.setSelectedCategory(categoryId);
    dispatch({ type: "SELECT_CATEGORY", payload: { categoryId } });
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
      const { categoryId } = category;
      db.updateCategory(category)
        .then(() => db.loadCategories())
        .then(setCategories)
        .then(() =>
          dispatch({ type: "EDIT_CATEGORY", payload: { categoryId } })
        );
    },
    [setCategories]
  );

  const deleteCategory = React.useCallback(
    (categoryId: number) => {
      db.deleteCategory(categoryId)
        .then(() => db.loadCategories())
        .then(setCategories)
        .then(() =>
          dispatch({ type: "DELETE_CATEGORY", payload: { categoryId } })
        );
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
    (limit: AppLimitWithoutId) => {
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
    AppSettings.getHasInitialized()
      .then(async (hasInitialized) => {
        if (!hasInitialized) {
          await AppSettings.setHasInitialized(true);
          console.log("DB: Initializing...");
          try {
            const categories = await db.init();
            console.log("DB: Initialized");
            return categories;
          } catch (error) {
            console.error(`DB: ${JSON.stringify(error)}`);
            await AppSettings.setHasInitialized(false);
            return [];
          }
        } else {
          return await db.loadCategories();
        }
      })
      .then(async (categories) => {
        const categoryId = await AppSettings.getSelectedCategory();
        dispatch({ type: "INITIAL_LOAD", payload: { categories, categoryId } });
      });
  }, []);

  React.useEffect(() => {
    if (state.selectedCategory) {
      db.loadEvents(state.selectedCategory.categoryId).then(setEvents);
      db.loadLimits(state.selectedCategory.categoryId).then(setLimits);
    }
  }, [setEvents, setLimits, state.selectedCategory]);

  return (
    <CategoryContext.Provider
      value={{
        ...state,
        selectCategory,
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
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;
