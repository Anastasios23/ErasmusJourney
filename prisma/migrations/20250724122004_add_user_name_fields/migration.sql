/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_destinations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "climate" TEXT,
    "costOfLiving" JSONB,
    "highlights" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_destinations" ("climate", "costOfLiving", "country", "createdAt", "description", "featured", "highlights", "id", "imageUrl", "name", "updatedAt") SELECT "climate", "costOfLiving", "country", "createdAt", "description", "featured", "highlights", "id", "imageUrl", "name", "updatedAt" FROM "destinations";
DROP TABLE "destinations";
ALTER TABLE "new_destinations" RENAME TO "destinations";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "studentId" TEXT,
    "nationality" TEXT,
    "homeCity" TEXT,
    "homeCountry" TEXT
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerified", "homeCity", "homeCountry", "id", "image", "nationality", "password", "role", "studentId", "updatedAt") SELECT "createdAt", "email", "emailVerified", "homeCity", "homeCountry", "id", "image", "nationality", "password", "role", "studentId", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
