import * as SQLite from "expo-sqlite";
import migrations from "../migrations";

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
    const yearOffset = l.runningUnit === "year" ? l.runningAmount! : 0;
    const monthOffset = l.runningUnit === "month" ? l.runningAmount! : 0;
    const dayOffset = l.runningUnit === "day" ? l.runningAmount! : 0;
    return new Interval(
      Date.UTC(year - yearOffset, month - monthOffset, day - dayOffset),
      Date.UTC(year, month, day)
    );
  }
  if (l.intervalType === "custom") {
    return new Interval(l.customStartDate!, l.customStopDate!);
  }
  throw new Error("Invalid AppLimit type");
}

class AppDatabase {
  db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase("date-tracker.db");
  }

  execute<T>(sql: string, args: (string | number | null)[] = []): Promise<T[]> {
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
      await this.execute(`PRAGMA foreign_keys = ON`);

      await this.execute(`BEGIN TRANSACTION`);
      console.log("DB: Initializing...");

      await this.execute(`CREATE TABLE IF NOT EXISTS migrations (
        version       INTEGER PRIMARY KEY,
        updatedTime   NUMBER NOT NULL
      )`);

      const version = (await this.execute(`SELECT * FROM migrations`)).length;

      for (let i = version; i < migrations.length; i++) {
        await migrations[i](this);
        await this.execute(`INSERT INTO migrations VALUES (?, ?)`, [
          i,
          Date.now(),
        ]);
        console.log(`DB: Applied migration ${i}`);
      }

      await this.execute(`COMMIT`);
      console.log("DB: Initialized");
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

  async insertLimit(limit: Omit<AppLimit, "limitId">) {
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
          isFavorite = ?,
          fixedInterval = ?
        WHERE limitId = ?`,
        [
          limit.name,
          limit.maxDays,
          limit.isFavorite,
          limit.fixedInterval,
          limit.limitId,
        ]
      );
    }
    if (limit.intervalType === "running") {
      await this.execute(
        `UPDATE limits
        SET
          name = ?,
          maxDays = ?,
          isFavorite = ?,
          runningAmount = ?,
          runningUnit = ?
        WHERE limitId = ?`,
        [
          limit.name,
          limit.maxDays,
          limit.isFavorite,
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
          isFavorite = ?,
          customStartDate = ?,
          customStopDate = ?
        WHERE limitId = ?`,
        [
          limit.name,
          limit.maxDays,
          limit.isFavorite,
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
