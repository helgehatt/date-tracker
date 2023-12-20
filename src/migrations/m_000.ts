export default async function (db: AppDatabase) {
  await db.execute(
    `CREATE TABLE categories (
      categoryId        INTEGER PRIMARY KEY,
      name              TEXT NOT NULL,
      color             TEXT NOT NULL
    )`
  );

  await db.execute(
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

  await db.execute(
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

  await db.execute(
    `INSERT INTO categories (name, color) VALUES ('Norge', '#FF4C29')`
  );

  const result = await db.execute<AppCategory>(`SELECT * FROM categories`);

  const { categoryId } = result[0];

  await db.execute(
    `INSERT INTO limits (
      categoryId, name, maxDays, intervalType, fixedInterval
    ) VALUES
      (?, 'Yearly', 61, 'fixed', 'yearly')`,
    [categoryId]
  );

  await db.execute(
    `INSERT INTO limits (
      categoryId, name, maxDays, intervalType, runningAmount, runningUnit
    ) VALUES
      (?, '12-Month Running', 183, 'running', 12, 'month'),
      (?, '36-Month Running', 270, 'running', 36, 'month')`,
    [categoryId, categoryId]
  );
}
