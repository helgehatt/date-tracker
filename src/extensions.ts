import { DAY_IN_MS } from "./constants";

Date.prototype.getComponents = function () {
  return {
    year: this.getFullYear(),
    month: this.getMonth(),
    date: this.getDate(),
  };
};

/**
 * getUTCDay returns 0..6 representing Sunday..Saturday
 * getISODay returns 1..7 representing Monday..Sunday
 */
Date.prototype.getISODay = function () {
  return ((this.getUTCDay() + 6) % 7) + 1;
};

Date.prototype.getWeekNumber = function () {
  const { year, month, date } = this.getComponents();
  const from = Date.UTC(year, 0, 1);
  const to = Date.UTC(year, month, date);
  const fromDay = new Date(from).getISODay();
  const firstWeek = fromDay <= 4 ? 1 : 0;
  const missingDays = 7 - fromDay;
  const days = (to - from) / DAY_IN_MS;
  return Math.ceil((days - missingDays) / 7) + firstWeek;
};

Array.prototype.groupBy = function (key) {
  return this.reduce((acc, { [key]: grouper, ...rest }) => {
    acc[grouper] = acc[grouper] || [];
    acc[grouper].push({ ...rest });
    return acc;
  }, {});
};

Object.map = function (o, callbackfn) {
  return Object.fromEntries(
    Object.entries(o).map(([key, value], index) => [
      key,
      callbackfn(value, index),
    ])
  ) as any;
};

/**
 * The month part of an ISO string is 2022-02
 */
Date.prototype.toISOMonthString = function () {
  return this.toISOString().slice(0, 7);
};
