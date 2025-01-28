-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "age" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "diet" TEXT NOT NULL,
    "educationLevel" TEXT NOT NULL,
    "ethnicity" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "github" TEXT NOT NULL,
    "gradYear" INTEGER NOT NULL,
    "linkedin" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "portfolio" TEXT NOT NULL,
    "pronouns" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "shirtSize" TEXT NOT NULL,
    "sleep" BOOLEAN NOT NULL,
    "state" TEXT NOT NULL,
    "whyBostonhacks" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Application_phoneNumber_key" ON "Application"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;