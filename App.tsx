import React from "react";
import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-bidirectional-infinite-scroll";
import * as SecureStore from "expo-secure-store";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const TODAY = new Date(Math.floor(Date.now() / DAY_IN_MS) * DAY_IN_MS);

Date.prototype.getComponents = function () {
  return {
    year: this.getFullYear(),
    month: this.getMonth(),
    date: this.getDate(),
  };
};

/**
 * getUTCDay returns 0..6 representing Sunday..Saturday
 * getISODay returns 1..7 representing Monday..Sunday
 */
Date.prototype.getISODay = function () {
  return ((this.getUTCDay() + 6) % 7) + 1;
};

Date.prototype.getWeekNumber = function () {
  const { year, month, date } = this.getComponents();
  const from = Date.UTC(year, 0, 1);
  const to = Date.UTC(year, month, date);
  const fromDay = new Date(from).getISODay();
  const firstWeek = fromDay <= 4 ? 1 : 0;
  const missingDays = 7 - fromDay;
  const days = (to - from) / DAY_IN_MS;
  return Math.ceil((days - missingDays) / 7) + firstWeek;
};

function getWeeksInMonth(year: number, month: number) {
  const from = new Date(Date.UTC(year, month, 1)).getWeekNumber();
  const to = new Date(Date.UTC(year, month + 1, 0)).getWeekNumber();
  return Array.from({ length: to - from + 1 }, (_, i) => i + from);
}

/**
 * The month part of an ISO string is 2022-02
 */
Date.prototype.toISOMonthString = function () {
  return this.toISOString().slice(0, 7);
};

function toISOMonthString(year: number, month: number) {
  return new Date(Date.UTC(year, month, 1)).toISOMonthString();
}

type Month = { year: number; month: number };
class MonthGenerator {
  current: Month;
  prev: () => Month;
  next: () => Month;

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
}

class SelectedDates {
  dates: Record<number, Record<number, Set<number>>>;
  referenceDate: Date;

  constructor(selectedDates?: SelectedDates) {
    this.dates = selectedDates?.dates ?? {};
    this.referenceDate = selectedDates?.referenceDate ?? TODAY;
  }

  getYear(year: number) {
    if (!(year in this.dates)) {
      this.dates[year] = {};
    }
    return this.dates[year];
  }

  setYear(year: number, months: Record<number, Set<number>>) {
    if (!(year in this.dates)) {
      this.dates[year] = {};
    }
    this.dates[year] = months;
  }

  select(other: Date) {
    const { year, month, date } = other.getComponents();

    if (!(year in this.dates)) {
      this.dates[year] = { [month]: new Set() };
    } else if (!(month in this.dates[year])) {
      this.dates[year][month] = new Set();
    }

    const selected = this.dates[year][month];
    if (selected.has(date)) {
      selected.delete(date);
    } else {
      selected.add(date);
    }
  }

  isSelected(other: Date) {
    const { year, month, date } = other.getComponents();

    if (!(year in this.dates)) {
      this.dates[year] = { [month]: new Set() };
    } else if (!(month in this.dates[year])) {
      this.dates[year][month] = new Set();
    }

    return this.dates[year][month].has(date);
  }

  getSelectedCount(): {
    oneYear: number;
    twelveMonths: number;
    thirtySixMonths: number;
  } {
    const dates = [] as number[];

    if (this.dates) {
      Object.keys(this.dates).forEach((year) => {
        Object.keys(this.dates[year]).forEach((month) => {
          this.dates[year][month].forEach((date) => {
            dates.push(Date.UTC(year, month, date));
          });
        });
      });
    }

    const { year, month, date } = this.referenceDate.getComponents();

    const intervals = {
      oneYear: [Date.UTC(year, 0, 0), Date.UTC(year + 1, 0, 0)],
      twelveMonths: [
        Date.UTC(year, month - 12, date),
        Date.UTC(year, month, date),
      ],
      thirtySixMonths: [
        Date.UTC(year, month - 36, date),
        Date.UTC(year, month, date),
      ],
    } as const;

    return Object.fromEntries(
      Object.entries(intervals).map(([key, [start, end]]) => [
        key,
        dates.filter((date) => start < date && date <= end).length,
      ])
    ) as ReturnType<typeof this.getSelectedCount>;
  }
}

interface SelectedDatesContext {
  selectedDates: SelectedDates;
  toggleDate: (date: Date) => void;
  setReferenceDate: (date: Date) => void;
}
const SelectedDatesContext = React.createContext({} as SelectedDatesContext);

class SelectedDateStorage {
  static async load(year: number) {
    try {
      const value = await SecureStore.getItemAsync(`selected-dates-${year}`);
      if (value) {
        const parsed = JSON.parse(value) as Record<string, Array<number>>;
        const selected = {} as Record<number, Set<number>>;
        Object.entries(parsed).forEach(([key, items]) => {
          selected[Number(key)] = new Set(items);
        });
        return selected;
      }
    } catch (e) {
      console.warn(e);
    }
    return {} as Record<number, Set<number>>;
  }

  static async save(year: number, dates: Record<number, Set<number>>) {
    try {
      const value = {} as Record<string, Array<number>>;
      Object.entries(dates).forEach(([k, v]) => {
        value[k] = Array.from(v);
      });
      await SecureStore.setItemAsync(
        `selected-dates-${year}`,
        JSON.stringify(value)
      );
    } catch (e) {
      console.warn(e);
    }
  }
}

export default function App() {
  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() => [
    monthGenerator.prev(),
    monthGenerator.current,
    monthGenerator.next(),
    monthGenerator.next(),
  ]);
  const [selectedDates, setSelectedDates] = React.useState(new SelectedDates());
  const [selectedCount, setSelectedCount] = React.useState(() =>
    selectedDates.getSelectedCount()
  );

  React.useEffect(() => {
    // Adding months must be slightly delayed to
    // keep current month in center
    const handle = setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        showNextMonth();
        showPreviousMonth();
      }
    }, 1);
    return () => clearTimeout(handle);
  }, []);

  React.useEffect(() => {
    const currentYear = TODAY.getFullYear();
    loadSelectedDates(currentYear);
    loadSelectedDates(currentYear - 1);
    loadSelectedDates(currentYear - 2);
    loadSelectedDates(currentYear - 3);
  }, []);

  React.useEffect(() => {
    setSelectedCount(selectedDates.getSelectedCount());
  }, [selectedDates]);

  const toggleDate = React.useCallback((date: Date) => {
    setSelectedDates((prevObj) => {
      const newObj = new SelectedDates(prevObj);
      newObj.select(date);
      return newObj;
    });
  }, []);

  const setReferenceDate = React.useCallback((date: Date) => {
    setSelectedDates((prev) => {
      const newObj = new SelectedDates(prev);
      newObj.referenceDate = date;
      return newObj;
    });
  }, []);

  const showPreviousMonth = React.useCallback(() => {
    setVisibleMonths((prev) => [monthGenerator.prev(), ...prev]);
    return Promise.resolve();
  }, []);

  const showNextMonth = React.useCallback(() => {
    setVisibleMonths((prev) => [...prev, monthGenerator.next()]);
    return Promise.resolve();
  }, []);

  const loadSelectedDates = React.useCallback(async (year: number) => {
    const selected = await SelectedDateStorage.load(year);
    setSelectedDates((prevObj) => {
      const newObj = new SelectedDates(prevObj);
      newObj.setYear(year, selected);
      return newObj;
    });
  }, []);

  const saveSelectedDates = React.useCallback(async () => {
    const years = Object.keys(selectedDates.dates) as unknown as number[];
    years.forEach(async (year) => {
      await SelectedDateStorage.save(year, selectedDates.getYear(year));
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerText, styles.headerTextTitle]}>1 Y</Text>
          <Text style={[styles.headerText, styles.headerTextContent]}>
            {selectedCount.oneYear} / 61
          </Text>
        </View>
        <View>
          <Text style={[styles.headerText, styles.headerTextTitle]}>12 M</Text>
          <Text style={[styles.headerText, styles.headerTextContent]}>
            {selectedCount.twelveMonths} / 183
          </Text>
        </View>
        <View>
          <Text style={[styles.headerText, styles.headerTextTitle]}>36 M</Text>
          <Text style={[styles.headerText, styles.headerTextContent]}>
            {selectedCount.thirtySixMonths} / 270
          </Text>
        </View>
      </View>
      <SelectedDatesContext.Provider
        value={{
          selectedDates,
          toggleDate,
          setReferenceDate,
        }}
      >
        <FlatList
          data={visibleMonths}
          renderItem={({ item: { year, month } }) => (
            <MonthView year={year} month={month} />
          )}
          keyExtractor={({ year, month }) => toISOMonthString(year, month)}
          onStartReached={showPreviousMonth}
          onStartReachedThreshold={1000}
          onEndReached={showNextMonth}
          onEndReachedThreshold={1000}
          showsVerticalScrollIndicator={false}
        />
      </SelectedDatesContext.Provider>
      <View style={styles.saveButton}>
        <Button color={colors.text} title="Save" onPress={saveSelectedDates} />
      </View>
      <StatusBar style="light" />
    </View>
  );
}

function getMonthTitle(year: number, month: number) {
  const date = new Date(Date.UTC(year, month));
  const options = { year: "numeric", month: "long" } as const;
  return date.toLocaleDateString(undefined, options);
}

interface IMonthView {
  year: number;
  month: number;
}
const MonthView = ({ year, month }: IMonthView) => {
  const weeks = getWeeksInMonth(year, month);
  const title = getMonthTitle(year, month);

  return (
    <View style={styles.monthView}>
      <Text style={styles.monthViewText}>{title}</Text>
      {weeks.map((week) => (
        <WeekView key={week} year={year} month={month} week={week} />
      ))}
    </View>
  );
};

interface IWeekView {
  year: number;
  month: number;
  week: number;
}
const WeekView = ({ year, month, week }: IWeekView) => {
  const offset = new Date(Date.UTC(year, 0, 1)).getISODay() - 1;
  const dates = Array.from(
    { length: 7 },
    (_, i) => new Date(Date.UTC(year, 0, week * 7 + (i + 1) - offset))
  );
  return (
    <View style={styles.weekView}>
      {dates.map((date, index) => (
        <DateView key={index} year={year} month={month} date={date} />
      ))}
    </View>
  );
};

interface IDateView {
  year: number;
  month: number;
  date: Date;
}

const DateView = ({ year, month, date }: IDateView) => {
  const { selectedDates, toggleDate, setReferenceDate } =
    React.useContext(SelectedDatesContext);
  const isSelected = selectedDates.isSelected(date);
  const isVisible = date.getMonth() == month;
  const isToday = date.getTime() == TODAY.getTime();
  const isReference = date.getTime() == selectedDates.referenceDate.getTime();

  return (
    <View
      style={[
        styles.dateView,
        isVisible && isToday && styles.dateViewToday,
        isVisible && isReference && styles.dateViewReference,
      ]}
    >
      {isVisible && (
        <Text
          onPress={() => toggleDate(date)}
          onLongPress={() => setReferenceDate(date)}
          style={[
            styles.dateViewText,
            isSelected && styles.dateViewTextSelected,
          ]}
        >
          {date.getDate()}
        </Text>
      )}
    </View>
  );
};

// https://colorhunt.co/palette/0820322c394b334756ff4c29
const colors = {
  background: "#2C394B",
  primary: "#FF4C29",
  secondary: "#082032",
  text: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 60,
    padding: 20,
    backgroundColor: colors.primary,
  },
  headerText: {
    color: colors.text,
    textAlign: "center",
  },
  headerTextTitle: {
    fontSize: 20,
  },
  headerTextContent: {
    marginTop: 10,
  },
  monthView: {},
  monthViewText: {
    color: colors.text,
    padding: 20,
    fontSize: 16,
  },
  weekView: {
    display: "flex",
    flexDirection: "row",
    height: 50,
  },
  dateView: {
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "10%",
  },
  dateViewToday: {
    backgroundColor: colors.secondary,
  },
  dateViewReference: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateViewText: {
    width: "70%",
    padding: 5,
    textAlign: "center",
    color: colors.text,
  },
  dateViewTextSelected: {
    backgroundColor: colors.primary,
    color: "white",
    borderRadius: 15,
    overflow: "hidden",
  },
  saveButton: {
    position: "absolute",
    bottom: 150,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
});
