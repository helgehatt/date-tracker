interface Date {
    getComponents(): { year: number, month: number, date: number }
    getISODay(): number;
    getWeekNumber(): number;
    toISOMonthString(): string;
    toISODateString(): string;
}

interface ObjectConstructor {
    keys(o: Record<K,V>): K[]
}