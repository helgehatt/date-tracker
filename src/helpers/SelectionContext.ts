import React from "react";
import { AppEvent } from "./AppDatabase";

type Context = {
  eventsByDate: Record<number, AppEvent>;
  selectedEvent: AppEvent | null;
  selectedStartDate: number;
  selectedStopDate: number;
  selectDate: (date: number) => void;
};

const SelectionContext = React.createContext<Context>({
  eventsByDate: {},
  selectedEvent: null,
  selectedStartDate: NaN,
  selectedStopDate: NaN,
  selectDate: () => undefined,
});

export default SelectionContext;
