type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Stringified<T> = { [P in keyof T]: string };

interface AppDatabase {
  execute<T>(sql: string, args: (string | number | null)[] = []): Promise<T[]>;
}

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
}

interface DateConstructor {
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
   * @Example 2022-02-28
   */
  toISODateString(): string;

  /**
   * Returns the month part of an ISO string
   *
   * @Example 2022-02
   */
  toISOMonthString(): string;
}

interface Object {
  map<T, R>(
    o: T,
    callbackfn: (value: T[keyof T], index: number) => R
  ): { [P in keyof T]: R };
}
