import * as SQLite from "expo-sqlite";

export interface AppEvent {
  event_id: number;
  category_id: number;
  start_date: number;
  stop_date: number;
  note: string;
}

export interface AppTracker {
  tracker_id: number;
  category_id: number;
  name: string;
  limit_: number;
  y1_is_rel: boolean;
  y1_offset: number;
  m1_is_rel: boolean;
  m1_offset: number;
  d1_is_rel: boolean;
  d1_offset: number;
  y2_is_rel: boolean;
  y2_offset: number;
  m2_is_rel: boolean;
  m2_offset: number;
  d2_is_rel: boolean;
  d2_offset: number;
}

export interface AppCategory {
  category_id: number;
  name: string;
  color: string;
}

class AppDatabase {
  db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase("app.v1.0.3-beta.db");
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
          category_id       INTEGER PRIMARY KEY,
          name              TEXT NOT NULL,
          color             TEXT NOT NULL
        )`
      );

      await this.execute(
        `CREATE TABLE events (
          event_id          INTEGER PRIMARY KEY,
          category_id       INTEGER NOT NULL,
          start_date        INTEGER NOT NULL,
          stop_date         INTEGER NOT NULL,
          note              TEXT NOT NULL,
          FOREIGN KEY (category_id)
            REFERENCES categories (category_id)
              ON DELETE CASCADE
              ON UPDATE NO ACTION
        )`
      );

      await this.execute(
        `CREATE TABLE trackers (
          tracker_id        INTEGER PRIMARY KEY,
          category_id       INTEGER NOT NULL,
          name              TEXT NOT NULL,
          limit_            INTEGER NOT NULL,
          y1_is_rel         INTEGER NOT NULL,
          y1_offset         INTEGER NOT NULL,
          m1_is_rel         INTEGER NOT NULL,
          m1_offset         INTEGER NOT NULL,
          d1_is_rel         INTEGER NOT NULL,
          d1_offset         INTEGER NOT NULL,
          y2_is_rel         INTEGER NOT NULL,
          y2_offset         INTEGER NOT NULL,
          m2_is_rel         INTEGER NOT NULL,
          m2_offset         INTEGER NOT NULL,
          d2_is_rel         INTEGER NOT NULL,
          d2_offset         INTEGER NOT NULL,
          FOREIGN KEY (category_id)
            REFERENCES categories (category_id)
              ON DELETE CASCADE
              ON UPDATE NO ACTION
        )`
      );

      await this.execute(
        `INSERT INTO categories (name, color) values ("Norge", "#FF4C29")`
      );

      const result = await this.execute<AppCategory>(
        `SELECT * FROM categories`
      );

      const { category_id } = result[0];
      await this.execute(
        `INSERT INTO trackers (
          category_id, name, limit_,
          y1_is_rel, y1_offset, m1_is_rel, m1_offset, d1_is_rel, d1_offset,
          y2_is_rel, y2_offset, m2_is_rel, m2_offset, d2_is_rel, d2_offset
        )
        VALUES (
          ?, "1 Y", 61,
          1, 0, 0, 0, 0, 1,
          1, 1, 0, 0, 0, 0
        ), (
          ?, "12 M", 183,
          1, 0, 1, -12, 1, 1,
          1, 0, 1, 0, 1, 0
        ), (
          ?, "36 M", 270,
          1, 0, 1, -36, 1, 1,
          1, 0, 1, 0, 1, 0
        )`,
        [category_id, category_id, category_id]
      );

      this.execute("COMMIT");
      return result;
    } catch (error) {
      this.execute("ROLLBACK");
      throw error;
    }
  }

  loadCategories() {
    return this.execute<AppCategory>(`SELECT * FROM categories`);
  }

  loadEvents(category_id: number) {
    return this.execute<AppEvent>(
      `SELECT * FROM events WHERE category_id = ?`,
      [category_id]
    );
  }

  async insertEvent(
    category_id: number,
    start_date: number,
    stop_date: number,
    note: string = ""
  ) {
    await this.execute(
      `INSERT INTO events (category_id, start_date, stop_date, note) values (?, ?, ?, ?)`,
      [category_id, start_date, stop_date, note]
    );
    return this.loadEvents(category_id);
  }

  async updateEvent(event: AppEvent) {
    await this.execute(
      `UPDATE events
      SET 
        start_date = ?,
        stop_date = ?,
        note = ?
      WHERE event_id = ?`,
      [event.start_date, event.stop_date, event.note, event.event_id]
    );
    return this.loadEvents(event.category_id);
  }

  async deleteEvent(event: AppEvent) {
    await this.execute(`DELETE FROM events WHERE event_id = ?`, [
      event.event_id,
    ]);
    return this.loadEvents(event.category_id);
  }

  loadTrackers(category_id: number) {
    return this.execute<AppTracker>(
      `SELECT * FROM trackers WHERE category_id = ?`,
      [category_id]
    );
  }
}

export default AppDatabase;
