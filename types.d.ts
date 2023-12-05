interface Array<T> {
  groupBy<K extends keyof T>(key: K): Record<string, Omit<T, K>[]>;
}

interface DateConstructor {
  range(
    start: number,
    stop: number,
    step?: number
  ): Generator<number, void, unknown>;
}

interface Date {
  getComponents(): { year: number; month: number; date: number };
  getISODay(): number;
  toISOMonthString(): string;
}

interface Object {
  map<T, R>(
    o: T,
    callbackfn: (value: T[keyof T], index: number) => R
  ): { [P in keyof T]: R };
}
