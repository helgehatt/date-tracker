class DateCollection {
  set: Set<number>;
  obj: Record<string, Set<number>>;

  constructor() {
    this.set = new Set();
    this.obj = {};
  }

  get(date: Date) {
    const key = date.toISOMonthString();
    this.obj[key] = this.obj[key] || new Set();
    return this.obj[key];
  }

  has(date: Date) {
    return this.set.has(date.getTime());
  }

  add(date: Date) {
    this.set.add(date.getTime());
    this.get(date).add(date.getTime());
  }

  delete(date: Date) {
    this.set.delete(date.getTime());
    this.get(date).delete(date.getTime());
  }

  toArray() {
    return Array.from(this.set);
  }
}

export default DateCollection;
