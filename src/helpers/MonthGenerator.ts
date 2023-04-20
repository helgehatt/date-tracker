type YearMonth = { year: number; month: number };

class MonthGenerator {
  private current: YearMonth;
  private prevMonthGenerator: Generator<YearMonth, void>;
  private nextMonthGenerator: Generator<YearMonth, void>;

  constructor(today: Date = new Date()) {
    const { year, month } = today.getComponents();

    function* prevMonthGeneratorFunction() {
      for (let i = 1; true; i++) {
        yield new Date(Date.UTC(year, month - i, 1)).getComponents();
      }
    }

    function* nextMonthGeneratorFunction() {
      for (let i = 1; true; i++) {
        yield new Date(Date.UTC(year, month + i, 1)).getComponents();
      }
    }

    this.current = { year, month };
    this.prevMonthGenerator = prevMonthGeneratorFunction();
    this.nextMonthGenerator = nextMonthGeneratorFunction();
  }

  prev() {
    return this.prevMonthGenerator.next().value!;
  }

  next() {
    return this.nextMonthGenerator.next().value!;
  }

  init(prev: number, next: number) {
    return [
      ...Array.from({ length: prev }, () => this.prev()).reverse(),
      this.current,
      ...Array.from({ length: next }, () => this.next()),
    ];
  }
}

export default MonthGenerator;
