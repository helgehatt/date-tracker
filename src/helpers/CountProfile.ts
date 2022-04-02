type IntervalConstructor = (
  year: number,
  month: number,
  date: number
) => [number, number];

class CountProfile {
  title: string;
  count: number;
  limit: number;
  interval: [number, number];
  intervalConstructor: IntervalConstructor;

  constructor(
    title: string,
    limit: number,
    intervalConstructor: IntervalConstructor
  ) {
    this.title = title;
    this.count = 0;
    this.limit = limit;
    this.interval = [0, 0];
    this.intervalConstructor = intervalConstructor;
  }

  contains(datetime: number) {
    const [start, end] = this.interval;
    return start < datetime && datetime <= end;
  }

  add(datetime: number) {
    this.count += Number(this.contains(datetime));
    return this;
  }

  reset(datetimes: number[]) {
    this.count = datetimes.filter((dt) => this.contains(dt)).length;
    return this;
  }

  remove(datetime: number) {
    this.count -= Number(this.contains(datetime));
    return this;
  }

  setInterval(datetime: number) {
    const { year, month, date } = new Date(datetime).getComponents();
    this.interval = this.intervalConstructor(year, month, date);
    this.count = 0; // count is no longer correct
    return this;
  }

  static getDefaultProfiles(referenceDate: number) {
    const profiles = [
      new CountProfile("1 Y", 61, (year) => [
        Date.UTC(year, 0, 0),
        Date.UTC(year + 1, 0, 0),
      ]),
      new CountProfile("12 M", 183, (year, month, date) => [
        Date.UTC(year, month - 12, date),
        Date.UTC(year, month, date),
      ]),
      new CountProfile("36 M", 270, (year, month, date) => [
        Date.UTC(year, month - 36, date),
        Date.UTC(year, month, date),
      ]),
    ];
    for (const profile of profiles) {
      profile.setInterval(referenceDate);
    }
    return profiles;
  }
}

export default CountProfile;
