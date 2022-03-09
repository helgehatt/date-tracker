import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
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

Array.prototype.groupBy = function (key) {
  return this.reduce((acc, { [key]: grouper, ...rest }) => {
    acc[grouper] = acc[grouper] || [];
    acc[grouper].push({ ...rest });
    return acc;
  }, {});
};

Object.map = function (o, callbackfn) {
  return Object.fromEntries(
    Object.entries(o).map(([key, value], index) => [
      key,
      callbackfn(value, index),
    ])
  ) as any;
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

class SelectionManager {
  dates: DateCollection;
  referenceDate: Date;
  storage: SelectedDateStorage;

  constructor(selectionManager?: SelectionManager) {
    this.dates = selectionManager?.dates ?? new DateCollection();
    this.referenceDate = selectionManager?.referenceDate ?? TODAY;
    this.storage = selectionManager?.storage ?? new SelectedDateStorage();
  }

  load() {
    return this.storage.load();
  }

  select(date: Date) {
    if (this.dates.has(date)) {
      this.dates.delete(date);
    } else {
      this.dates.add(date);
    }
    this.storage.save(date, this.dates.get(date));
  }

  isSelected(date: Date) {
    return this.dates.has(date);
  }

  setReferenceDate(date: Date) {
    this.referenceDate = date;
  }

  getSelectedCount() {
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
    };

    const dates = this.dates.toArray();

    return Object.map(intervals, ([start, end]) => {
      return dates.filter((date) => start < date && date <= end).length;
    });
  }
}

interface SelectedDatesContext {
  selectionManager: SelectionManager;
  toggleDate: (date: Date) => void;
  setReferenceDate: (date: Date) => void;
}
const SelectedDatesContext = React.createContext({} as SelectedDatesContext);

class SelectedDateStorage {
  static PREFIX = "selected-dates";
  keys: Set<string>;

  constructor() {
    this.keys = new Set();
  }

  async load() {
    const keys = await SelectedDateStorage.loadKeys();
    console.log(`Loading selected dates: [${keys}]`);

    const tasks = keys.map((key) => SelectedDateStorage.loadMonth(key));

    const result = await Promise.all(tasks);

    keys.forEach((key) => this.keys.add(key));

    return result.flat();
  }

  async save(date: Date, dates: Set<number>) {
    const key = date.toISOMonthString();
    await SelectedDateStorage.saveMonth(key, dates);
    if (!this.keys.has(key)) {
      this.keys.add(key);
      await SelectedDateStorage.saveKeys(this.keys);
    } else if (dates.size == 0) {
      this.keys.delete(key);
      await SelectedDateStorage.saveKeys(this.keys);
    }
  }

  static async loadKeys() {
    try {
      const value = await SecureStore.getItemAsync(`${this.PREFIX}-keys`);
      if (value) {
        return JSON.parse(value) as string[];
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  }

  static async loadMonth(month: string) {
    try {
      const value = await SecureStore.getItemAsync(`${this.PREFIX}-${month}`);
      if (value) {
        const parsed = JSON.parse(value) as number[];
        return parsed
          .map((value) => String(value).padStart(2, "0"))
          .map((value) => `${month}-${value}`)
          .map((value) => new Date(value).getTime());
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  }

  static async saveKeys(keys: Set<string>) {
    const value = JSON.stringify(Array.from(keys));
    await SecureStore.setItemAsync(`${this.PREFIX}-keys`, value).catch(
      console.warn
    );
  }

  static async saveMonth(key: string, dates: Set<number>) {
    const value = JSON.stringify(
      Array.from(dates).map((value) => new Date(value).getDate())
    );

    await SecureStore.setItemAsync(`${this.PREFIX}-${key}`, value).catch(
      console.warn
    );
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
  const [selectionManager, setSelectionManager] = React.useState(
    () => new SelectionManager()
  );
  const [selectedCount, setSelectedCount] = React.useState(() =>
    selectionManager.getSelectedCount()
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
    setSelectedCount(selectionManager.getSelectedCount());
  }, [selectionManager]);

  React.useEffect(() => {
    selectionManager.load().then((selected) => {
      setSelectionManager((prevObj) => {
        const newObj = new SelectionManager(prevObj);
        selected
          .map((value) => new Date(value))
          .forEach((value) => newObj.dates.add(value));
        return newObj;
      });
    });
  }, []);

  const toggleDate = React.useCallback((date: Date) => {
    setSelectionManager((prevObj) => {
      const newObj = new SelectionManager(prevObj);
      newObj.select(date);
      return newObj;
    });
  }, []);

  const setReferenceDate = React.useCallback((date: Date) => {
    setSelectionManager((prevObj) => {
      const newObj = new SelectionManager(prevObj);
      newObj.setReferenceDate(date);
      return newObj;
    });
  }, []);

  const showPreviousMonth = React.useCallback(() => {
    setVisibleMonths((prevMonths) => [monthGenerator.prev(), ...prevMonths]);
    return Promise.resolve();
  }, []);

  const showNextMonth = React.useCallback(() => {
    setVisibleMonths((prevMonths) => [...prevMonths, monthGenerator.next()]);
    return Promise.resolve();
  }, []);

  return (
    <View>
      <View style={styles.header}>
        <SafeAreaView>
          <StatusBar style="light" />
        </SafeAreaView>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerText, styles.headerTextTitle]}>1 Y</Text>
            <Text style={[styles.headerText, styles.headerTextContent]}>
              {selectedCount.oneYear} / 61
            </Text>
          </View>
          <View>
            <Text style={[styles.headerText, styles.headerTextTitle]}>
              12 M
            </Text>
            <Text style={[styles.headerText, styles.headerTextContent]}>
              {selectedCount.twelveMonths} / 183
            </Text>
          </View>
          <View>
            <Text style={[styles.headerText, styles.headerTextTitle]}>
              36 M
            </Text>
            <Text style={[styles.headerText, styles.headerTextContent]}>
              {selectedCount.thirtySixMonths} / 270
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.container}>
        <SelectedDatesContext.Provider
          value={{
            selectionManager,
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
      </View>
    </View>
  );
}

function getMonthTitle(year: number, month: number) {
  const date = new Date(Date.UTC(year, month));
  const options = { year: "numeric", month: "long" } as const;
  return date.toLocaleDateString("en-US", options);
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
  const { selectionManager, toggleDate, setReferenceDate } =
    React.useContext(SelectedDatesContext);
  const isSelected = selectionManager.isSelected(date);
  const isVisible = date.getMonth() == month;
  const isToday = date.getTime() == TODAY.getTime();
  const isReference =
    date.getTime() == selectionManager.referenceDate.getTime();

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
    backgroundColor: colors.primary,
  },
  headerContent: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
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
    flex: 111,
    alignItems: "center",
    justifyContent: "center",
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
    borderRadius: 15,
    overflow: "hidden",
  },
});
