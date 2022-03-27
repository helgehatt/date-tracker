import { TODAY } from "../constants";

class SelectionCounter {
  referenceDate: Date;
  countProfiles: CountProfile[];

  constructor() {
    this.referenceDate = TODAY;
    this.countProfiles = [
      {
        title: "1 Y",
        count: 0,
        limit: 61,
        interval: [0, 0],
        intervalConstructor: (year, month, date) => [
          Date.UTC(year, 0, 0),
          Date.UTC(year + 1, 0, 0),
        ],
      },
      {
        title: "12 M",
        count: 0,
        limit: 183,
        interval: [0, 0],
        intervalConstructor: (year, month, date) => [
          Date.UTC(year, month - 12, date),
          Date.UTC(year, month, date),
        ],
      },
      {
        title: "36 M",
        count: 0,
        limit: 270,
        interval: [0, 0],
        intervalConstructor: (year, month, date) => [
          Date.UTC(year, month - 36, date),
          Date.UTC(year, month, date),
        ],
      },
    ];
    for (const profile of this.countProfiles) {
      profile.interval = profile.intervalConstructor(
        this.referenceDate.getFullYear(),
        this.referenceDate.getMonth(),
        this.referenceDate.getDate()
      );
    }
  }

  getReferenceDate() {
    return this.referenceDate;
  }

  setReferenceDate(date: Date, selectedDates: number[]) {
    this.referenceDate = date;
    for (const profile of this.countProfiles) {
      const [start, end] = profile.intervalConstructor(
        this.referenceDate.getFullYear(),
        this.referenceDate.getMonth(),
        this.referenceDate.getDate()
      );
      profile.count = 0;
      profile.interval = [start, end];
      profile.count = selectedDates.filter(
        (date) => start < date && date <= end
      ).length;
    }
  }

  getCountProfiles() {
    return this.countProfiles;
  }

  add(date: number) {
    for (const profile of this.countProfiles) {
      const [start, end] = profile.interval;
      if (start < date && date <= end) {
        profile.count += 1;
      }
    }
  }

  delete(date: number) {
    for (const profile of this.countProfiles) {
      const [start, end] = profile.interval;
      if (start < date && date <= end) {
        profile.count -= 1;
      }
    }
  }
}

export default SelectionCounter;
