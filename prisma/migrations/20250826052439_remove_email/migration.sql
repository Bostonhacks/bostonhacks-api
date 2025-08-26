/*
  Warnings:

  - You are about to drop the column `email` on the `Application` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Application_email_idx";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "email";
