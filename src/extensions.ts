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
  ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * The month part of an ISO string is 2022-02
 */
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
