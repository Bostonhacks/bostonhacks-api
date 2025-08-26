/*
  Warnings:

  - You are about to drop the column `pronous` on the `Application` table. All the data in the column will be lost.
  - Added the required column `email` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pronouns` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Application_phoneNumber_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "pronous",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "pronouns" TEXT NOT NULL;
