/*
  Warnings:

  - Added the required column `city` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "city" TEXT NOT NULL;
