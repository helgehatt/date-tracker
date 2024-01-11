import React from "react";
import AppSettings from "../helpers/AppSettings";

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

export const initialState: State = {
  referenceDate: new Date(Date.today()).ceil(),
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

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "INITIAL_LOAD": {
      const { categories, categoryId } = action.payload;
      let activeCategoryId = categoryId;
      if (categoryId === null && categories.length) {
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
};

export const createActions = (dispatch: React.Dispatch<Action>) => ({
  setReferenceDate: (date: Date) => {
    dispatch({ type: "SET_REFERENCE_DATE", payload: { date } });
  },
  activateCategory: (categoryId: number | null) => {
    if (categoryId) {
      AppSettings.setActiveCategory(categoryId);
    } else {
      AppSettings.removeActiveCategory();
    }
    dispatch({ type: "ACTIVATE_CATEGORY", payload: { categoryId } });
  },
  activateLimit: (limitId: number | null) => {
    dispatch({ type: "ACTIVATE_LIMIT", payload: { limitId } });
  },
  setCategories: (categories: AppCategory[]) => {
    dispatch({ type: "LOAD_CATEGORIES", payload: { categories } });
  },
  setEvents: (events: AppEvent[]) => {
    dispatch({ type: "LOAD_EVENTS", payload: { events } });
  },
  setLimits: (limits: AppLimit[]) => {
    dispatch({ type: "LOAD_LIMITS", payload: { limits } });
  },
});

export default {
  initialState,
  reducer,
  createActions,
};
