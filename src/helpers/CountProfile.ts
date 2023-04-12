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

class CountProfileMetadata {
  constructor(
    public title: string,
    public limit: number,
    public intervalConstructor: DatetimeIntervalConstructor
  ) {}
}

const DEFAULT_COUNT_PROFILE_METADATA = [
  new CountProfileMetadata(
    "1 Y",
    61,
    new DatetimeIntervalConstructor(
      (y, m, d) => new Interval(Date.UTC(y, 0, 1), Date.UTC(y + 1, 0, 0))
    )
  ),
  new CountProfileMetadata(
    "12 M",
    183,
    new DatetimeIntervalConstructor(
      (y, m, d) => new Interval(Date.UTC(y, m - 12, d + 1), Date.UTC(y, m, d))
    )
  ),
  new CountProfileMetadata(
    "36 M",
    270,
    new DatetimeIntervalConstructor(
      (y, m, d) => new Interval(Date.UTC(y, m - 36, d + 1), Date.UTC(y, m, d))
    )
  ),
];

class CountProfile {
  constructor(
    public metadata: CountProfileMetadata,
    public interval: Interval<Number>,
    public count: number
  ) {}

  static fromReferenceDate(
    metadata: CountProfileMetadata,
    referenceDate: number
  ) {
    return new CountProfile(
      metadata,
      metadata.intervalConstructor.new(referenceDate),
      0
    );
  }

  add(...datetimes: number[]) {
    return new CountProfile(
      this.metadata,
      this.interval,
      this.count + datetimes.filter((dt) => this.interval.contains(dt)).length
    );
  }

  remove(...datetimes: number[]) {
    return new CountProfile(
      this.metadata,
      this.interval,
      this.count - datetimes.filter((dt) => this.interval.contains(dt)).length
    );
  }

  static DEFAULT_METADATA = DEFAULT_COUNT_PROFILE_METADATA;
}

export default CountProfile;
