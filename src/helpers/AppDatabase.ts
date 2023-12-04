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
  limit: number;
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
  db: SQLite.Database;

  constructor() {
    this.db = SQLite.openDatabase("app.db");
  }

  init(callback: SQLite.SQLStatementCallback) {
    this.db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE categories (
          category_id       INTEGER PRIMARY KEY,
          name              TEXT NOT NULL UNIQUE,
          color             TEXT NOT NULL
        );

        CREATE TABLE events (
          event_id          INTEGER PRIMARY KEY,
          category_id       INTEGER NOT NULL,
          start_date        INTEGER NOT NULL,
          stop_date         INTEGER NOT NULL,
          note              TEXT NOT NULL,
          FOREIGN KEY (category_id)
            REFERENCES categories (category_id)
              ON DELETE CASCADE
              ON UPDATE NO ACTION
        );

        CREATE TABLE trackers (
          tracker_id        INTEGER PRIMARY KEY,
          category_id       INTEGER NOT NULL,
          name              TEXT NOT NULL,
          limit             INTEGER NOT NULL,
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
        tx.executeSql(
          `INSERT INTO categories (name, color) values ("Norge", "#FF4C29")`
        );
        tx.executeSql(`SELECT * FROM categories`, [], (_, result) => {
          const { category_id } = result.rows._array[0];
          tx.executeSql(
            `INSERT INTO trackers (
              category_id, name, limit,
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
            )
          `,
            [category_id, category_id, category_id]
          );
        });
        tx.executeSql(`SELECT * FROM categories`, [], callback);
      },
      (error) => console.error(error.message)
    );
  }

  loadCategories(callback: SQLite.SQLStatementCallback) {
    this.db.transaction((tx) => {
      tx.executeSql("SELECT * FROM categories", [], callback);
    });
  }

  loadEvents(category_id: number, callback: SQLite.SQLStatementCallback) {
    this.db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM events WHERE category_id = ?",
        [category_id],
        callback
      );
    });
  }

  loadTrackers(category_id: number, callback: SQLite.SQLStatementCallback) {
    this.db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM trackers WHERE category_id = ?",
        [category_id],
        callback
      );
    });
  }
}

export default AppDatabase;
