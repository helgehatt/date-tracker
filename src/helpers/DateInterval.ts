class Interval<T> {
  constructor(private start: T, private stop: T) {}

  contains(x: T) {
    return this.start <= x && x <= this.stop;
  }

  filter(xs: T[]) {
    return xs.filter((x) => this.contains(x));
  }
}

class DateInterval extends Interval<number> {
  static getInterval(l: AppLimit, date: string | number) {
    const { year, month, day } = new Date(date).getComponents();
    if (l.intervalType === "fixed") {
      if (l.fixedInterval === "yearly") {
        return new DateInterval(Date.UTC(year, 0, 1), Date.UTC(year + 1, 0, 0));
      }
      if (l.fixedInterval === "monthly") {
        return new DateInterval(
          Date.UTC(year, month, 1),
          Date.UTC(year, month + 1, 0)
        );
      }
      throw new Error("Invalid AppLimit fixedInterval");
    }
    if (l.intervalType === "running") {
      const yearOffset = l.runningUnit === "year" ? l.runningAmount! : 0;
      const monthOffset = l.runningUnit === "month" ? l.runningAmount! : 0;
      const dayOffset = l.runningUnit === "day" ? l.runningAmount! : 0;
      return new DateInterval(
        Date.UTC(year - yearOffset, month - monthOffset, day - dayOffset),
        Date.UTC(year, month, day)
      );
    }
    if (l.intervalType === "custom") {
      return new DateInterval(l.customStartDate!, l.customStopDate!);
    }
    throw new Error("Invalid AppLimit type");
  }
}

export default DateInterval;
