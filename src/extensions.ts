Date.prototype.getComponents = function () {
  return {
    year: this.getFullYear(),
    month: this.getMonth(),
    day: this.getDate(),
  };
};

Date.prototype.getISODay = function () {
  return ((this.getUTCDay() + 6) % 7) + 1;
};

Array.prototype.groupBy = function (key) {
  return this.reduce((acc, { [key]: grouper, ...rest }) => {
    acc[grouper] = acc[grouper] || [];
    acc[grouper].push({ ...rest });
    return acc;
  }, {});
};

Array.prototype.toObject = function (key) {
  return this.reduce((acc, obj) => ({ ...acc, [obj[key]]: obj }), {});
};

Object.map = function (o, callbackfn) {
  return Object.fromEntries(
    Object.entries(o).map(([key, value], index) => [
      key,
      callbackfn(value, index),
    ])
  ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

Date.prototype.toISODateString = function () {
  return this.toISOString().slice(0, 10);
};

Date.prototype.toISOMonthString = function () {
  return this.toISOString().slice(0, 7);
};

Date.range = function* (
  start: number,
  stop: number,
  step: number = 1000 * 60 * 60 * 24
) {
  for (let i = start; i <= stop; i += step) {
    yield i;
  }
};

Date.onChangeFormat = function (prev: string, now: string) {
  if (prev.endsWith("-") && now.length < prev.length) {
    return now.slice(0, now.length - 1);
  }
  now = now.replaceAll(/\D/g, "");
  if (now.length >= 6) {
    return now.slice(0, 4) + "-" + now.slice(4, 6) + "-" + now.slice(6, 8);
  }
  if (now.length >= 4) {
    return now.slice(0, 4) + "-" + now.slice(4, 6);
  }
  return now;
};

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
