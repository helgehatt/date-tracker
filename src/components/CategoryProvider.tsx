import React from "react";
import AppDatabase, {
  AppCategory,
  AppEvent,
  AppLimit,
  getInterval,
} from "../helpers/AppDatabase";
import AppSettings from "../helpers/AppSettings";

const db = new AppDatabase();

type EventCount = { date: string; value: number; label?: string };

type State = {
  selectedCategory: AppCategory | undefined;
  categories: AppCategory[];
  categoryIds: Set<number>;
  events: AppEvent[];
  eventDates: Record<number, AppEvent>;
  limits: AppLimit[];
  eventCountsByLimit: Record<number, EventCount[]>;
};

type Action =
  | { type: "SELECT_CATEGORY"; payload: { categoryId: number | undefined } }
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
  categoryIds: new Set(),
  selectedCategory: undefined,
  events: [],
  eventDates: {},
  limits: [],
  eventCountsByLimit: {},
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

function getEventDates(events: AppEvent[]) {
  const obj = {} as Record<number, AppEvent>;

  for (const event of events) {
    for (const date of Date.range(event.startDate, event.stopDate)) {
      obj[date] = event;
    }
  }

  return obj;
}

function getEventCountsByLimit(dates: number[], limits: AppLimit[]) {
  const eventCountsByLimit: Record<number, EventCount[]> = {};

  for (const l of limits) {
    eventCountsByLimit[l.limitId] = [];

    for (const date of dates) {
      const interval = getInterval(l, date);

      const value = interval.filter(dates).length;

      eventCountsByLimit[l.limitId].push({
        date: new Date(date).toISODateString(),
        value,
      });
    }
  }

  return eventCountsByLimit;
}

function getLabelFromDate(date: number | string) {
  const options = { month: "short", day: "numeric" } as const;
  return new Date(date).toLocaleDateString("en-gb", options);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_CATEGORY": {
      const { categoryId } = action.payload;
      if (categoryId === undefined) {
        return {
          ...state,
          selectedCategory: undefined,
          events: [],
          eventDates: {},
          limits: [],
        };
      }
      const selectedCategory = state.categories.find(
        (category) => category.categoryId == categoryId
      );
      return { ...state, selectedCategory };
    }
    case "LOAD_CATEGORIES": {
      const { categories } = action.payload;
      const categoryIds = new Set(categories.map((x) => x.categoryId));
      return { ...state, categories, categoryIds };
    }
    case "LOAD_EVENTS": {
      const { events } = action.payload;
      const eventDates = getEventDates(events);
      const datetimes = Object.keys(eventDates).map(Number);
      const eventCountsByLimit = getEventCountsByLimit(datetimes, state.limits);
      return { ...state, events, eventDates, eventCountsByLimit };
    }
    case "LOAD_LIMITS": {
      const { limits } = action.payload;
      const datetimes = Object.keys(state.eventDates).map(Number);
      const eventCountsByLimit = getEventCountsByLimit(datetimes, limits);
      return { ...state, limits, eventCountsByLimit };
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
      db.insertCategory(category.name, category.color)
        .then(() => db.loadCategories())
        .then(setCategories);
    },
    [setCategories]
  );

  const editCategory = React.useCallback(
    (category: AppCategory) => {
      db.updateCategory(category)
        .then(() => db.loadCategories())
        .then(setCategories)
        .then(() => {
          if (state.selectedCategory?.categoryId === category.categoryId) {
            selectCategory(category.categoryId);
          }
        });
    },
    [setCategories, selectCategory, state.selectedCategory?.categoryId]
  );

  const deleteCategory = React.useCallback(
    (categoryId: number) => {
      db.deleteCategory(categoryId)
        .then(() => db.loadCategories())
        .then(setCategories)
        .then(() => {
          if (state.selectedCategory?.categoryId === categoryId) {
            selectCategory(undefined);
          }
        });
    },
    [setCategories, selectCategory, state.selectedCategory?.categoryId]
  );

  const addEvent = React.useCallback(
    (event: Omit<AppEvent, "eventId">) => {
      db.insertEvent(event.categoryId, event.startDate, event.stopDate).then(
        () => db.loadEvents(event.categoryId).then(setEvents)
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
      db.insertLimit(
        limit.categoryId,
        limit.name,
        limit.value,
        limit.startOfYear,
        limit.startOfMonth,
        limit.yearOffset,
        limit.monthOffset,
        limit.dayOffset
      ).then(() => db.loadLimits(limit.categoryId).then(setLimits));
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
    AppSettings.getHasInitialized().then((hasInitialized) => {
      if (!hasInitialized) {
        AppSettings.setHasInitialized(true).then(() => {
          console.log("DB: Initializing...");
          db.init()
            .then(setCategories)
            .then(() => console.log("DB: Initialized"))
            .catch((error) => {
              console.error(`DB: ${error.message}`);
              AppSettings.setHasInitialized(false);
            });
        });
      } else {
        db.loadCategories().then(setCategories);
      }
    });
  }, [setCategories]);

  React.useEffect(() => {
    if (state.selectedCategory === undefined && state.categories.length) {
      AppSettings.getSelectedCategory().then((selectedCategory) => {
        if (selectedCategory) {
          selectCategory(selectedCategory);
        }
      });
    }
  }, [selectCategory, state.selectedCategory, state.categories]);

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
