import { SQLiteDatabase } from "expo-sqlite";

export default async function (db: SQLiteDatabase) {
  await db.runAsync(
    `ALTER TABLE limits
      ADD COLUMN isFavorite
      INTEGER NOT NULL DEFAULT 0
      CHECK(isFavorite >= 0 AND isFavorite <= 1)`
  );

  await db.runAsync(
    `UPDATE limits
      SET isFavorite = 1
      WHERE name = 'Yearly' AND limitId = 1`
  );
}
