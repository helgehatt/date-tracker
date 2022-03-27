interface Array<T> {
  groupBy<K extends keyof T>(key: K): Record<string, Omit<T, K>[]>;
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

interface CountProfile {
  title: string;
  count: number;
  limit: number;
  interval: [number, number];
  intervalConstructor: (
    year: number,
    month: number,
    date: number
  ) => [number, number];
}
