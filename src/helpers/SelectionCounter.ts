import { TODAY } from "../constants";

type Keys = "oneYear" | "twelveMonths" | "thirtySixMonths";

type SelectedCount = {
  [P in Keys]: number;
};

type TimeIntervals = {
  [P in Keys]: [number, number];
};

class SelectionCounter {
  referenceDate: Date;
  intervals: TimeIntervals;
  selectedCount: SelectedCount;

  constructor() {
    this.referenceDate = TODAY;
    this.intervals = getIntervals(this.referenceDate);
    this.selectedCount = {
      oneYear: 0,
      twelveMonths: 0,
      thirtySixMonths: 0,
    };
  }

  getReferenceDate() {
    return this.referenceDate;
  }

  setReferenceDate(date: Date, selectedDates: number[]) {
    this.referenceDate = date;
    this.intervals = getIntervals(this.referenceDate);
    this.resetSelectedCount();
    this.addMany(selectedDates);
  }

  getSelectedCount() {
    return this.selectedCount;
  }

  resetSelectedCount() {
    this.selectedCount = {
      oneYear: 0,
      twelveMonths: 0,
      thirtySixMonths: 0,
    };
  }

  add(date: number) {
    Object.keys(this.intervals).forEach((key) => {
      const [start, end] = this.intervals[key as Keys];
      if (start < date && date <= end) {
        this.selectedCount[key as Keys] += 1;
      }
    });
  }

  addMany(dates: number[]) {
    Object.keys(this.intervals).forEach((key) => {
      const [start, end] = this.intervals[key as Keys];
      this.selectedCount[key as Keys] = dates.filter(
        (date) => start < date && date <= end
      ).length;
    });
  }

  delete(date: number) {
    Object.keys(this.intervals).forEach((key) => {
      const [start, end] = this.intervals[key as Keys];
      if (start < date && date <= end) {
        this.selectedCount[key as Keys] -= 1;
      }
    });
  }
}

function getIntervals(referenceDate: Date): TimeIntervals {
  const { year, month, date } = referenceDate.getComponents();

  return {
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
}

export default SelectionCounter;
