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

export type AppLimit = {
  limitId: number;
} & AppLimitWithoutId;

// Necessary since Omit<> doesn't work with intersection type
export type AppLimitWithoutId = {
  categoryId: number;
  name: string;
  maxDays: number;
} & (AppLimitFixed | AppLimitRunning | AppLimitCustom);

type AppLimitFixed = {
  intervalType: "fixed";
  fixedInterval: "yearly" | "monthly";
  runningAmount: null;
  runningUnit: null;
  customStartDate: null;
  customStopDate: null;
};

type AppLimitRunning = {
  intervalType: "running";
  fixedInterval: null;
  runningAmount: number;
  runningUnit: "year" | "month" | "day";
  customStartDate: null;
  customStopDate: null;
};

type AppLimitCustom = {
  intervalType: "custom";
  fixedInterval: null;
  runningAmount: null;
  runningUnit: null;
  customStartDate: number;
  customStopDate: number;
};

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
  const { year, month, day } = new Date(date).getComponents();
  if (l.intervalType === "fixed") {
    if (l.fixedInterval === "yearly") {
      return new Interval(Date.UTC(year, 0, 1), Date.UTC(year + 1, 0, 0));
    }
    if (l.fixedInterval === "monthly") {
      return new Interval(
        Date.UTC(year, month, 1),
        Date.UTC(year, month + 1, 0)
      );
    }
    throw new Error("Invalid AppLimit fixedInterval");
  }
  if (l.intervalType === "running") {
    const yearOffset = l.runningUnit === "year" ? l.runningAmount : 0;
    const monthOffset = l.runningUnit === "month" ? l.runningAmount : 0;
    const dayOffset = l.runningUnit === "day" ? l.runningAmount : 0;
    return new Interval(
      Date.UTC(year - yearOffset, month - monthOffset, day - dayOffset),
      Date.UTC(year, month, day)
    );
  }
  if (l.intervalType === "custom") {
    return new Interval(l.customStartDate, l.customStopDate);
  }
  throw new Error("Invalid AppLimit type");
}

class AppDatabase {
  db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase("app.v1.0.9-beta.db");
    this.execute(`PRAGMA foreign_keys = ON`);
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
          maxDays           INTEGER NOT NULL CHECK(maxDays >= 0),
          intervalType      TEXT NOT NULL,
          fixedInterval     TEXT,
          runningAmount     INTEGER,
          runningUnit       TEXT,
          customStartDate   INTEGER,
          customStopDate    INTEGER,
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
          categoryId, name, maxDays, intervalType, fixedInterval
        ) VALUES
          (?, 'Yearly', 61, 'fixed', 'yearly')`,
        [categoryId]
      );

      await this.execute(
        `INSERT INTO limits (
          categoryId, name, maxDays, intervalType, runningAmount, runningUnit
        ) VALUES
          (?, '12-Month Running', 183, 'running', 12, 'month'),
          (?, '36-Month Running', 270, 'running', 36, 'month')`,
        [categoryId, categoryId]
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

  async insertCategory(category: Omit<AppCategory, "categoryId">) {
    await this.execute(
      `INSERT INTO categories (
        name, color
      ) VALUES (?, ?)`,
      [category.name, category.color]
    );
  }

  async updateCategory(category: AppCategory) {
    await this.execute(
      `UPDATE categories
      SET
        name = ?,
        color = ?
      WHERE categoryId = ?`,
      [category.name, category.color, category.categoryId]
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

  async insertEvent(event: Omit<AppEvent, "eventId">) {
    await this.execute(
      `INSERT INTO events (
        categoryId, startDate, stopDate, note
      ) VALUES (?, ?, ?, ?)`,
      [event.categoryId, event.startDate, event.stopDate, event.note]
    );
  }

  async updateEvent(event: AppEvent) {
    await this.execute(
      `UPDATE events
      SET 
        startDate = ?,
        stopDate = ?,
        note = ?
      WHERE eventId = ?`,
      [event.startDate, event.stopDate, event.note, event.eventId]
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

  async insertLimit(limit: AppLimitWithoutId) {
    if (limit.intervalType === "fixed") {
      await this.execute(
        `INSERT INTO limits (
          categoryId, name, maxDays,
          intervalType, fixedInterval
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          limit.categoryId,
          limit.name,
          limit.maxDays,
          limit.intervalType,
          limit.fixedInterval,
        ]
      );
    }
    if (limit.intervalType === "running") {
      await this.execute(
        `INSERT INTO limits (
          categoryId, name, maxDays,
          intervalType, runningAmount, runningUnit
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          limit.categoryId,
          limit.name,
          limit.maxDays,
          limit.intervalType,
          limit.runningAmount,
          limit.runningUnit,
        ]
      );
    }
    if (limit.intervalType === "custom") {
      await this.execute(
        `INSERT INTO limits (
          categoryId, name, maxDays,
          intervalType, customStartDate, customStopDate
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          limit.categoryId,
          limit.name,
          limit.maxDays,
          limit.intervalType,
          limit.customStartDate,
          limit.customStopDate,
        ]
      );
    }
  }

  async updateLimit(limit: AppLimit) {
    if (limit.intervalType === "fixed") {
      await this.execute(
        `UPDATE limits
        SET
          name = ?,
          maxDays = ?,
          fixedInterval = ?
        WHERE limitId = ?`,
        [limit.name, limit.maxDays, limit.fixedInterval, limit.limitId]
      );
    }
    if (limit.intervalType === "running") {
      await this.execute(
        `UPDATE limits
        SET
          name = ?,
          maxDays = ?,
          runningAmount = ?,
          runningUnit = ?
        WHERE limitId = ?`,
        [
          limit.name,
          limit.maxDays,
          limit.runningAmount,
          limit.runningUnit,
          limit.limitId,
        ]
      );
    }
    if (limit.intervalType === "custom") {
      await this.execute(
        `UPDATE limits
        SET
          name = ?,
          maxDays = ?,
          customStartDate = ?,
          customStopDate = ?
        WHERE limitId = ?`,
        [
          limit.name,
          limit.maxDays,
          limit.customStartDate,
          limit.customStopDate,
          limit.limitId,
        ]
      );
    }
  }

  async deleteLimit(limitId: number) {
    await this.execute(`DELETE FROM limits WHERE limitId = ?`, [limitId]);
  }
}

export default AppDatabase;
