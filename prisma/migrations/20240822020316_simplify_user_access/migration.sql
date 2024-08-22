/*
  Warnings:

  - You are about to drop the `UserSessionAccess` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `deviceType` to the `UserSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operatingSystem` to the `UserSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionIpAddress` to the `UserSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserSessionAccess" DROP CONSTRAINT "UserSessionAccess_sessionId_fkey";

-- DropIndex
DROP INDEX "UserSession_userId_key";

-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "deviceType" TEXT NOT NULL,
ADD COLUMN     "operatingSystem" TEXT NOT NULL,
ADD COLUMN     "sessionIpAddress" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserSessionAccess";
