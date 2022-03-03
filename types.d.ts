interface Date {
    getISODay(): number;
    getWeekNumber(): number;
    toISOMonthString(): string;
    toISODateString(): string;
}

interface ObjectConstructor {
    keys(o: Record<K,V>): K[]
}