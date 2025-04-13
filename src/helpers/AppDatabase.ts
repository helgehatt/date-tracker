import * as SQLite from "expo-sqlite";
import migrations from "../migrations";

class AppDatabase {
  db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync("date-tracker.db");
  }

  async init() {
    await this.db.execAsync(`PRAGMA foreign_keys = ON`);
    await this.db.withTransactionAsync(async () => {
      console.log("DB: Initializing...");

      await this.db.runAsync(`CREATE TABLE IF NOT EXISTS migrations (
        version       INTEGER PRIMARY KEY,
        updatedTime   NUMBER NOT NULL
      )`);

      const version = (await this.db.getAllAsync(`SELECT * FROM migrations`))
        .length;

      for (let i = version; i < migrations.length; i++) {
        await migrations[i](this.db);
        await this.db.runAsync(`INSERT INTO migrations VALUES (?, ?)`, [
          i,
          Date.now(),
        ]);
        console.log(`DB: Applied migration ${i}`);
      }
    });
  }

  async loadCategories() {
    return await this.db.getAllAsync<AppCategory>(`SELECT * FROM categories`);
  }

  async insertCategory(category: Omit<AppCategory, "categoryId">) {
    await this.db.runAsync(
      `INSERT INTO categories (
        name, color
      ) VALUES (?, ?)`,
      [category.name, category.color]
    );
  }

  async updateCategory(category: AppCategory) {
    await this.db.runAsync(
      `UPDATE categories
      SET
        name = ?,
        color = ?
      WHERE categoryId = ?`,
      [category.name, category.color, category.categoryId]
    );
  }

  async deleteCategory(categoryId: number) {
    await this.db.runAsync(`DELETE FROM categories WHERE categoryId = ?`, [
      categoryId,
    ]);
  }

  async loadEvents(categoryId: number) {
    return await this.db.getAllAsync<AppEvent>(
      `SELECT * FROM events WHERE categoryId = ?`,
      [categoryId]
    );
  }

  async insertEvent(event: Omit<AppEvent, "eventId">) {
    await this.db.runAsync(
      `INSERT INTO events (
        categoryId, startDate, stopDate, note
      ) VALUES (?, ?, ?, ?)`,
      [event.categoryId, event.startDate, event.stopDate, event.note]
    );
  }

  async updateEvent(event: AppEvent) {
    await this.db.runAsync(
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
    await this.db.runAsync(`DELETE FROM events WHERE eventId = ?`, [eventId]);
  }

  async loadLimits(categoryId: number) {
    return await this.db.getAllAsync<AppLimit>(
      `SELECT * FROM limits WHERE categoryId = ?`,
      [categoryId]
    );
  }

  async insertLimit(limit: Omit<AppLimit, "limitId">) {
    await this.db.runAsync(
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
        customStopDate
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
    await this.db.runAsync(
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
    await this.db.runAsync(`DELETE FROM limits WHERE limitId = ?`, [limitId]);
  }
}

export default AppDatabase;
