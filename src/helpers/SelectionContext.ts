import React from "react";

type Context = {
  selectedEvent: AppEvent | null;
  selectedStartDate: number;
  selectedStopDate: number;
  selectDate: (date: number, eventsByDate: Record<number, AppEvent>) => void;
};

const SelectionContext = React.createContext<Context>({
  selectedEvent: null,
  selectedStartDate: NaN,
  selectedStopDate: NaN,
  selectDate: () => undefined,
});

export default SelectionContext;
