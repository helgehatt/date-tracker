import React from "react";
import SelectionManager from "./SelectionManager";

interface SelectedDatesContext {
  selectionManager: SelectionManager;
  toggleDate: (date: Date) => void;
  setReferenceDate: (date: Date) => void;
}
const SelectedDatesContext = React.createContext({} as SelectedDatesContext);

export default SelectedDatesContext;
