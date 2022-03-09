import { TODAY } from "../constants";
import DateCollection from "./DateCollection";
import SelectedDateStorage from "./SelectedDateStorage";

class SelectionManager {
  dates: DateCollection;
  referenceDate: Date;
  storage: SelectedDateStorage;

  constructor(selectionManager?: SelectionManager) {
    this.dates = selectionManager?.dates ?? new DateCollection();
    this.referenceDate = selectionManager?.referenceDate ?? TODAY;
    this.storage = selectionManager?.storage ?? new SelectedDateStorage();
  }

  load() {
    return this.storage.load();
  }

  select(date: Date) {
    if (this.dates.has(date)) {
      this.dates.delete(date);
    } else {
      this.dates.add(date);
    }
    this.storage.save(date, this.dates.get(date));
  }

  isSelected(date: Date) {
    return this.dates.has(date);
  }

  setReferenceDate(date: Date) {
    this.referenceDate = date;
  }

  getSelectedCount() {
    const { year, month, date } = this.referenceDate.getComponents();

    const intervals = {
      oneYear: [Date.UTC(year, 0, 0), Date.UTC(year + 1, 0, 0)],
      twelveMonths: [
        Date.UTC(year, month - 12, date),
        Date.UTC(year, month, date),
      ],
      thirtySixMonths: [
        Date.UTC(year, month - 36, date),
        Date.UTC(year, month, date),
      ],
    };

    const dates = this.dates.toArray();

    return Object.map(intervals, ([start, end]) => {
      return dates.filter((date) => start < date && date <= end).length;
    });
  }
}

export default SelectionManager;
