class Interval<T> {
  constructor(private start: T, private stop: T) {}

  contains(x: T) {
    return this.start <= x && x <= this.stop;
  }
}

class DatetimeIntervalConstructor {
  constructor(
    private fn: (year: number, month: number, day: number) => Interval<number>
  ) {}

  new(datetime: number) {
    const { year, month, date: day } = new Date(datetime).getComponents();
    return this.fn(year, month, day);
  }
}

class CountProfile {
  constructor(
    public title: string,
    public limit: number,
    public intervalConstructor: DatetimeIntervalConstructor,
    public count: number = 0
  ) {}

  new(referenceDate: number, datetimes: number[]) {
    const interval = this.intervalConstructor.new(referenceDate);

    return new CountProfile(
      this.title,
      this.limit,
      this.intervalConstructor,
      datetimes.filter((dt) => interval.contains(dt)).length
    );
  }
}

export const DEFAULT_COUNT_PROFILES = [
  new CountProfile(
    "1 Y",
    61,
    new DatetimeIntervalConstructor(
      (y) => new Interval(Date.UTC(y, 0, 1), Date.UTC(y + 1, 0, 0))
    )
  ),
  new CountProfile(
    "12 M",
    183,
    new DatetimeIntervalConstructor(
      (y, m, d) => new Interval(Date.UTC(y, m - 12, d + 1), Date.UTC(y, m, d))
    )
  ),
  new CountProfile(
    "36 M",
    270,
    new DatetimeIntervalConstructor(
      (y, m, d) => new Interval(Date.UTC(y, m - 36, d + 1), Date.UTC(y, m, d))
    )
  ),
];

export default CountProfile;
