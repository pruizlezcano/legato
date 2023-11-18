-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "file" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "bpm" INTEGER,
    "title" TEXT,
    "status" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_path_key" ON "Project"("path");
