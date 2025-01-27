/*
  Warnings:

  - Added the required column `applicationYear` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'FACEBOOK', 'GOOGLE');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "applicationYear" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "password" TEXT;
