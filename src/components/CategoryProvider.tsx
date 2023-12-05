import React from "react";
import AppDatabase, {
  AppCategory,
  AppEvent,
  AppTracker,
} from "../helpers/AppDatabase";
import AppSettings from "../helpers/AppSettings";

const db = new AppDatabase();

type State = {
  categories: AppCategory[];
  events: AppEvent[];
  eventDates: Record<number, AppEvent>;
  trackers: AppTracker[];
  selectedCategory: AppCategory | undefined;
};

type Action =
  | { type: "SELECT_CATEGORY"; payload: { id: number } }
  | { type: "LOAD_CATEGORIES"; payload: { categories: AppCategory[] } }
  | { type: "LOAD_EVENTS"; payload: { events: AppEvent[] } }
  | { type: "LOAD_TRACKERS"; payload: { trackers: AppTracker[] } };

type Context = State & {
  selectCategory(id: number): void;
  addEvent(start: number, stop: number): void;
  editEvent(event: AppEvent): void;
  deleteEvent(event: AppEvent): void;
};

const initialState: State = {
  categories: [],
  events: [],
  eventDates: {},
  trackers: [],
  selectedCategory: undefined,
};

export const CategoryContext = React.createContext<Context>({
  ...initialState,
  selectCategory: () => undefined,
  addEvent: () => undefined,
  editEvent: () => undefined,
  deleteEvent: () => undefined,
});

function getEventDates(events: AppEvent[]) {
  const obj = {} as Record<number, AppEvent>;

  for (const event of events) {
    for (const date of Date.range(event.start_date, event.stop_date)) {
      obj[date] = event;
    }
  }

  return obj;
}

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
      const { events } = action.payload;
      return { ...state, events, eventDates: getEventDates(events) };
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

  const selectCategory = React.useCallback((id: number) => {
    AppSettings.setSelectedCategory(id);
    dispatch({ type: "SELECT_CATEGORY", payload: { id } });
  }, []);

  const setCategories = React.useCallback((categories: AppCategory[]) => {
    dispatch({ type: "LOAD_CATEGORIES", payload: { categories } });
  }, []);

  const setEvents = React.useCallback((events: AppEvent[]) => {
    dispatch({ type: "LOAD_EVENTS", payload: { events } });
  }, []);

  const setTrackers = React.useCallback((trackers: AppTracker[]) => {
    dispatch({ type: "LOAD_TRACKERS", payload: { trackers } });
  }, []);

  const addEvent = React.useCallback(
    (start: number, stop: number) => {
      if (state.selectedCategory) {
        const { category_id } = state.selectedCategory;
        db.insertEvent(category_id, start, stop).then(setEvents);
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
      db.loadEvents(state.selectedCategory.category_id).then(setEvents);
      db.loadTrackers(state.selectedCategory.category_id).then(setTrackers);
    }
  }, [setEvents, setTrackers, state.selectedCategory]);

  return (
    <CategoryContext.Provider
      value={{
        ...state,
        selectCategory,
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
