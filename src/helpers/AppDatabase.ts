import * as SQLite from "expo-sqlite";

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
  fromYearRelative: number;
  fromYearOffset: number;
  fromMonthRelative: number;
  fromMonthOffset: number;
  fromDayRelative: number;
  fromDayOffset: number;
  toYearRelative: number;
  toYearOffset: number;
  toMonthRelative: number;
  toMonthOffset: number;
  toDayRelative: number;
  toDayOffset: number;
}

export interface AppCategory {
  categoryId: number;
  name: string;
  color: string;
}

class AppDatabase {
  db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase("app.v1.0.4-beta.db");
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
          fromYearRelative  INTEGER NOT NULL CHECK(fromYearRelative >= 0 AND fromYearRelative <= 1),
          fromYearOffset    INTEGER NOT NULL,
          fromMonthRelative INTEGER NOT NULL CHECK(fromMonthRelative >= 0 AND fromMonthRelative <= 1),
          fromMonthOffset   INTEGER NOT NULL,
          fromDayRelative   INTEGER NOT NULL CHECK(fromDayRelative >= 0 AND fromDayRelative <= 1),
          fromDayOffset     INTEGER NOT NULL,
          toYearRelative    INTEGER NOT NULL CHECK(toYearRelative >= 0 AND toYearRelative <= 1),
          toYearOffset      INTEGER NOT NULL,
          toMonthRelative   INTEGER NOT NULL CHECK(toMonthRelative >= 0 AND toMonthRelative <= 1),
          toMonthOffset     INTEGER NOT NULL,
          toDayRelative     INTEGER NOT NULL CHECK(toDayRelative >= 0 AND toDayRelative <= 1),
          toDayOffset       INTEGER NOT NULL,
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
          fromYearRelative,  fromYearOffset,
          fromMonthRelative, fromMonthOffset,
          fromDayRelative,   fromDayOffset,
          toYearRelative,    toYearOffset,
          toMonthRelative,   toMonthOffset,
          toDayRelative,     toDayOffset
        )
        VALUES (
          ?, '1 Y', 61,
          1, 0, 0, 0, 0, 1,
          1, 1, 0, 0, 0, 0
        ), (
          ?, '12 M', 183,
          1, 0, 1, -12, 1, 1,
          1, 0, 1, 0, 1, 0
        ), (
          ?, '36 M', 270,
          1, 0, 1, -36, 1, 1,
          1, 0, 1, 0, 1, 0
        )`,
        [categoryId, categoryId, categoryId]
      );

      this.execute(`COMMIT`);
      return result;
    } catch (error) {
      this.execute(`ROLLBACK`);
      throw error;
    }
  }

  loadCategories() {
    return this.execute<AppCategory>(`SELECT * FROM categories`);
  }

  loadEvents(categoryId: number) {
    return this.execute<AppEvent>(`SELECT * FROM events WHERE categoryId = ?`, [
      categoryId,
    ]);
  }

  async insertCategory(name: string, color: string) {
    await this.execute(
      `INSERT INTO categories (
        name, color
      ) VALUES (?, ?)`,
      [name, color]
    );
    return this.loadCategories();
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
    return this.loadCategories();
  }

  async deleteCategory(categoryId: number) {
    await this.execute(`DELETE FROM categories WHERE categoryId = ?`, [
      categoryId,
    ]);
    return this.loadCategories();
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
    return this.loadEvents(categoryId);
  }

  async updateEvent(event: AppEvent) {
    const { eventId, categoryId, startDate, stopDate, note } = event;
    await this.execute(
      `UPDATE events
      SET 
        startDate = ?,
        stopDate = ?,
        note = ?
      WHERE eventId = ?`,
      [startDate, stopDate, note, eventId]
    );
    return this.loadEvents(categoryId);
  }

  async deleteEvent(event: AppEvent) {
    await this.execute(`DELETE FROM events WHERE eventId = ?`, [event.eventId]);
    return this.loadEvents(event.categoryId);
  }

  loadLimits(categoryId: number) {
    return this.execute<AppLimit>(`SELECT * FROM limits WHERE categoryId = ?`, [
      categoryId,
    ]);
  }
}

export default AppDatabase;
