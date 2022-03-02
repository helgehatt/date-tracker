import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-bidirectional-infinite-scroll";
import * as SecureStore from "expo-secure-store";

/**
 * getUTCDay returns 0..6 representing Sunday..Saturday
 * getISODay returns 1..7 representing Monday..Sunday
 */
Date.prototype.getISODay = function () {
  return ((this.getUTCDay() + 6) % 7) + 1;
};

Date.prototype.getWeekNumber = function () {
  const from = Date.UTC(this.getFullYear(), 0, 1);
  const to = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate());
  const fromDay = new Date(from).getISODay();
  const firstWeek = fromDay <= 4 ? 1 : 0;
  const missingDays = 7 - fromDay;
  const days = (to - from) / (60 * 60 * 24 * 1000);
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
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    function* prev() {
      for (let i = 1; true; i++) {
        const date = new Date(Date.UTC(year, month - i, 1));
        yield { year: date.getFullYear(), month: date.getMonth() };
      }
    }

    function* next() {
      for (let i = 1; true; i++) {
        const date = new Date(Date.UTC(year, month + i, 1));
        yield { year: date.getFullYear(), month: date.getMonth() };
      }
    }

    const prevMonthGenerator = prev();
    const nextMonthGenerator = next();

    this.current = { year, month };
    this.prev = () => prevMonthGenerator.next().value!;
    this.next = () => nextMonthGenerator.next().value!;
  }
}

type SelectedDates = Record<string, Set<number>>;
interface SelectedDatesContext {
  selectedDates: SelectedDates;
  toggleDate: (date: Date) => void;
  loadSelectedDates: (year: number, month: number) => void;
  saveSelectedDates: (year: number, month: number) => void;
}
const SelectedDatesContext = React.createContext({} as SelectedDatesContext);

const useDateSelected = (date: Date) => {
  const { selectedDates } = React.useContext(SelectedDatesContext);
  return selectedDates[date.toISOMonthString()]?.has(date.getDate());
};

export default function App() {
  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() => [
    monthGenerator.prev(),
    monthGenerator.current,
    monthGenerator.next(),
    monthGenerator.next(),
  ]);
  const [selectedDates, setSelectedDates] = React.useState<SelectedDates>({});

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

  const toggleDate = React.useCallback(
    (date: Date) =>
      setSelectedDates((prev) => {
        const key = date.toISOMonthString();
        const selected = prev[key] ?? new Set();
        if (selected.has(date.getDate())) {
          selected.delete(date.getDate());
        } else {
          selected.add(date.getDate());
        }
        return { ...prev, [key]: selected };
      }),
    []
  );

  const showPreviousMonth = React.useCallback(() => {
    setVisibleMonths((prev) => [monthGenerator.prev(), ...prev]);
    return Promise.resolve();
  }, []);

  const showNextMonth = React.useCallback(() => {
    setVisibleMonths((prev) => [...prev, monthGenerator.next()]);
    return Promise.resolve();
  }, []);

  const loadSelectedDates = React.useCallback((year: number, month: number) => {
    const key = toISOMonthString(year, month);
    SecureStore.getItemAsync(key)
      .then((value) => {
        if (value) {
          const selected = new Set(JSON.parse(value) as number[]);
          setSelectedDates((prev) => ({ ...prev, [key]: selected }));
        }
      })
      .catch(console.warn);
  }, []);

  const saveSelectedDates = React.useCallback((year: number, month: number) => {
    const key = toISOMonthString(year, month);
    const value = JSON.stringify(new Array(selectedDates[key]));
    SecureStore.setItemAsync(key, value).catch(console.warn);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerText, styles.headerTextTitle]}>1 Y</Text>
          <Text style={[styles.headerText, styles.headerTextContent]}>
            1 / 61
          </Text>
        </View>
        <View>
          <Text style={[styles.headerText, styles.headerTextTitle]}>12 M</Text>
          <Text style={[styles.headerText, styles.headerTextContent]}>
            1 / 183
          </Text>
        </View>
        <View>
          <Text style={[styles.headerText, styles.headerTextTitle]}>36 M</Text>
          <Text style={[styles.headerText, styles.headerTextContent]}>
            1 / 270
          </Text>
        </View>
      </View>
      <SelectedDatesContext.Provider
        value={{
          selectedDates,
          toggleDate,
          loadSelectedDates,
          saveSelectedDates,
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
  const { loadSelectedDates } = React.useContext(SelectedDatesContext);
  const weeks = getWeeksInMonth(year, month);
  const title = getMonthTitle(year, month);

  React.useEffect(() => {
    loadSelectedDates(year, month);
  }, []);

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
  const { toggleDate } = React.useContext(SelectedDatesContext);
  const isSelected = useDateSelected(date);
  const isVisible = date.getMonth() == month;
  return (
    <View style={styles.dateView}>
      {isVisible && (
        <Text
          onPress={() => toggleDate(date)}
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
    width: "10%",
  },
  dateViewText: {
    padding: 5,
    width: "60%",
    textAlign: "center",
    color: colors.text,
  },
  dateViewTextSelected: {
    backgroundColor: colors.primary,
    color: "white",
    borderRadius: 15,
    overflow: "hidden",
  },
});
