/*
  Warnings:

  - Added the required column `modifiedAt` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "file" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "bpm" INTEGER,
    "title" TEXT,
    "status" TEXT,
    "modifiedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("bpm", "file", "id", "path", "status", "title") SELECT "bpm", "file", "id", "path", "status", "title" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_path_key" ON "Project"("path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
