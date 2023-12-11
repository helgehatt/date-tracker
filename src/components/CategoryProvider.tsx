import React from "react";
import AppDatabase, {
  AppCategory,
  AppEvent,
  AppLimit,
} from "../helpers/AppDatabase";
import AppSettings from "../helpers/AppSettings";

const db = new AppDatabase();

type EventCount = { date: string; value: number; label?: string };

type State = {
  categories: AppCategory[];
  categoryIds: Set<number>;
  events: AppEvent[];
  eventDates: Record<number, AppEvent>;
  limits: AppLimit[];
  eventCountsByLimit: Record<number, EventCount[]>;
  selectedCategory: AppCategory | undefined;
};

type Action =
  | { type: "SELECT_CATEGORY"; payload: { categoryId: number | undefined } }
  | { type: "LOAD_CATEGORIES"; payload: { categories: AppCategory[] } }
  | { type: "LOAD_EVENTS"; payload: { events: AppEvent[] } }
  | { type: "LOAD_LIMITS"; payload: { limits: AppLimit[] } };

type Context = State & {
  selectCategory(id: number | undefined): void;
  addCategory(name: string, color: string): void;
  editCategory(category: AppCategory): void;
  deleteCategory(id: number): void;
  addEvent(start: number, stop: number): void;
  editEvent(event: AppEvent): void;
  deleteEvent(event: AppEvent): void;
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

class Interval<T> {
  constructor(private start: T, private stop: T) {}

  contains(x: T) {
    return this.start <= x && x <= this.stop;
  }
}

class DatetimeIntervalConstructor {
  constructor(
    private fn: (year: number, month: number, day: number) => Interval<number>
  ) {}

  new(datetime: number) {
    const { year, month, date: day } = new Date(datetime).getComponents();
    return this.fn(year, month, day);
  }
}

function getEventCountsByLimit(dates: number[], limits: AppLimit[]) {
  const eventCountsByLimit: Record<number, EventCount[]> = {};

  for (const l of limits) {
    const constructor = new DatetimeIntervalConstructor(
      (y, m, d) =>
        new Interval(
          Date.UTC(
            y * l.fromYearRelative + l.fromYearOffset,
            m * l.fromMonthRelative + l.fromMonthOffset,
            d * l.fromDayRelative + l.fromDayOffset
          ),
          Date.UTC(y, m, d)
        )
    );

    eventCountsByLimit[l.limitId] = [];

    for (const date of Date.range(Math.min(...dates), Math.max(...dates))) {
      const interval = constructor.new(date);

      const value = dates.filter((x) => interval.contains(x)).length;

      eventCountsByLimit[l.limitId].push({
        date: new Date(date).toISODateString(),
        value,
        label:
          new Date(date).getDate() == 1 ? getLabelFromDate(date) : undefined,
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
    (name: string, color: string) => {
      db.insertCategory(name, color).then(setCategories);
    },
    [setCategories]
  );

  const editCategory = React.useCallback(
    (category: AppCategory) => {
      db.updateCategory(category).then((categories) => {
        setCategories(categories);
        if (state.selectedCategory?.categoryId === category.categoryId) {
          selectCategory(category.categoryId);
        }
      });
    },
    [setCategories, selectCategory, state.selectedCategory?.categoryId]
  );

  const deleteCategory = React.useCallback(
    (categoryId: number) => {
      db.deleteCategory(categoryId).then((categories) => {
        setCategories(categories);
        if (state.selectedCategory?.categoryId === categoryId) {
          selectCategory(undefined);
        }
      });
    },
    [setCategories, selectCategory, state.selectedCategory?.categoryId]
  );

  const addEvent = React.useCallback(
    (start: number, stop: number) => {
      if (state.selectedCategory) {
        const { categoryId } = state.selectedCategory;
        db.insertEvent(categoryId, start, stop).then(setEvents);
      }
    },
    [setEvents, state.selectedCategory]
  );

  const editEvent = React.useCallback(
    (event: AppEvent) => {
      db.updateEvent(event).then(setEvents);
    },
    [setEvents]
  );

  const deleteEvent = React.useCallback(
    (event: AppEvent) => {
      db.deleteEvent(event).then(setEvents);
    },
    [setEvents]
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
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;
