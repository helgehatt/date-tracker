import * as SQLite from "expo-sqlite";
import migrations from "../migrations";

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
    await this.execute(
      `INSERT INTO limits (
        categoryId,
        name,
        maxDays,
        isFavorite,
        intervalType,
        fixedInterval,
        runningAmount,
        runningUnit,
        customStartDate,
        customStopDate,
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        limit.categoryId,
        limit.name,
        limit.maxDays,
        limit.isFavorite,
        limit.intervalType,
        limit.intervalType === "fixed" ? limit.fixedInterval : null,
        limit.intervalType === "running" ? limit.runningAmount : null,
        limit.intervalType === "running" ? limit.runningUnit : null,
        limit.intervalType === "custom" ? limit.customStartDate : null,
        limit.intervalType === "custom" ? limit.customStopDate : null,
      ]
    );
  }

  async updateLimit(limit: AppLimit) {
    await this.execute(
      `UPDATE limits
      SET
        name = ?,
        maxDays = ?,
        isFavorite = ?,
        intervalType = ?,
        fixedInterval = ?,
        runningAmount = ?,
        runningUnit = ?,
        customStartDate = ?,
        customStopDate = ?
      WHERE limitId = ?`,
      [
        limit.name,
        limit.maxDays,
        limit.isFavorite,
        limit.intervalType,
        limit.intervalType === "fixed" ? limit.fixedInterval : null,
        limit.intervalType === "running" ? limit.runningAmount : null,
        limit.intervalType === "running" ? limit.runningUnit : null,
        limit.intervalType === "custom" ? limit.customStartDate : null,
        limit.intervalType === "custom" ? limit.customStopDate : null,
        limit.limitId,
      ]
    );
  }

  async deleteLimit(limitId: number) {
    await this.execute(`DELETE FROM limits WHERE limitId = ?`, [limitId]);
  }
}

export default AppDatabase;
