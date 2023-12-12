import * as SQLite from "expo-sqlite";

export interface AppCategory {
  categoryId: number;
  name: string;
  color: string;
}

export interface AppEvent {
  eventId: number;
  categoryId: number;
  startDate: number;
  stopDate: number;
  note: string;
}

export interface AppLimit {
  limitId: number;
  categoryId: number;
  name: string;
  value: number;
  startOfYear: number;
  startOfMonth: number;
  yearOffset: number;
  monthOffset: number;
  dayOffset: number;
}

class Interval<T> {
  constructor(private start: T, private stop: T) {}

  contains(x: T) {
    return this.start <= x && x <= this.stop;
  }

  filter(xs: T[]) {
    return xs.filter((x) => this.contains(x));
  }
}

export function getInterval(l: AppLimit, date: string | number) {
  const { year, month, date: day } = new Date(date).getComponents();
  return new Interval(
    Date.UTC(
      year + l.yearOffset,
      month * (1 - l.startOfYear) - l.monthOffset,
      day * (1 - (l.startOfYear || l.startOfMonth)) - l.dayOffset
    ),
    Date.UTC(year, month, day)
  );
}

export function getChangepoints(l: AppLimit, date: string | number) {}

class AppDatabase {
  db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase("app.v1.0.6-beta.db");
  }

  execute<T>(sql: string, args: (string | number)[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.exec([{ sql, args }], false, (err, res) => {
        if (err) {
          return reject(err);
        }

        if (res && res[0]) {
          if ("error" in res[0]) return reject(res[0].error);
          return resolve(res[0].rows as T[]);
        }

        return resolve([]);
      });
    });
  }

  async init() {
    try {
      await this.execute(`BEGIN TRANSACTION`);

      await this.execute(
        `CREATE TABLE categories (
          categoryId        INTEGER PRIMARY KEY,
          name              TEXT NOT NULL,
          color             TEXT NOT NULL
        )`
      );

      await this.execute(
        `CREATE TABLE events (
          eventId           INTEGER PRIMARY KEY,
          categoryId        INTEGER NOT NULL,
          startDate         INTEGER NOT NULL CHECK(startDate >= 0),
          stopDate          INTEGER NOT NULL CHECK(stopDate >= 0),
          note              TEXT NOT NULL,
          FOREIGN KEY (categoryId)
            REFERENCES categories (categoryId)
              ON DELETE CASCADE
              ON UPDATE NO ACTION
        )`
      );

      await this.execute(
        `CREATE TABLE limits (
          limitId           INTEGER PRIMARY KEY,
          categoryId        INTEGER NOT NULL,
          name              TEXT NOT NULL,
          value             INTEGER NOT NULL CHECK(value >= 0),
          startOfYear       INTEGER NOT NULL CHECK(startOfYear >= 0 AND startOfYear <= 1),
          startOfMonth      INTEGER NOT NULL CHECK(startOfMonth >= 0 AND startOfMonth <= 1),
          yearOffset        INTEGER NOT NULL CHECK(yearOffset >= 0),
          monthOffset       INTEGER NOT NULL CHECK(monthOffset >= 0),
          dayOffset         INTEGER NOT NULL CHECK(dayOffset >= 0),
          FOREIGN KEY (categoryId)
            REFERENCES categories (categoryId)
              ON DELETE CASCADE
              ON UPDATE NO ACTION
        )`
      );

      await this.execute(
        `INSERT INTO categories (name, color) VALUES ('Norge', '#FF4C29')`
      );

      const result = await this.execute<AppCategory>(
        `SELECT * FROM categories`
      );

      const { categoryId } = result[0];
      await this.execute(
        `INSERT INTO limits (
          categoryId, name, value,
          startOfYear, startOfMonth, yearOffset, monthOffset, dayOffset
        )
        VALUES (
          ?, 'One Calendar Year', 61,
          1, 0, 0, 0, 0
        ), (
          ?, '12-Month Rolling', 183,
          0, 0, 0, 12, 0
        ), (
          ?, '36-Month Rolling', 270,
          0, 0, 0, 36, 0
        )`,
        [categoryId, categoryId, categoryId]
      );

      await this.execute(`COMMIT`);
      return result;
    } catch (error) {
      await this.execute(`ROLLBACK`);
      throw error;
    }
  }

  async loadCategories() {
    return await this.execute<AppCategory>(`SELECT * FROM categories`);
  }

  async insertCategory(name: string, color: string) {
    await this.execute(
      `INSERT INTO categories (
        name, color
      ) VALUES (?, ?)`,
      [name, color]
    );
  }

  async updateCategory(category: AppCategory) {
    const { categoryId, name, color } = category;
    await this.execute(
      `UPDATE categories
      SET
        name = ?,
        color = ?
      WHERE categoryId = ?`,
      [name, color, categoryId]
    );
  }

  async deleteCategory(categoryId: number) {
    await this.execute(`DELETE FROM categories WHERE categoryId = ?`, [
      categoryId,
    ]);
  }

  async loadEvents(categoryId: number) {
    return await this.execute<AppEvent>(
      `SELECT * FROM events WHERE categoryId = ?`,
      [categoryId]
    );
  }

  async insertEvent(
    categoryId: number,
    startDate: number,
    stopDate: number,
    note: string = ""
  ) {
    await this.execute(
      `INSERT INTO events (
        categoryId, startDate, stopDate, note
      ) VALUES (?, ?, ?, ?)`,
      [categoryId, startDate, stopDate, note]
    );
  }

  async updateEvent(event: AppEvent) {
    const { eventId, startDate, stopDate, note } = event;
    await this.execute(
      `UPDATE events
      SET 
        startDate = ?,
        stopDate = ?,
        note = ?
      WHERE eventId = ?`,
      [startDate, stopDate, note, eventId]
    );
  }

  async deleteEvent(eventId: number) {
    await this.execute(`DELETE FROM events WHERE eventId = ?`, [eventId]);
  }

  async loadLimits(categoryId: number) {
    return await this.execute<AppLimit>(
      `SELECT * FROM limits WHERE categoryId = ?`,
      [categoryId]
    );
  }

  async insertLimit(
    categoryId: number,
    name: string,
    value: number,
    startOfYear: number,
    startOfMonth: number,
    yearOffset: number,
    monthOffset: number,
    dayOffset: number
  ) {
    await this.execute(
      `INSERT INTO limits (
        categoryId, name, value,
        startOfYear, startOfMonth,
        yearOffset, monthOffset, dayOffset,
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId,
        name,
        value,
        startOfYear,
        startOfMonth,
        yearOffset,
        monthOffset,
        dayOffset,
      ]
    );
  }

  async updateLimit(limit: AppLimit) {
    await this.execute(
      `UPDATE limits
      SET
        name = ?,
        value = ?,
        startOfYear = ?,
        startOfMonth = ?,
        yearOffset = ?,
        monthOffset = ?,
        dayOffset = ?
      WHERE limitId = ?`,
      [
        limit.name,
        limit.value,
        limit.startOfYear,
        limit.startOfMonth,
        limit.yearOffset,
        limit.monthOffset,
        limit.dayOffset,
        limit.limitId,
      ]
    );
  }

  async deleteLimit(limitId: number) {
    await this.execute(`DELETE FROM limits WHERE limitId = ?`, [limitId]);
  }
}

export default AppDatabase;
