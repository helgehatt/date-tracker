import React from "react";
import { initialState } from "../reducers/AppDataReducer";

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

const AppDataContext = React.createContext<Context>({
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

export default AppDataContext;
