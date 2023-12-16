export default async function (db: AppDatabase) {
  await db.execute(
    `ALTER TABLE limits
    ADD COLUMN isFavorite
    INTEGER NOT NULL DEFAULT 0
    CHECK(isFavorite >= 0 AND isFavorite <= 1)`
  );
}
