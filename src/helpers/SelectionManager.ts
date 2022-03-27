import DateCollection from "./DateCollection";
import SelectedDateStorage from "./SelectedDateStorage";
import SelectionCounter from "./SelectionCounter";

class SelectionManager {
  dates: DateCollection;
  storage: SelectedDateStorage;
  counter: SelectionCounter;

  constructor(selectionManager?: SelectionManager) {
    this.dates = selectionManager?.dates ?? new DateCollection();
    this.storage = selectionManager?.storage ?? new SelectedDateStorage();
    this.counter = selectionManager?.counter ?? new SelectionCounter();
  }

  load() {
    return this.storage.load();
  }

  add(date: Date) {
    this.dates.add(date);
    this.counter.add(date.getTime());
  }

  select(date: Date) {
    if (this.dates.has(date)) {
      this.dates.delete(date);
      this.counter.delete(date.getTime());
    } else {
      this.dates.add(date);
      this.counter.add(date.getTime());
    }
    this.storage.save(date, this.dates.get(date));
  }

  isSelected(date: Date) {
    return this.dates.has(date);
  }

  getRefrenceDate() {
    return this.counter.getReferenceDate();
  }

  setReferenceDate(date: Date) {
    this.counter.setReferenceDate(date, this.dates.toArray());
  }

  getCountProfiles() {
    return this.counter.getCountProfiles();
  }
}

export default SelectionManager;
