type YearMonth = { year: number; month: number };

class MonthGenerator {
  current: YearMonth;
  prev: () => YearMonth;
  next: () => YearMonth;

  constructor() {
    const { year, month } = new Date().getComponents();

    function* prev() {
      for (let i = 1; true; i++) {
        yield new Date(Date.UTC(year, month - i, 1)).getComponents();
      }
    }

    function* next() {
      for (let i = 1; true; i++) {
        yield new Date(Date.UTC(year, month + i, 1)).getComponents();
      }
    }

    const prevMonthGenerator = prev();
    const nextMonthGenerator = next();

    this.current = { year, month };
    this.prev = () => prevMonthGenerator.next().value!;
    this.next = () => nextMonthGenerator.next().value!;
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
