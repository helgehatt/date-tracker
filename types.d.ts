type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Stringified<T> = { [P in keyof T]: string };

type AppPage = "category" | "calendar" | "limits" | "settings";

interface AppMigration {
  version: number;
  updatedTime: number;
}

interface AppCategory {
  categoryId: number;
  name: string;
  color: string;
}

interface AppEvent {
  eventId: number;
  categoryId: number;
  startDate: number;
  stopDate: number;
  note: string;
}

interface AppLimit {
  limitId: number;
  categoryId: number;
  name: string;
  maxDays: number;
  isFavorite: number;
  intervalType: "fixed" | "running" | "custom";
  fixedInterval: "yearly" | "monthly" | null;
  runningAmount: number | null;
  runningUnit: "year" | "month" | "day" | null;
  customStartDate: number | null;
  customStopDate: number | null;
}

interface Array<T> {
  groupBy<K extends keyof T>(key: K): Record<string, Omit<T, K>[]>;
  toObject<K extends keyof T>(key: K): Record<string, T>;
}

interface DateConstructor {
  DAY_IN_MS: number;

  /**
   * Returns date.now() rounded down to day granularity.
   */
  today(): number;

  /**
   * Generates a range from `start` to `stop` with the given `step` size.
   * @param start Start of the range.
   * @param stop Stop of the range (non-inclusive depending on the `step`).
   * @param step The step size, defaulting to one full day.
   */
  range(
    start: number,
    stop: number,
    step?: number
  ): Generator<number, void, unknown>;

  /**
   * Modifies an ISO date string by adding and subtracting `-` symbols.
   *
   * @param prev Previous string value
   * @param now Current string value
   */
  onChangeFormat(prev: string, now: string): string;
}

interface Date {
  /**
   * Returns the object representation of a date
   */
  getComponents(): { year: number; month: number; day: number };

  /**
   * getUTCDay returns 0 to 6 representing Sunday to Saturday
   *
   * getISODay returns 1 to 7 representing Monday to Sunday
   */
  getISODay(): number;

  /**
   * Returns the date part of an ISO string
   *
   * @Example "2022-02-28"
   */
  toISODateString(): string;

  /**
   * Returns the month part of an ISO string
   *
   * @Example "2022-02"
   */
  toISOMonthString(): string;

  /**
   * Returns the year part of an ISO string
   *
   * @Example "2022"
   */
  toISOYearString(): string;

  /**
   * Returns a new Date after adding the given years, months and days.
   */
  add({ years: number = 0, months: number = 0, days: number = 0 }): Date;

  /**
   * Returns a new Date with date of month equal to 1
   */
  floor(): Date;

  /**
   * Returns a new Date with date of month equal to last of month
   */
  ceil(): Date;
}

interface Object {
  map<T, R>(
    o: T,
    callbackfn: (value: T[keyof T], index: number) => R
  ): { [P in keyof T]: R };
}
